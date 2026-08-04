import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const database = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "method_not_allowed" }, 405);

  try {
    const { action, visitorId } = await request.json();
    if (typeof visitorId !== "string" || visitorId.length < 1 || visitorId.length > 128) {
      return response({ error: "invalid_visitor" }, 400);
    }

    const procedure = action === "visit" || action === "heartbeat"
      ? "quiet_record_visit"
      : action === "knock"
        ? "quiet_record_knock"
        : action === "stats"
          ? "quiet_stats_snapshot"
          : null;
    if (!procedure) return response({ error: "invalid_action" }, 400);

    const parameters = procedure === "quiet_stats_snapshot" ? {} : { p_visitor_id: visitorId };
    const { data, error } = await database.rpc(procedure, parameters);
    if (error) {
      console.error(error);
      return response({ error: "stats_unavailable" }, 500);
    }
    return response(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    console.error(error);
    return response({ error: "bad_request" }, 400);
  }
});
