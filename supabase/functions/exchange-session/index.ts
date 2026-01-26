import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, userId } = await req.json();

    if (!sessionToken || !userId) {
      return new Response(
        JSON.stringify({ error: "پارامترهای نامعتبر" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify session token
    const { data: tokenData, error: tokenError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("code_hash", sessionToken)
      .eq("status", "session_pending")
      .maybeSingle();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date() > new Date(tokenData.expires_at)) {
      await supabase
        .from("otp_codes")
        .update({ status: "expired" })
        .eq("id", tokenData.id);

      return new Response(
        JSON.stringify({ error: "توکن منقضی شده است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark token as used
    await supabase
      .from("otp_codes")
      .update({ status: "verified" })
      .eq("id", tokenData.id);

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "کاربر یافت نشد" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a proper session using admin API
    // Update the user's password and sign them in
    const tempPassword = crypto.randomUUID();
    
    // Use updateUserById instead of updateUser
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: tempPassword,
    });

    if (updateError) {
      console.error("Update user error:", updateError);
      return new Response(
        JSON.stringify({ error: "خطا در بروزرسانی کاربر" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Now create a regular Supabase client and sign in
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: userData.user.email!,
      password: tempPassword,
    });

    if (signInError || !signInData.session) {
      console.error("Sign in error:", signInError);
      return new Response(
        JSON.stringify({ error: "خطا در ایجاد نشست" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Session created for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session: signInData.session,
        user: signInData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Exchange session error:", error);
    return new Response(
      JSON.stringify({ error: "خطای سرور" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
