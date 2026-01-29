import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP using SHA-256
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
    const { phone } = await req.json();

    // Validate phone number (Iranian format: 09xxxxxxxxx)
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "شماره تلفن نامعتبر است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Invalidate any existing pending OTPs for this phone
    await supabase
      .from("otp_codes")
      .update({ status: "expired" })
      .eq("phone", phone)
      .eq("status", "pending");

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        phone,
        code_hash: otpHash,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error inserting OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "خطا در ایجاد کد تأیید" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if in development mode (no SMS sending)
    const devModeValue = Deno.env.get("DEV_MODE");
    const isDev = devModeValue === "true" || devModeValue === "1" || devModeValue === "yes";
    
    console.log(`DEV_MODE check: value="${devModeValue}", isDev=${isDev}`);
    
    if (isDev) {
      // In development mode, just log the OTP
      console.log(`📱 [DEV MODE] OTP for ${phone}: ${otp}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "کد تأیید ارسال شد",
          expiresIn: 300,
          // Only include OTP in dev mode for testing
          devOtp: otp
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via IPPanel SMS
    const apiKey = Deno.env.get("IPPANEL_API_KEY");
    if (!apiKey) {
      console.error("IPPANEL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "سرویس پیامک پیکربندی نشده است" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // IPPanel API call
    const smsResponse = await fetch("https://api2.ippanel.com/api/v1/sms/send/webservice/single", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
      },
      body: JSON.stringify({
        recipient: [phone],
        sender: "+983000505",
        message: `کد تأیید شما: ${otp}\nاعتبار: ۵ دقیقه`,
      }),
    });

    if (!smsResponse.ok) {
      const smsError = await smsResponse.text();
      console.error("SMS send error:", smsError);
      return new Response(
        JSON.stringify({ error: "خطا در ارسال پیامک" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent to ${phone}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "کد تأیید ارسال شد",
        expiresIn: 300
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Request OTP error:", error);
    return new Response(
      JSON.stringify({ error: "خطای سرور" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
