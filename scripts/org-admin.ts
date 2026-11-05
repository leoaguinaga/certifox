/**
 * Administración de organizaciones (tenants) desde la terminal.
 * Usa la conexión directa (ejecutar vía `pnpm org:*`, que pasa por prisma-direct).
 *
 *   pnpm org:create <slug> "<Nombre>" <ownerEmail> [dominioPropio]
 *   pnpm org:member <orgSlug> <email> <OWNER|ADMIN|INSTRUCTOR|STUDENT>
 *   pnpm org:payments <orgSlug> <archivo.json>
 *   pnpm platform:superadmin <email>
 */
import { readFileSync } from "node:fs";
import { PrismaClient, type OrgRole } from "@prisma/client";
import { paymentSettingsSchema } from "../server/modules/organization/payment-settings";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {}
}

const prisma = new PrismaClient();
const ROLES: OrgRole[] = ["OWNER", "ADMIN", "INSTRUCTOR", "STUDENT"];

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

async function findUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) fail(`No existe el usuario ${email} (debe registrarse primero en /ingresar)`);
  return user;
}

async function findOrg(slug: string) {
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) fail(`No existe la organización "${slug}"`);
  return org;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "create": {
      const [slug, name, ownerEmail, customDomain] = args;
      if (!slug || !name || !ownerEmail) fail('Uso: org:create <slug> "<Nombre>" <ownerEmail> [dominio]');
      if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) fail("Slug inválido (minúsculas, números y guiones; 3-40)");
      const owner = await findUser(ownerEmail);
      const org = await prisma.organization.create({
        data: {
          slug,
          name,
          customDomain: customDomain?.toLowerCase() || null,
          memberships: { create: { userId: owner.id, role: "OWNER" } },
        },
      });
      console.log(`✅ Organización ${org.name} (${org.slug}) creada. OWNER: ${owner.email}`);
      break;
    }
    case "member": {
      const [slug, email, roleArg] = args;
      const role = roleArg?.toUpperCase() as OrgRole;
      if (!slug || !email || !ROLES.includes(role)) fail(`Uso: org:member <orgSlug> <email> <${ROLES.join("|")}>`);
      const [org, user] = await Promise.all([findOrg(slug), findUser(email)]);
      await prisma.membership.upsert({
        where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
        create: { organizationId: org.id, userId: user.id, role },
        update: { role },
      });
      console.log(`✅ ${user.email} ahora es ${role} en ${org.name}`);
      break;
    }
    case "payments": {
      const [slug, file] = args;
      if (!slug || !file) fail("Uso: org:payments <orgSlug> <archivo.json>");
      const org = await findOrg(slug);
      const parsed = paymentSettingsSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
      if (!parsed.success) fail(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
      await prisma.organization.update({ where: { id: org.id }, data: { paymentSettings: parsed.data } });
      console.log(`✅ Datos de pago actualizados para ${org.name}`);
      break;
    }
    case "superadmin": {
      const [email] = args;
      if (!email) fail("Uso: platform:superadmin <email>");
      const user = await findUser(email);
      await prisma.user.update({ where: { id: user.id }, data: { platformRole: "SUPERADMIN" } });
      console.log(`✅ ${user.email} es SUPERADMIN de la plataforma`);
      break;
    }
    default:
      fail("Comandos: create | member | payments | superadmin");
  }
}

main()
  .catch((e) => fail(e instanceof Error ? e.message : String(e)))
  .finally(() => prisma.$disconnect());
