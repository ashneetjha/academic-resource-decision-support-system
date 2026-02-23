import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Placeholder Supabase client — replace credentials in .env.local for real integration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example realtime subscription helper (placeholder)
export function subscribeToAlerts(
    callback: (payload: unknown) => void
): () => void {
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
        console.info("[ARIA] Supabase not configured — realtime disabled");
        return () => { };
    }

    const channel = supabase
        .channel("aria-alerts")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "alerts" },
            callback
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
