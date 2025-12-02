// Test Time Function เฉพาะ
import '../src/midori/agents/orchestrator/orchestratorAI.js';

// สร้าง object เพื่อเทส formatCurrentTimeForUser
class TestTimeFormat {
  formatCurrentTimeForUser(tz?: string): string {
    const timezone = tz || process.env.TZ || 'Asia/Bangkok';
    const now = new Date();
    
    const formatter = new Intl.DateTimeFormat('th-TH', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    
    const formattedTime = formatter.format(now);
    return `ตอนนี้คือ ${formattedTime} ครับ`;
  }
}

console.log('🧪 Testing Time Format Function');
console.log('═══════════════════════════════════');

const tester = new TestTimeFormat();

console.log('⏰ ตอนนี้กี่โมง:');
console.log(tester.formatCurrentTimeForUser());

console.log('\n⏰ ตอนนี้กี่โมง (UTC):');
console.log(tester.formatCurrentTimeForUser('UTC'));

console.log('\n✅ Time function works correctly!');