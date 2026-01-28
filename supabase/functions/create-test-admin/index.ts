import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test admin credentials
    const testAdmin = {
      phone: "09123456789",
      email: "admin@test.com",
      password: "Admin@123456",
      fullName: "مدیر سیستم"
    };

    // Test regular user credentials
    const testUser = {
      phone: "09111111111",
      email: "user@test.com",
      password: "User@123456",
      fullName: "کاربر تست"
    };

    const results: any[] = [];

    // Create test admin
    console.log("Creating test admin...");
    
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", testAdmin.phone)
      .maybeSingle();

    if (!existingAdmin) {
      // Create admin user in auth.users
      const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
        email: testAdmin.email,
        password: testAdmin.password,
        email_confirm: true,
        user_metadata: {
          phone: testAdmin.phone,
          full_name: testAdmin.fullName
        }
      });

      if (adminError) {
        console.error("Admin creation error:", adminError);
        results.push({ type: "admin", error: adminError.message });
      } else if (adminUser.user) {
        // Update profile with phone
        await supabase
          .from("profiles")
          .update({ 
            phone: testAdmin.phone,
            full_name: testAdmin.fullName
          })
          .eq("user_id", adminUser.user.id);

        // Add admin role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ 
            user_id: adminUser.user.id, 
            role: "admin" 
          });

        if (roleError) {
          console.error("Admin role error:", roleError);
        }

        results.push({ 
          type: "admin", 
          success: true, 
          phone: testAdmin.phone,
          email: testAdmin.email,
          password: testAdmin.password,
          userId: adminUser.user.id
        });
        console.log("Test admin created:", adminUser.user.id);
      }
    } else {
      results.push({ 
        type: "admin", 
        message: "Admin already exists",
        phone: testAdmin.phone
      });
    }

    // Create test user
    console.log("Creating test user...");
    
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", testUser.phone)
      .maybeSingle();

    if (!existingUser) {
      const { data: regularUser, error: userError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          phone: testUser.phone,
          full_name: testUser.fullName
        }
      });

      if (userError) {
        console.error("User creation error:", userError);
        results.push({ type: "user", error: userError.message });
      } else if (regularUser.user) {
        // Update profile with phone
        await supabase
          .from("profiles")
          .update({ 
            phone: testUser.phone,
            full_name: testUser.fullName
          })
          .eq("user_id", regularUser.user.id);

        // Add user role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ 
            user_id: regularUser.user.id, 
            role: "user" 
          });

        if (roleError) {
          console.error("User role error:", roleError);
        }

        results.push({ 
          type: "user", 
          success: true, 
          phone: testUser.phone,
          email: testUser.email,
          password: testUser.password,
          userId: regularUser.user.id
        });
        console.log("Test user created:", regularUser.user.id);
      }
    } else {
      results.push({ 
        type: "user", 
        message: "User already exists",
        phone: testUser.phone
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        testCredentials: {
          admin: {
            phone: testAdmin.phone,
            email: testAdmin.email,
            password: testAdmin.password,
            description: "ورود با شماره + OTP + رمز عبور"
          },
          user: {
            phone: testUser.phone,
            email: testUser.email,
            password: testUser.password,
            description: "ورود با شماره + OTP"
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Create test users error:", error);
    return new Response(
      JSON.stringify({ error: "خطای سرور", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
