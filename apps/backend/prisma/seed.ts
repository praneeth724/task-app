import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tasktracker.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@tasktracker.dev',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@tasktracker.dev' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'user@tasktracker.dev',
      passwordHash,
      role: 'USER',
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project repository',
        description: 'Initialize the repo and CI pipeline',
        status: 'DONE',
        ownerId: user.id,
      },
      {
        title: 'Design database schema',
        description: 'Model users and tasks with RBAC in mind',
        status: 'IN_PROGRESS',
        ownerId: user.id,
      },
      {
        title: 'Review team onboarding docs',
        description: 'Admin-owned housekeeping task',
        status: 'TODO',
        ownerId: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete. Login with admin@tasktracker.dev / user@tasktracker.dev, password: Password123!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
