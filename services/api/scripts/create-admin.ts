import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

const email = process.argv[2];
const providedPassword = process.argv[3];

function generatePassword(): string {
  return randomBytes(12).toString('base64').replace(/[+/=]/g, '').slice(0, 16);
}

async function main() {
  if (!email) {
    console.error('Usage: npm run create-admin -- <email> [password]');
    process.exit(1);
  }

  const plainPassword = providedPassword || generatePassword();
  const password = await hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password, isAdmin: true },
    create: { email, password, isAdmin: true, name: 'Admin' },
  });

  console.log('Admin ready:');
  console.log(`  Email    : ${user.email}`);
  console.log(`  Password : ${plainPassword}`);
  console.log(`  User id  : ${user.id}`);
  console.log(`  isAdmin  : ${user.isAdmin}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
