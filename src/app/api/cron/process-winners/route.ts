import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: prevWeek, error: weekError } = await supabase.rpc(
    "get_previous_week_year"
  );

  if (weekError) {
    return NextResponse.json({ error: weekError.message }, { status: 500 });
  }

  const { data: count, error: winnersError } = await supabase.rpc(
    "process_weekly_winners",
    { p_week_year: prevWeek }
  );

  if (winnersError) {
    return NextResponse.json({ error: winnersError.message }, { status: 500 });
  }

  return NextResponse.json({ week: prevWeek, winners: count });
}
