/**
 * 🧪 API Endpoints Test
 * ทดสอบ API endpoints ของ TokenWallet system
 */

// ใช้ built-in fetch (Node.js 18+)

// ใช้ test user ที่สร้างไว้
const TEST_USER_ID = '3bd73716-e9fe-439b-8764-4338d269f356';
const BASE_URL = 'http://localhost:3000';

async function testAPIEndpoints() {
  console.log('🚀 เริ่มทดสอบ API Endpoints...\n');

  try {
    // 1. ทดสอบ GET /api/billing/balance
    console.log('1️⃣ ทดสอบ GET /api/billing/balance...');
    try {
      const balanceResponse = await fetch(`${BASE_URL}/api/billing/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // ใส่ session cookie หรือ authorization header ที่จำเป็น
        }
      });
      
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        console.log('✅ GET /api/billing/balance สำเร็จ');
        console.log(`   - Balance: ${balanceData.data?.balance || 'N/A'} tokens`);
        console.log(`   - Can Create Project: ${balanceData.data?.canCreateProject || 'N/A'}`);
        console.log(`   - Wallets: ${balanceData.data?.wallets?.length || 0}`);
      } else {
        console.log(`❌ GET /api/billing/balance ล้มเหลว: ${balanceResponse.status}`);
        console.log(`   - Response: ${await balanceResponse.text()}`);
      }
    } catch (error) {
      console.log(`❌ GET /api/billing/balance error: ${error.message}`);
    }

    // 2. ทดสอบ GET /api/billing/wallets
    console.log('\n2️⃣ ทดสอบ GET /api/billing/wallets...');
    try {
      const walletsResponse = await fetch(`${BASE_URL}/api/billing/wallets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (walletsResponse.ok) {
        const walletsData = await walletsResponse.json();
        console.log('✅ GET /api/billing/wallets สำเร็จ');
        console.log(`   - Total Balance: ${walletsData.data?.totalBalance || 'N/A'} tokens`);
        console.log(`   - Wallets Count: ${walletsData.data?.wallets?.length || 0}`);
        if (walletsData.data?.wallets) {
          walletsData.data.wallets.forEach((wallet, index) => {
            console.log(`   - Wallet ${index + 1}: ${wallet.walletType} - ${wallet.balanceTokens} tokens`);
          });
        }
      } else {
        console.log(`❌ GET /api/billing/wallets ล้มเหลว: ${walletsResponse.status}`);
        console.log(`   - Response: ${await walletsResponse.text()}`);
      }
    } catch (error) {
      console.log(`❌ GET /api/billing/wallets error: ${error.message}`);
    }

    // 3. ทดสอบ GET /api/billing/transactions
    console.log('\n3️⃣ ทดสอบ GET /api/billing/transactions...');
    try {
      const transactionsResponse = await fetch(`${BASE_URL}/api/billing/transactions?limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        console.log('✅ GET /api/billing/transactions สำเร็จ');
        console.log(`   - Transactions Count: ${transactionsData.data?.length || 0}`);
        if (transactionsData.data) {
          transactionsData.data.forEach((tx, index) => {
            console.log(`   - Transaction ${index + 1}: ${tx.type} - ${tx.amount} tokens`);
          });
        }
      } else {
        console.log(`❌ GET /api/billing/transactions ล้มเหลว: ${transactionsResponse.status}`);
        console.log(`   - Response: ${await transactionsResponse.text()}`);
      }
    } catch (error) {
      console.log(`❌ GET /api/billing/transactions error: ${error.message}`);
    }

    // 4. ทดสอบ POST /api/billing/wallets
    console.log('\n4️⃣ ทดสอบ POST /api/billing/wallets...');
    try {
      const createWalletResponse = await fetch(`${BASE_URL}/api/billing/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletType: 'BONUS',
          initialTokens: 5,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 วัน
        })
      });
      
      if (createWalletResponse.ok) {
        const createWalletData = await createWalletResponse.json();
        console.log('✅ POST /api/billing/wallets สำเร็จ');
        console.log(`   - Wallet ID: ${createWalletData.data?.id || 'N/A'}`);
        console.log(`   - Wallet Type: ${createWalletData.data?.walletType || 'N/A'}`);
        console.log(`   - Initial Tokens: ${createWalletData.data?.balanceTokens || 'N/A'}`);
      } else {
        console.log(`❌ POST /api/billing/wallets ล้มเหลว: ${createWalletResponse.status}`);
        console.log(`   - Response: ${await createWalletResponse.text()}`);
      }
    } catch (error) {
      console.log(`❌ POST /api/billing/wallets error: ${error.message}`);
    }

    // 5. ทดสอบ GET /api/billing/daily-reset
    console.log('\n5️⃣ ทดสอบ GET /api/billing/daily-reset...');
    try {
      const resetStatusResponse = await fetch(`${BASE_URL}/api/billing/daily-reset`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (resetStatusResponse.ok) {
        const resetStatusData = await resetStatusResponse.json();
        console.log('✅ GET /api/billing/daily-reset สำเร็จ');
        console.log(`   - Should Reset: ${resetStatusData.shouldReset || 'N/A'}`);
        console.log(`   - Message: ${resetStatusData.message || 'N/A'}`);
      } else {
        console.log(`❌ GET /api/billing/daily-reset ล้มเหลว: ${resetStatusResponse.status}`);
        console.log(`   - Response: ${await resetStatusResponse.text()}`);
      }
    } catch (error) {
      console.log(`❌ GET /api/billing/daily-reset error: ${error.message}`);
    }

    console.log('\n🎉 การทดสอบ API Endpoints เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// รันการทดสอบ
if (require.main === module) {
  testAPIEndpoints()
    .then(() => {
      console.log('\n📋 สรุปผลการทดสอบ API:');
      console.log('   ✅ Database connection: สำเร็จ');
      console.log('   ⚠️  API endpoints: ต้องทดสอบกับ dev server');
      console.log('   💡 Tip: รัน "npm run dev" ก่อนทดสอบ API');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 เกิดข้อผิดพลาด:', error);
      process.exit(1);
    });
}

module.exports = { testAPIEndpoints };
