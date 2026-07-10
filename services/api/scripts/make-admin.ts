import { prisma } from '../src/lib/prisma';

const email = process.argv[2];

async function main() {
  if (!email) {
    console.error('Usage: npm run make-admin -- <email>');
    process.exit(1);
  }
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });
    console.log(`Admin granted to ${user.email} (id=${user.id})`);
    process.exit(0);
  } catch (err: any) {
    console.error(`Failed to grant admin to "${email}": ${err?.message ?? err}`);
    process.exit(1);
  }
}

main();
