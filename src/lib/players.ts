import type { User } from "@supabase/supabase-js";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";
import type { Player } from "@/types/domain";

function readString(source: Record<string, unknown> | undefined, key: string) {
  const value = source?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getDiscordProfile(user: User) {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const discordIdentity = user.identities?.find((identity) => identity.provider === "discord");
  const identityData = discordIdentity?.identity_data as Record<string, unknown> | undefined;

  const discordId =
    readString(metadata, "provider_id") ??
    readString(metadata, "sub") ??
    readString(identityData, "provider_id") ??
    readString(identityData, "sub") ??
    null;

  const username =
    readString(metadata, "custom_claims.global_name") ??
    readString(metadata, "global_name") ??
    readString(metadata, "preferred_username") ??
    readString(metadata, "user_name") ??
    readString(metadata, "name") ??
    readString(metadata, "full_name") ??
    readString(identityData, "global_name") ??
    readString(identityData, "preferred_username") ??
    readString(identityData, "user_name") ??
    readString(identityData, "name") ??
    user.email ??
    "Discord Player";

  const avatarUrl =
    readString(metadata, "avatar_url") ??
    readString(metadata, "picture") ??
    readString(identityData, "avatar_url") ??
    readString(identityData, "picture");

  if (!discordId) {
    throw new Error("Discord OAuth profile did not include a Discord ID.");
  }

  return {
    discordId,
    username,
    avatarUrl
  };
}

export async function upsertPlayerForDiscordUser(user: User): Promise<Player> {
  const profile = getDiscordProfile(user);
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("players")
    .upsert(
      {
        auth_user_id: user.id,
        discord_id: profile.discordId,
        username: profile.username,
        avatar_url: profile.avatarUrl
      },
      { onConflict: "discord_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
