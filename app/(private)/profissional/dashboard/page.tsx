import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfessionalDashboardScreen } from "@/components/screens/professional-dashboard-screen";
import { hasProfessionalRole, parseRolesCookie, ROLES_COOKIE_KEY } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard profissional | Sigillus",
  description: "Gerencie anuncio, servicos, valores e historico na area profissional da Sigillus.",
};

export default async function ProfessionalDashboardPage() {
  const cookieStore = await cookies();
  const rolesCookie = cookieStore.get(ROLES_COOKIE_KEY)?.value;
  const roles = parseRolesCookie(rolesCookie);

  if (!hasProfessionalRole(roles)) {
    redirect("/auth/login?next=/profissional/dashboard");
  }

  return <ProfessionalDashboardScreen />;
}
