import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { getUserProfile } from "@/server/services/profile.service";
import { ProfileManagementView } from "@/features/profile/components/profile-management-view";

export const metadata: Metadata = {
  title: "Mi Perfil | Campus Certifox",
  description:
    "Datos de matrícula, identificación oficial y preferencias de seguridad en el Campus Certifox.",
};

export default async function CampusPerfilPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/ingresar");
  }

  const profile = await getUserProfile(session);

  return <ProfileManagementView initialProfile={profile} />;
}
