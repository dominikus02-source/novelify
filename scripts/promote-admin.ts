import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx tsx scripts/promote-admin.ts <email>');
    console.error('Example: npx tsx scripts/promote-admin.ts obahmamah.indonesia@gmail.com');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    console.error(`User with email "${normalizedEmail}" not found.`);
    console.error('The user must register/login first before being promoted.');
    process.exit(1);
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    console.log(`User "${normalizedEmail}" is already SUPER_ADMIN.`);
    await prisma.$disconnect();
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: UserRole.SUPER_ADMIN },
  });

  console.log(`Successfully promoted "${normalizedEmail}" to SUPER_ADMIN.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
