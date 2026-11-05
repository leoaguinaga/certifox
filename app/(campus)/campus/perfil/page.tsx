import { Metadata } from "next";
import { campusContext } from "@/server/core/page-guards";
import { getMyProfile } from "@/server/modules/profile/profile.service";
import { ProfileManagementView } from "@/features/profile/components/profile-management-view";

export const metadata: Metadata = {
  title: "Mi Perfil | Campus Certifox",
  description: "Datos de matrícula, identificación oficial y preferencias de seguridad en el Campus Certifox.",
};

export default async function CampusPerfilPage() {
  const ctx = await campusContext("/campus/perfil");
  const profile = await getMyProfile(ctx);
  return <ProfileManagementView initialProfile={profile} />;
}
