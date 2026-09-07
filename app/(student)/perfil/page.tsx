import { Metadata } from "next";
import { getStudentProfile } from "@/data/student";
import { StudentProfileView } from "@/features/learning/components/student-profile-view";

export const metadata: Metadata = {
  title: "Mi Perfil de Estudiante | Certifox",
  description:
    "Datos de matrícula, identificación oficial y preferencias de seguridad del estudiante.",
};

export default function PerfilPage() {
  const student = getStudentProfile();

  return <StudentProfileView student={student} />;
}
