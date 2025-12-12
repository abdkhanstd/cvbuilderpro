import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email:', adminEmail);
  console.log('   Password:', adminPassword);
  console.log('   Role:', admin.role);
  console.log('');
  console.log('⚠️  IMPORTANT: Change these credentials in production!');
  console.log('   Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME environment variables.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
