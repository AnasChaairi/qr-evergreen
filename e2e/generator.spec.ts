import { expect, test } from "@playwright/test";

test("WiFi tool page makes a code and downloads all formats", async ({ page }) => {
  await page.goto("/wifi-qr-code");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("WiFi QR code generator");

  const download = page.getByRole("button", { name: "PNG" });
  await expect(download).toBeDisabled();

  await page.getByLabel("Network name (SSID)").fill("Cafe Guest");
  await page.getByLabel("Password").fill("croissant42");
  await expect(page.getByRole("img", { name: "Preview" })).toBeVisible();

  for (const format of ["PNG", "SVG", "PDF"]) {
    const [file] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: format }).click(),
    ]);
    expect(file.suggestedFilename()).toBe(`qr-evergreen-wifi.${format.toLowerCase()}`);
  }
});

test("frame and logo options render", async ({ page }) => {
  await page.goto("/fr/qr-code-lien");
  await page.getByLabel("Adresse du site").fill("exemple.fr/menu");
  await page.getByLabel("Ajouter un cadre avec un appel à l'action").check();
  await expect(page.getByLabel("Texte du cadre")).toHaveValue("Scannez-moi");
  await expect(page.getByRole("img", { name: "Aperçu" })).toBeVisible();
});

test("home page switches code type and shows validation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "WhatsApp" }).click();
  await page.getByLabel("WhatsApp number with country code").fill("12");
  await expect(page.getByText("Use the full international number")).toBeVisible();
  await page.getByLabel("WhatsApp number with country code").fill("+33 6 12 34 56 78");
  await expect(page.getByRole("img", { name: "Preview" })).toBeVisible();
});

test("English URLs under /en redirect to the root", async ({ page }) => {
  await page.goto("/en/vcard-qr-code");
  await expect(page).toHaveURL(/\/vcard-qr-code$/);
});
