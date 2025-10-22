/**
 * 🧪 TokenWallet System Test
 * ทดสอบระบบ TokenWallet แบบครบถ้วน
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTokenWalletSystem() {
  console.log('🚀 เริ่มทดสอบระบบ TokenWallet...\n');

  try {
    // 1. ทดสอบการสร้าง User ใหม่
    console.log('1️⃣ สร้าง User ใหม่...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@tokenwallet.com',
        displayName: 'Token Wallet Tester',
        locale: 'th',
        isActive: true
      }
    });
    console.log(`✅ สร้าง User สำเร็จ: ${testUser.id}`);

    // 2. ทดสอบการสร้าง TokenWallet
    console.log('\n2️⃣ สร้าง TokenWallet...');
    const standardWallet = await prisma.tokenWallet.create({
      data: {
        userId: testUser.id,
        balanceTokens: 5,
        walletType: 'STANDARD',
        isActive: true,
        lastTokenReset: new Date()
      }
    });
    console.log(`✅ สร้าง STANDARD wallet สำเร็จ: ${standardWallet.id}`);

    // 3. ทดสอบการสร้าง PREMIUM wallet
    console.log('\n3️⃣ สร้าง PREMIUM wallet...');
    const premiumWallet = await prisma.tokenWallet.create({
      data: {
        userId: testUser.id,
        balanceTokens: 10,
        walletType: 'PREMIUM',
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 วัน
      }
    });
    console.log(`✅ สร้าง PREMIUM wallet สำเร็จ: ${premiumWallet.id}`);

    // 4. ทดสอบการสร้าง TokenTransaction
    console.log('\n4️⃣ สร้าง TokenTransaction...');
    const transaction = await prisma.tokenTransaction.create({
      data: {
        userId: testUser.id,
        walletId: standardWallet.id,
        amount: -1,
        type: 'PROJECT_CREATION',
        description: 'Test project creation',
        metadata: {
          projectId: 'test-project-123',
          actionType: 'create'
        }
      }
    });
    console.log(`✅ สร้าง Transaction สำเร็จ: ${transaction.id}`);

    // 5. ทดสอบการอัปเดต Token balance
    console.log('\n5️⃣ อัปเดต Token balance...');
    const updatedWallet = await prisma.tokenWallet.update({
      where: { id: standardWallet.id },
      data: {
        balanceTokens: {
          decrement: 1
        }
      }
    });
    console.log(`✅ อัปเดต balance สำเร็จ: ${updatedWallet.balanceTokens} tokens`);

    // 6. ทดสอบการดึงข้อมูล User พร้อม TokenWallets
    console.log('\n6️⃣ ดึงข้อมูล User พร้อม TokenWallets...');
    const userWithWallets = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        tokenWallets: {
          where: { isActive: true },
          orderBy: { walletType: 'asc' }
        },
        tokenTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    console.log('📊 ข้อมูล User:');
    console.log(`   - ID: ${userWithWallets.id}`);
    console.log(`   - Email: ${userWithWallets.email}`);
    console.log(`   - Wallets: ${userWithWallets.tokenWallets.length}`);
    console.log(`   - Transactions: ${userWithWallets.tokenTransactions.length}`);

    // 7. แสดงข้อมูล Wallets
    console.log('\n💰 TokenWallets:');
    userWithWallets.tokenWallets.forEach((wallet, index) => {
      console.log(`   ${index + 1}. ${wallet.walletType}: ${wallet.balanceTokens} tokens`);
      if (wallet.expiresAt) {
        console.log(`      Expires: ${wallet.expiresAt.toISOString()}`);
      }
    });

    // 8. แสดงข้อมูล Transactions
    console.log('\n📝 Recent Transactions:');
    userWithWallets.tokenTransactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount} tokens`);
      console.log(`      Description: ${tx.description}`);
      console.log(`      Created: ${tx.createdAt.toISOString()}`);
    });

    // 9. ทดสอบการคำนวณ Total Balance
    console.log('\n9️⃣ คำนวณ Total Balance...');
    const totalBalance = userWithWallets.tokenWallets.reduce(
      (sum, wallet) => sum + wallet.balanceTokens, 
      0
    );
    console.log(`✅ Total Balance: ${totalBalance} tokens`);

    // 10. ทดสอบการสร้าง Project (simulation)
    console.log('\n🔟 ทดสอบการสร้าง Project...');
    const canCreateProject = totalBalance >= 1;
    console.log(`✅ สามารถสร้างโปรเจคได้: ${canCreateProject ? 'ใช่' : 'ไม่'}`);

    if (canCreateProject) {
      console.log('   - ต้องการ: 1 token');
      console.log(`   - มี: ${totalBalance} tokens`);
      console.log('   - สถานะ: ✅ พร้อมสร้างโปรเจค');
    } else {
      console.log('   - สถานะ: ❌ Token ไม่เพียงพอ');
    }

    console.log('\n🎉 การทดสอบเสร็จสิ้น!');
    console.log('\n📋 สรุปผลการทดสอบ:');
    console.log('   ✅ User creation: สำเร็จ');
    console.log('   ✅ TokenWallet creation: สำเร็จ');
    console.log('   ✅ TokenTransaction creation: สำเร็จ');
    console.log('   ✅ Balance calculation: สำเร็จ');
    console.log('   ✅ Project creation check: สำเร็จ');

    return {
      success: true,
      userId: testUser.id,
      totalBalance,
      canCreateProject,
      walletsCount: userWithWallets.tokenWallets.length,
      transactionsCount: userWithWallets.tokenTransactions.length
    };

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// รันการทดสอบ
if (require.main === module) {
  testTokenWalletSystem()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 ผลการทดสอบ:');
        console.log(`   - User ID: ${result.userId}`);
        console.log(`   - Total Balance: ${result.totalBalance} tokens`);
        console.log(`   - Can Create Project: ${result.canCreateProject}`);
        console.log(`   - Wallets: ${result.walletsCount}`);
        console.log(`   - Transactions: ${result.transactionsCount}`);
        process.exit(0);
      } else {
        console.error('\n💥 การทดสอบล้มเหลว:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 เกิดข้อผิดพลาด:', error);
      process.exit(1);
    });
}

module.exports = { testTokenWalletSystem };

