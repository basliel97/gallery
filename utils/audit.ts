import { createClient } from "@/utils/supabase/server";

export async function logAuditEvent(
  action: string,
  details?: Record<string, string>
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

export async function getAuditLogs(limit = 10) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}