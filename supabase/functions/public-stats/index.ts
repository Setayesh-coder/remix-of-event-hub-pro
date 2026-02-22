import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Run all queries in parallel
    const [
      usersCount,
      proposalsCount,
      workshopCount,
      webinarCount,
      trainingCount,
      schedulesCount,
      cartReservations,
      userCoursesCount,
      universityStats,
      provinceStats,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("proposals").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("category", "workshop"),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("category", "webinar"),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("category", "training"),
      supabase.from("schedules").select("id", { count: "exact", head: true }),
      supabase.from("cart_items").select("id", { count: "exact", head: true }),
      supabase.from("user_courses").select("id", { count: "exact", head: true }),
      supabase.from("users").select("university"),
      supabase.from("users").select("residence"),
    ]);

    // Process university distribution
    const universities: Record<string, number> = {};
    if (universityStats.data) {
      for (const u of universityStats.data) {
        const name = (u as any).university || "نامشخص";
        universities[name] = (universities[name] || 0) + 1;
      }
    }

    // Process province distribution
    const provinces: Record<string, number> = {};
    if (provinceStats.data) {
      for (const p of provinceStats.data) {
        const name = (p as any).residence || "نامشخص";
        provinces[name] = (provinces[name] || 0) + 1;
      }
    }

    // Sort and take top entries
    const topUniversities = Object.entries(universities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topProvinces = Object.entries(provinces)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    // Count upcoming schedules (future)
    const upcomingSchedules = schedulesCount.count || 0;

    // Count partner logos from site_settings
    const { data: logosSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "logos")
      .single();

    let partnerCount = 0;
    if (logosSetting?.value) {
      try {
        partnerCount = JSON.parse(logosSetting.value).length;
      } catch {}
    }

    const stats = {
      totalUsers: usersCount.count || 0,
      totalProposals: proposalsCount.count || 0,
      totalWorkshops: workshopCount.count || 0,
      totalWebinars: webinarCount.count || 0,
      totalTrainings: trainingCount.count || 0,
      upcomingSchedules,
      partnerCount,
      totalReservations: (cartReservations.count || 0) + (userCoursesCount.count || 0),
      topUniversities,
      topProvinces,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
