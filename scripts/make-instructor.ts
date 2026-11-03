import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Error: Debes especificar el email del usuario.");
    console.log("Uso: pnpm make-instructor <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    console.error(`❌ Error: No se encontró ningún usuario con el correo: ${email}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "INSTRUCTOR" },
  });

  console.log(`✅ Éxito: El usuario ${updated.name} (${updated.email}) ahora tiene el rol INSTRUCTOR.`);
}

main()
  .catch((err) => {
    console.error("Error al actualizar rol:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
