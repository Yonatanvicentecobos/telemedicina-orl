import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "doctor@telemedicina-orl.local" },
    update: {},
    create: {
      name: "Dr. Cobos",
      email: "doctor@telemedicina-orl.local",
      role: "DOCTOR"
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
