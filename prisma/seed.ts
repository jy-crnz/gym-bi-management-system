// 1. IMPORT FROM YOUR LIB: This uses your existing configured prisma instance
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('🌱 Starting Seed: Synchronizing Member Pass Types...');

    // 2. Fetch all current members
    const members = await prisma.member.findMany();

    if (members.length === 0) {
        console.log('No members found. Seeding initial test database...');

        // 🏛️ ARCHITECTURE FIX: Using passType (MONTHLY/DAY_PASS) instead of tier
        await prisma.member.createMany({
            data: [
                {
                    name: 'Jayjo Arc',
                    email: 'jayjo@dash.com',
                    passType: 'MONTHLY',
                    status: 'ACTIVE',
                    totalSpent: 450,
                    activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                {
                    name: 'Zwei Lacra',
                    email: 'zwei@dash.com',
                    passType: 'MONTHLY',
                    status: 'ACTIVE',
                    totalSpent: 450,
                    activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                {
                    name: 'Lawrence C.',
                    email: 'lawrence@dash.com',
                    passType: 'DAY_PASS',
                    status: 'ACTIVE',
                    totalSpent: 30,
                    activeUntil: new Date() // Expiring today
                },
                {
                    name: 'Ateng Fitness',
                    email: 'ateng@dash.com',
                    passType: 'MONTHLY',
                    status: 'ACTIVE',
                    totalSpent: 1350,
                    activeUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                },
            ],
        });
        console.log('✅ Created initial test members with validated Pass Types.');
    } else {
        console.log(`Found ${members.length} members. Updating records for BI visualization...`);

        // Available pass types from your actual Prisma Schema
        const types: ("DAY_PASS" | "MONTHLY")[] = ['DAY_PASS', 'MONTHLY'];

        /**
         * 🏛️ BI SYNC LOGIC:
         * We update existing members to ensure they have the correct schema fields.
         */
        for (const member of members) {
            const randomType = types[Math.floor(Math.random() * types.length)];
            const initialLTV = randomType === "MONTHLY" ? 450 : 30;

            await prisma.member.update({
                where: { id: member.id },
                data: {
                    passType: randomType,
                    // If they have no LTV, give them a starting value
                    totalSpent: member.totalSpent || initialLTV
                },
            });

            console.log(`  ➔ ${member.name.padEnd(18)} | Syncing Pass: ${randomType}`);
        }
    }

    console.log('\n✅ Seeding complete! Vercel build should now proceed.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });