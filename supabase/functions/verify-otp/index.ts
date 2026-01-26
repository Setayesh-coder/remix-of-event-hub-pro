import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash OTP using SHA-256 (same as request-otp)
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return base64Encode(new Uint8Array(hashBuffer));
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    // Validate inputs
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "شماره تلفن نامعتبر است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "کد تأیید نامعتبر است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the latest pending OTP for this phone
    const { data: otpData, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      return new Response(
        JSON.stringify({ error: "خطا در بررسی کد تأیید" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpData) {
      return new Response(
        JSON.stringify({ error: "کد تأیید یافت نشد. لطفاً کد جدید درخواست کنید." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date() > new Date(otpData.expires_at)) {
      await supabase
        .from("otp_codes")
        .update({ status: "expired" })
        .eq("id", otpData.id);

      return new Response(
        JSON.stringify({ error: "کد تأیید منقضی شده است. لطفاً کد جدید درخواست کنید." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check max attempts
    if (otpData.attempts >= otpData.max_attempts) {
      await supabase
        .from("otp_codes")
        .update({ status: "expired" })
        .eq("id", otpData.id);

      return new Response(
        JSON.stringify({ error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کد جدید درخواست کنید." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment attempts
    await supabase
      .from("otp_codes")
      .update({ attempts: otpData.attempts + 1 })
      .eq("id", otpData.id);

    // Verify code
    const codeHash = await hashOTP(code);
    if (codeHash !== otpData.code_hash) {
      const remainingAttempts = otpData.max_attempts - otpData.attempts - 1;
      return new Response(
        JSON.stringify({ 
          error: `کد تأیید اشتباه است. ${remainingAttempts} تلاش باقی مانده.`,
          remainingAttempts 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from("otp_codes")
      .update({ status: "verified" })
      .eq("id", otpData.id);

    // Check if user exists by looking up profile with this phone
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", phone)
      .maybeSingle();

    let userId: string;
    let isNewUser = false;

    if (existingProfile) {
      userId = existingProfile.user_id;
    } else {
      // Create new user with a generated email (phone-based)
      const tempEmail = `${phone}@phone.auth.local`;
      const tempPassword = crypto.randomUUID();

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { phone },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "خطا در ایجاد حساب کاربری" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Update profile with phone
      await supabase
        .from("profiles")
        .update({ phone })
        .eq("user_id", userId);
    }

    // Generate a session for the user using signInWithPassword internally
    // We need to get the user's email to sign them in
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    if (!userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "خطا در بازیابی اطلاعات کاربر" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a one-time token for the user to exchange for a session
    // We'll use a custom approach: store a session token in the response
    // that the client can use
    
    // For Supabase, we can use the admin API to create a session
    // But a better approach is to use a custom signed token
    
    // Create a simple signed token that expires in 5 minutes
    const sessionToken = crypto.randomUUID();
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    // Store the session token temporarily
    await supabase
      .from("otp_codes")
      .insert({
        phone,
        code_hash: sessionToken, // Reuse table for session tokens
        status: "session_pending",
        expires_at: tokenExpiry.toISOString(),
      });

    console.log(`User ${isNewUser ? 'created' : 'verified'}: ${phone}, userId: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        userId,
        sessionToken,
        isNewUser,
        message: isNewUser ? "حساب کاربری ایجاد شد" : "ورود موفق"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verify OTP error:", error);
    return new Response(
      JSON.stringify({ error: "خطای سرور" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
