import { Metadata } from "next";
import { getStudentProfile } from "@/data/student";
import { StudentProfileView } from "@/features/learning/components/student-profile-view";

export const metadata: Metadata = {
  title: "Mi Perfil | Campus Certifox",
  description:
    "Datos de matrícula, identificación oficial y preferencias de seguridad en el Campus Certifox.",
};

export default function CampusPerfilPage() {
  const student = getStudentProfile();

  return <StudentProfileView student={student} />;
}
