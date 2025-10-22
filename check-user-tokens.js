/**
 * 🔍 Check User Tokens in Database
 * เช็ค Token ของ User ใน Database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserTokens() {
  console.log('🔍 เช็ค Token ของ User ใน Database...\n');

  try {
    // 1. ดึงข้อมูล User ทั้งหมด
    console.log('1️⃣ ดึงข้อมูล User ทั้งหมด...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        _count: {
          select: {
            tokenWallets: true,
            tokenTransactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`✅ พบ User ทั้งหมด: ${users.length} คน\n`);

    // 2. แสดงข้อมูล User แต่ละคน
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. User: ${user.email || 'No email'}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Display Name: ${user.displayName || 'No name'}`);
      console.log(`   - Created: ${user.createdAt.toISOString()}`);
      console.log(`   - TokenWallets: ${user._count.tokenWallets}`);
      console.log(`   - TokenTransactions: ${user._count.tokenTransactions}`);
      
      // 3. ดึงข้อมูล TokenWallets ของ User นี้
      if (user._count.tokenWallets > 0) {
        const wallets = await prisma.tokenWallet.findMany({
          where: { userId: user.id },
          orderBy: { walletType: 'asc' }
        });
        
        console.log(`   💰 TokenWallets:`);
        let totalBalance = 0;
        wallets.forEach((wallet, index) => {
          console.log(`      ${index + 1}. ${wallet.walletType}: ${wallet.balanceTokens} tokens`);
          console.log(`         - ID: ${wallet.id}`);
          console.log(`         - Active: ${wallet.isActive}`);
          console.log(`         - Created: ${wallet.createdAt.toISOString()}`);
          if (wallet.expiresAt) {
            console.log(`         - Expires: ${wallet.expiresAt.toISOString()}`);
          }
          totalBalance += wallet.balanceTokens;
        });
        console.log(`   📊 Total Balance: ${totalBalance} tokens`);
      } else {
        console.log(`   ❌ ไม่มี TokenWallet!`);
      }
      
      console.log('');
    }

    // 4. หา User ที่ไม่มี TokenWallet
    console.log('4️⃣ หา User ที่ไม่มี TokenWallet...');
    const usersWithoutWallets = await prisma.user.findMany({
      where: {
        tokenWallets: {
          none: {}
        }
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ พบ User ที่ไม่มี TokenWallet: ${usersWithoutWallets.length} คน`);
    usersWithoutWallets.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || 'No email'} (${user.id})`);
      console.log(`      Created: ${user.createdAt.toISOString()}`);
    });

    // 5. สร้าง TokenWallet สำหรับ User ที่ไม่มี
    if (usersWithoutWallets.length > 0) {
      console.log('\n5️⃣ สร้าง TokenWallet สำหรับ User ที่ไม่มี...');
      
      for (const user of usersWithoutWallets) {
        try {
          const wallet = await prisma.tokenWallet.create({
            data: {
              userId: user.id,
              balanceTokens: 5,
              walletType: 'STANDARD',
              isActive: true,
              lastTokenReset: new Date()
            }
          });
          console.log(`   ✅ สร้าง STANDARD wallet สำหรับ ${user.email || user.id}: ${wallet.id}`);
        } catch (error) {
          console.log(`   ❌ ไม่สามารถสร้าง wallet สำหรับ ${user.email || user.id}: ${error.message}`);
        }
      }
    }

    // 6. สรุปผล
    console.log('\n📊 สรุปผลการเช็ค:');
    console.log(`   - Total Users: ${users.length}`);
    console.log(`   - Users without wallets: ${usersWithoutWallets.length}`);
    console.log(`   - Wallets created: ${usersWithoutWallets.length}`);

    return {
      success: true,
      totalUsers: users.length,
      usersWithoutWallets: usersWithoutWallets.length,
      walletsCreated: usersWithoutWallets.length
    };

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// รันการเช็ค
if (require.main === module) {
  checkUserTokens()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 ผลการเช็ค:');
        console.log(`   - Total Users: ${result.totalUsers}`);
        console.log(`   - Users without wallets: ${result.usersWithoutWallets}`);
        console.log(`   - Wallets created: ${result.walletsCreated}`);
        process.exit(0);
      } else {
        console.error('\n💥 การเช็คล้มเหลว:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 เกิดข้อผิดพลาด:', error);
      process.exit(1);
    });
}

module.exports = { checkUserTokens };

