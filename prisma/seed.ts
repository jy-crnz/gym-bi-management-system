// 1. IMPORT FROM YOUR LIB: This uses your existing configured prisma instance
// This is the "Architecture is Kindness" way - don't re-create what you've already built!
import 'dotenv/config'; // <--- ADD THIS AT THE VERY TOP
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('🌱 Starting Seed: Distributing Membership Tiers...');

    // 2. Fetch all current members
    const members = await prisma.member.findMany();

    if (members.length === 0) {
        console.log('No members found. Seeding initial test database...');

        // Using createMany for efficient bulk insertion
        await prisma.member.createMany({
            data: [
                { name: 'Jayjo Arc', email: 'jayjo@dash.com', tier: 'VIP', status: 'ACTIVE' },
                { name: 'Zwei Lacra', email: 'zwei@dash.com', tier: 'PREMIUM', status: 'ACTIVE' },
                { name: 'Lawrence C.', email: 'lawrence@dash.com', tier: 'BASIC', status: 'ACTIVE' },
                { name: 'Ateng Fitness', email: 'ateng@dash.com', tier: 'PREMIUM', status: 'ACTIVE' },
            ],
        });
        console.log('✅ Created initial test members with varied tiers.');
    } else {
        console.log(`Found ${members.length} members. Updating tiers for BI visualization...`);

        // Available tiers from your Prisma Enum
        const tiers: ("BASIC" | "PREMIUM" | "VIP")[] = ['BASIC', 'PREMIUM', 'VIP'];

        /**
         * BI SEED LOGIC:
         * We iterate through existing members and assign a random tier.
         * This ensures your Donut chart has data to display immediately.
         */
        for (const member of members) {
            const randomTier = tiers[Math.floor(Math.random() * tiers.length)];

            await prisma.member.update({
                where: { id: member.id },
                data: { tier: randomTier },
            });

            console.log(`  ➔ ${member.name.padEnd(18)} | Set to: ${randomTier}`);
        }
    }

    console.log('\n✅ Seeding complete! Your dashboard distribution is now populated.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        // Disconnect to prevent hung database connections
        await prisma.$disconnect();
    });