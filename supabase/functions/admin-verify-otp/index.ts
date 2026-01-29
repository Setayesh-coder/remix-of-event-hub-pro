import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminVerifyRequest {
  phone: string;
  code: string;
  password: string;
}

// Hash OTP using SHA-256 with base64 encoding (same as request-otp)
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, code, password } = (await req.json()) as AdminVerifyRequest;

    console.log("Admin verify request for phone:", phone);

    // Validate input
    if (!phone || !code || !password) {
      return new Response(
        JSON.stringify({ error: "شماره تلفن، کد تأیید و رمز عبور الزامی است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/[\s\-]/g, "");
    if (normalizedPhone.startsWith("+98")) {
      normalizedPhone = "0" + normalizedPhone.slice(3);
    } else if (normalizedPhone.startsWith("98")) {
      normalizedPhone = "0" + normalizedPhone.slice(2);
    }

    console.log("Normalized phone:", normalizedPhone);

    // 1. Verify OTP first
    const now = new Date().toISOString();
    const { data: otpRecord, error: otpFetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", normalizedPhone)
      .eq("status", "pending")
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpFetchError) {
      console.error("OTP fetch error:", otpFetchError);
      return new Response(
        JSON.stringify({ error: "خطا در بررسی کد تأیید" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      console.log("No pending OTP found for phone:", normalizedPhone);
      return new Response(
        JSON.stringify({ error: "کد تأیید یافت نشد یا منقضی شده است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      await supabase
        .from("otp_codes")
        .update({ status: "expired" })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "تعداد تلاش‌های مجاز تمام شده است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment attempts
    await supabase
      .from("otp_codes")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    // Hash the provided code using base64 (matching request-otp)
    const codeHash = await hashOTP(code);
    
    console.log("Code verification - stored hash:", otpRecord.code_hash.substring(0, 20) + "...");
    console.log("Code verification - computed hash:", codeHash.substring(0, 20) + "...");

    if (codeHash !== otpRecord.code_hash) {
      const remaining = otpRecord.max_attempts - otpRecord.attempts - 1;
      return new Response(
        JSON.stringify({ error: `کد تأیید نادرست است. ${remaining} تلاش باقی مانده.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_codes")
      .update({ status: "used" })
      .eq("id", otpRecord.id);

    console.log("OTP verified successfully for admin phone:", normalizedPhone);

    // 2. Find user by phone in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ error: "خطا در بررسی کاربر" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile) {
      console.log("No profile found for phone:", normalizedPhone);
      return new Response(
        JSON.stringify({ error: "کاربری با این شماره یافت نشد" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found profile with user_id:", profile.user_id);

    // 3. Check if user is admin
    const { data: adminRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: "خطا در بررسی نقش کاربر" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminRole) {
      console.log("User is not an admin:", profile.user_id);
      return new Response(
        JSON.stringify({ error: "شما دسترسی ادمین ندارید" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User has admin role");

    // 4. Get user's email from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.user_id);

    if (authError || !authUser.user) {
      console.error("Auth user fetch error:", authError);
      return new Response(
        JSON.stringify({ error: "خطا در دریافت اطلاعات کاربر" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Verify password using signInWithPassword
    const userEmail = authUser.user.email;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "ایمیل کاربر یافت نشد" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Attempting sign in for email:", userEmail);

    // Create an anonymous client to attempt sign in
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey);

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError.message);
      return new Response(
        JSON.stringify({ error: "رمز عبور نادرست است" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin logged in successfully:", profile.user_id);

    return new Response(
      JSON.stringify({
        success: true,
        session: signInData.session,
        user: signInData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Admin verify OTP error:", error);
    return new Response(
      JSON.stringify({ error: "خطای سرور" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
