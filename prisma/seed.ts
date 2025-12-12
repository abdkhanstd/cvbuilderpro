import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('demo', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'abdkhan@rykhet.com' },
    update: {},
    create: {
      email: 'abdkhan@rykhet.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email: abdkhan@rykhet.com');
  console.log('   Password: demo');
  console.log('   Role:', admin.role);
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
