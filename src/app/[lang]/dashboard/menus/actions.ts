"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { SITE_URL, isLocale, type Locale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { CODES_PER_HOUR, PLAN_LIMITS, canCreateDynamicCode } from "@/lib/dynamic/plans";
import { generateSlug } from "@/lib/dynamic/slug";
import {
  DAYS,
  FILE_TYPES,
  MAX_FILE_BYTES,
  MENU_BUCKET,
  isFileMime,
  isMenuLang,
  isMenuPath,
  menuFolder,
  menuTag,
  normalizePhone,
  normalizeWhatsapp,
  parseHours,
  parseSections,
  type MenuLang,
} from "@/lib/menu/menu";
import { normalizeColor } from "@/lib/review/kit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type MenuActionState = { error?: string; ok?: boolean } | null;

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "en");
  return isLocale(value) ? value : "en";
}

const menusPath = (locale: Locale, suffix = "") => `${locale === "fr" ? "/fr" : ""}/dashboard/menus${suffix}`;
const publicMenuUrl = (slug: string) => `${SITE_URL}/m/${slug}`;

type OwnedMenu = { id: string; workspace_id: string; mode: string; file_path: string | null; languages: MenuLang[]; slug: string };

// Reads the menu as the user, so row-level security confirms it is theirs.
// Plan-gated columns are then written with the service role.
async function ownedMenu(id: string): Promise<OwnedMenu | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menus")
    .select("id, workspace_id, mode, file_path, languages, qr_codes(short_slug)")
    .eq("id", id)
    .maybeSingle();
  const slug = (data?.qr_codes as unknown as { short_slug: string } | null)?.short_slug;
  if (!data || !slug) return null;
  return { ...data, languages: data.languages as MenuLang[], slug };
}

function refresh(locale: Locale, menu: OwnedMenu) {
  revalidateTag(menuTag(menu.slug), { expire: 0 });
  revalidatePath(menusPath(locale, `/${menu.id}`));
}

export async function createMenu(_prev: MenuActionState, formData: FormData): Promise<MenuActionState> {
  const locale = localeFrom(formData);
  const account = await requireAccount(locale);
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const language = String(formData.get("language") ?? locale);
  if (!title || !isMenuLang(language)) return { error: "generic" };

  const admin = createAdminClient();
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const [{ count: codes }, { count: recent }, { count: menus }] = await Promise.all([
    admin.from("qr_codes").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId),
    admin.from("qr_codes").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId).gte("created_at", hourAgo),
    admin.from("menus").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId),
  ]);
  if ((menus ?? 0) >= PLAN_LIMITS[account.plan].menus) return { error: "menuLimit" };
  if (!canCreateDynamicCode(account.plan, codes ?? 0)) return { error: "limit" };
  if ((recent ?? 0) >= CODES_PER_HOUR) return { error: "rateLimit" };

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const { data: code, error } = await admin
      .from("qr_codes")
      .insert({ workspace_id: account.workspaceId, short_slug: slug, name: title, type: "menu", destination_url: publicMenuUrl(slug) })
      .select("id")
      .single();
    if (error?.code === "23505") continue;
    if (!code) return { error: "generic" };

    const { data: menu } = await admin
      .from("menus")
      .insert({
        workspace_id: account.workspaceId,
        qr_code_id: code.id,
        title,
        languages: [language],
        mode: PLAN_LIMITS[account.plan].menuBuilder ? "builder" : "file",
      })
      .select("id")
      .single();
    if (!menu) {
      await admin.from("qr_codes").delete().eq("id", code.id);
      return { error: "generic" };
    }
    revalidatePath(menusPath(locale));
    redirect(menusPath(locale, `/${menu.id}`));
  }
  return { error: "generic" };
}

// Languages arrive as the default first, then any extra checked ones. A
// lapsed plan keeps the languages it already has; it just cannot add more.
function parseLanguages(formData: FormData, current: MenuLang[], max: number): MenuLang[] | null {
  const chosen = [String(formData.get("defaultLanguage") ?? ""), ...formData.getAll("languages").map(String)];
  const languages = [...new Set(chosen)].filter(isMenuLang);
  if (languages.length === 0 || languages[0] !== chosen[0]) return null;
  const unchanged = languages.length === current.length && languages.every((l) => current.includes(l));
  return unchanged || languages.length <= max ? languages : null;
}

export async function updateMenuDetails(_prev: MenuActionState, formData: FormData): Promise<MenuActionState> {
  const locale = localeFrom(formData);
  const account = await requireAccount(locale);
  const menu = await ownedMenu(String(formData.get("id") ?? ""));
  if (!menu) return { error: "generic" };

  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  if (!title) return { error: "generic" };
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (phone === undefined) return { error: "phone" };
  const whatsapp = normalizeWhatsapp(String(formData.get("whatsapp") ?? ""));
  if (whatsapp === undefined) return { error: "whatsapp" };

  const languages = parseLanguages(formData, menu.languages, PLAN_LIMITS[account.plan].menuLanguages);
  if (!languages) return { error: "languages" };

  const rawHours: Record<string, unknown> = {};
  for (const day of DAYS) {
    if (formData.get(`closed_${day}`) === "on") rawHours[day] = null;
    else if (formData.get(`open_${day}`) && formData.get(`close_${day}`)) {
      rawHours[day] = { open: formData.get(`open_${day}`), close: formData.get(`close_${day}`) };
    }
  }

  const { error } = await createAdminClient()
    .from("menus")
    .update({
      title,
      languages,
      phone,
      whatsapp,
      opening_hours: parseHours(rawHours),
      theme: { color: normalizeColor(String(formData.get("color") ?? "")) },
    })
    .eq("id", menu.id);
  if (error) return { error: "generic" };
  refresh(locale, menu);
  return { ok: true };
}

export async function setMenuMode(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const account = await requireAccount(locale);
  const menu = await ownedMenu(String(formData.get("id") ?? ""));
  const mode = formData.get("mode") === "builder" ? "builder" : "file";
  if (!menu || (mode === "builder" && !PLAN_LIMITS[account.plan].menuBuilder)) return;
  await createAdminClient().from("menus").update({ mode }).eq("id", menu.id);
  refresh(locale, menu);
}

export async function saveMenuSections(locale: Locale, id: string, raw: unknown): Promise<MenuActionState> {
  const account = await requireAccount(locale);
  if (!PLAN_LIMITS[account.plan].menuBuilder) return { error: "builderLocked" };
  const menu = await ownedMenu(id);
  if (!menu) return { error: "generic" };
  const sections = parseSections(raw, menu.languages, (path) => isMenuPath(path, menu.workspace_id, menu.id));
  if (!sections) return { error: "menuInvalid" };

  const admin = createAdminClient();
  const { error } = await admin.from("menus").update({ sections }).eq("id", menu.id);
  if (error) return { error: "generic" };
  await removeUnusedFiles(menu, [menu.file_path, ...sections.flatMap((s) => s.items.map((i) => i.photo))]);
  refresh(locale, menu);
  return { ok: true };
}

export type UploadTicket = { path: string; token: string } | { error: string };

// Uploads go straight from the browser to Storage with a one-time signed URL,
// so large files never pass through our server. Size and type are checked
// here and again by the bucket's own limits.
export async function startMenuUpload(locale: Locale, id: string, kind: "file" | "photo", mime: string, size: number): Promise<UploadTicket> {
  const account = await requireAccount(locale);
  if (!isFileMime(mime) || (kind === "photo" && mime === "application/pdf")) return { error: "file" };
  if (!(size > 0 && size <= MAX_FILE_BYTES)) return { error: "fileSize" };
  if (kind === "photo" && !PLAN_LIMITS[account.plan].menuBuilder) return { error: "builderLocked" };
  const menu = await ownedMenu(id);
  if (!menu) return { error: "generic" };

  const name = `${kind}-${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}.${FILE_TYPES[mime]}`;
  const { data, error } = await createAdminClient()
    .storage.from(MENU_BUCKET)
    .createSignedUploadUrl(`${menuFolder(menu.workspace_id, menu.id)}${name}`);
  if (error || !data) return { error: "generic" };
  return { path: data.path, token: data.token };
}

export async function finishMenuFile(locale: Locale, id: string, path: string): Promise<MenuActionState> {
  await requireAccount(locale);
  const menu = await ownedMenu(id);
  if (!menu || !isMenuPath(path, menu.workspace_id, menu.id) || !path.split("/").pop()!.startsWith("file-")) return { error: "generic" };

  const admin = createAdminClient();
  const name = path.split("/").pop()!;
  const { data: objects } = await admin.storage.from(MENU_BUCKET).list(menuFolder(menu.workspace_id, menu.id).slice(0, -1), { search: name });
  if (!objects?.some((o) => o.name === name)) return { error: "generic" };

  const { error } = await admin
    .from("menus")
    .update({ file_path: path, file_type: path.endsWith(".pdf") ? "pdf" : "image" })
    .eq("id", menu.id);
  if (error) return { error: "generic" };
  if (menu.file_path && menu.file_path !== path) await admin.storage.from(MENU_BUCKET).remove([menu.file_path]);
  refresh(locale, menu);
  return { ok: true };
}

// Photos uploaded but never saved, or removed from the menu, are deleted once
// they are an hour old (younger ones may belong to an unsaved edit).
async function removeUnusedFiles(menu: OwnedMenu, keep: (string | null)[]) {
  const admin = createAdminClient();
  const folder = menuFolder(menu.workspace_id, menu.id);
  const { data: objects } = await admin.storage.from(MENU_BUCKET).list(folder.slice(0, -1), { limit: 1000 });
  const hourAgo = Date.now() - 3600_000;
  const stale = (objects ?? [])
    .filter((o) => !keep.includes(`${folder}${o.name}`) && o.created_at && Date.parse(o.created_at) < hourAgo)
    .map((o) => `${folder}${o.name}`);
  if (stale.length > 0) await admin.storage.from(MENU_BUCKET).remove(stale);
}
