import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MemberAccessRow = {
  offer_slug: string;
  access_status: string;
  created_at: string;
};

export const getCurrentUserWithAccess = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { user: null, accessRows: [] as MemberAccessRow[] };
  }

  const { data } = await supabase
    .from("member_access")
    .select("offer_slug, access_status, created_at")
    .eq("email", user.email)
    .order("created_at", { ascending: false });

  return {
    user,
    accessRows: (data ?? []) as MemberAccessRow[],
  };
});

export function hasActiveAccess(
  accessRows: MemberAccessRow[],
  offerSlug: string,
) {
  return accessRows.some(
    (row) => row.offer_slug === offerSlug && row.access_status === "active",
  );
}
