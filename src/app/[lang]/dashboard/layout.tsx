import { notFound } from "next/navigation";
import { PlanCookie } from "@/components/PlanCookie";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";

export default async function DashboardLayout({ children, params }: LayoutProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const account = await requireAccount(lang);
  return (
    <>
      {children}
      <PlanCookie paid={account.plan !== "free"} />
    </>
  );
}
