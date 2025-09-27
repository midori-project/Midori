# 🗣️ Conversation Database System

ระบบบันทึกการสนทนาลง database แบบสมบูรณ์สำหรับ Midori AI

## 📋 Overview

ระบบนี้จัดการการสนทนาระหว่าง user กับ AI โดยบันทึกลง database และสามารถ restore ได้เมื่อ server restart

## 🏗️ Architecture

### Components

1. **ConversationService** - จัดการ database operations
2. **OrchestratorAI** - บันทึกการสนทนาอัตโนมัติ
3. **API Endpoints** - จัดการ conversations ผ่าน REST API
4. **Database Schema** - Prisma models สำหรับ Conversation และ Message

### Database Schema

```prisma
model Conversation {
  id         String     @id @default(uuid())
  projectId  String?
  userId     String?
  agentId    String?
  title      String?
  visibility Visibility @default(private)
  context    Json?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  archivedAt DateTime?
  
  project    Project?   @relation(fields: [projectId], references: [id])
  user       User?      @relation(fields: [userId], references: [id])
  agent      Agent?     @relation(fields: [agentId], references: [id])
  messages   Message[]
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  userId         String?
  role           ChatRole
  content        String?
  contentJson    Json?
  runId          String?
  toolName       String?
  toolInput      Json?
  toolOutput     Json?
  messageIndex   Int
  createdAt      DateTime @default(now())
  
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  user           User?        @relation(fields: [userId], references: [id])
  run            ChatRun?     @relation(fields: [runId], references: [id])
}
```

## 🚀 Features

### 1. Automatic Conversation Management

- **Auto-create conversations** เมื่อ user ส่งข้อความแรก
- **Auto-save messages** ทุกข้อความ (user + assistant)
- **Context restoration** เมื่อ server restart
- **Memory + Database hybrid** สำหรับ performance

### 2. Conversation Types

- **General conversations** - การสนทนาทั่วไป
- **Project-specific conversations** - การสนทนาเกี่ยวกับ project เฉพาะ
- **Agent-specific conversations** - การสนทนากับ agent เฉพาะ

### 3. Message Management

- **Structured message storage** พร้อม metadata
- **Message indexing** สำหรับ ordering
- **Content JSON** สำหรับ structured data
- **Tool integration** สำหรับ function calls

## 📚 Usage

### Basic Usage

```typescript
import { processUserMessage, getUserConversations } from '@/midori/agents/orchestrator/orchestratorAI';

// ส่งข้อความ (จะบันทึกลง database อัตโนมัติ)
const response = await processUserMessage(
  'สวัสดีครับ',
  'user-123',
  'session-456'
);

// ดูรายการ conversations
const conversations = await getUserConversations('user-123');
```

### Advanced Usage

```typescript
import { 
  getConversationWithMessages,
  archiveConversation,
  updateConversationTitle
} from '@/midori/agents/orchestrator/orchestratorAI';

// ดู conversation พร้อม messages
const conversation = await getConversationWithMessages('conv-123');

// อัปเดต title
await updateConversationTitle('conv-123', 'การสนทนาใหม่');

// Archive conversation
await archiveConversation('conv-123');
```

### API Usage

```bash
# ดูรายการ conversations
GET /api/conversations?userId=user-123&limit=20

# ส่งข้อความ
POST /api/conversations
{
  "action": "send_message",
  "userId": "user-123",
  "content": "สวัสดีครับ"
}

# ดู conversation เฉพาะ
GET /api/conversations/conv-123

# Archive conversation
DELETE /api/conversations/conv-123
```

## 🔧 Configuration

### Environment Variables

```env
# Database connection
DATABASE_URL="postgresql://..."

# Optional: Conversation settings
CONVERSATION_CLEANUP_DAYS=30
CONVERSATION_BATCH_SIZE=100
```

### Service Configuration

```typescript
// ConversationService settings
const conversationService = new ConversationService({
  cleanupDays: 30,
  batchSize: 100,
  maxMessagesPerConversation: 1000
});
```

## 🧪 Testing

### Run Tests

```bash
# Test conversation database
npm run test tests/conversation-database-test.ts

# Test conversation persistence
npm run test tests/conversation-persistence-test.ts
```

### Test Scenarios

1. **Basic conversation flow**
2. **Message persistence**
3. **Context restoration**
4. **Conversation management**
5. **API endpoints**

## 📊 Performance

### Optimization Features

- **Lazy loading** สำหรับ conversation history
- **Pagination** สำหรับ long conversations
- **Memory caching** สำหรับ active conversations
- **Batch operations** สำหรับ cleanup

### Monitoring

```typescript
// Get conversation statistics
const stats = await ConversationService.getStats();

// Cleanup old conversations
const cleaned = await ConversationService.cleanupOldConversations(30);
```

## 🔒 Security

### Data Protection

- **User isolation** - conversations แยกตาม userId
- **Project isolation** - project conversations แยกตาม projectId
- **Visibility controls** - private/public conversations
- **Data encryption** - sensitive data ใน contentJson

### Access Control

```typescript
// Check user access to conversation
const hasAccess = await ConversationService.checkUserAccess(
  conversationId, 
  userId
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Conversation not found**
   - ตรวจสอบ userId และ conversationId
   - ตรวจสอบ database connection

2. **Messages not saving**
   - ตรวจสอบ database permissions
   - ตรวจสอบ error logs

3. **Context not restoring**
   - ตรวจสอบ conversationId
   - ตรวจสอบ message format

### Debug Mode

```typescript
// Enable debug logging
process.env.CONVERSATION_DEBUG = 'true';

// Check conversation state
const state = await ConversationService.getDebugState(conversationId);
```

## 🔄 Migration

### Database Migration

```bash
# Run Prisma migration
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Data Migration

```typescript
// Migrate existing conversations
await ConversationService.migrateFromOldSystem(oldData);
```

## 📈 Future Enhancements

### Planned Features

1. **Real-time updates** - WebSocket/SSE support
2. **Message search** - Full-text search
3. **Conversation analytics** - Usage statistics
4. **Export/Import** - Conversation backup
5. **Multi-language support** - i18n conversations

### Performance Improvements

1. **Message compression** - Reduce storage
2. **Indexing optimization** - Faster queries
3. **Caching layer** - Redis integration
4. **Sharding** - Scale conversations

## 📝 API Reference

### ConversationService

```typescript
class ConversationService {
  // Create conversation
  static async createConversation(input: CreateConversationInput): Promise<ConversationData>
  
  // Get conversation
  static async getConversation(conversationId: string): Promise<ConversationData | null>
  
  // Add message
  static async addMessage(input: AddMessageInput): Promise<MessageData>
  
  // Get user conversations
  static async getUserConversations(userId: string, projectId?: string, limit?: number): Promise<ConversationWithMessages[]>
  
  // Archive conversation
  static async archiveConversation(conversationId: string): Promise<boolean>
  
  // Update conversation
  static async updateConversation(conversationId: string, updates: any): Promise<ConversationData | null>
}
```

### OrchestratorAI

```typescript
class OrchestratorAI {
  // Process user input (auto-saves to database)
  async processUserInput(message: UserMessage): Promise<OrchestratorResponse>
  
  // Get user conversations
  async getUserConversations(userId: string, projectId?: string, limit?: number): Promise<ConversationData[]>
  
  // Get conversation with messages
  async getConversationWithMessages(conversationId: string, limit?: number): Promise<ConversationWithMessages | null>
  
  // Archive conversation
  async archiveConversation(conversationId: string): Promise<boolean>
  
  // Update conversation title
  async updateConversationTitle(conversationId: string, title: string): Promise<boolean>
}
```

## 🎯 Best Practices

### 1. Conversation Management

- ใช้ `processUserMessage()` สำหรับการสนทนาปกติ
- ใช้ `getUserConversations()` สำหรับแสดงรายการ
- ใช้ `archiveConversation()` เมื่อไม่ต้องการใช้แล้ว

### 2. Performance

- ใช้ pagination สำหรับ conversations จำนวนมาก
- ใช้ `limit` parameter สำหรับ messages
- ใช้ memory caching สำหรับ active conversations

### 3. Error Handling

- ตรวจสอบ return values เสมอ
- ใช้ try-catch สำหรับ database operations
- Log errors สำหรับ debugging

### 4. Security

- ตรวจสอบ user access ก่อนแสดง conversations
- ใช้ proper input validation
- ใช้ parameterized queries

---

## 🎉 Summary

ระบบ Conversation Database นี้ให้ความสามารถ:

✅ **Automatic persistence** - บันทึกการสนทนาอัตโนมัติ  
✅ **Context restoration** - restore เมื่อ server restart  
✅ **Memory + Database hybrid** - performance + persistence  
✅ **REST API** - จัดการผ่าน API  
✅ **Type safety** - TypeScript support  
✅ **Error handling** - Robust error management  
✅ **Testing** - Comprehensive test coverage  

ระบบนี้พร้อมใช้งานแล้วและจะช่วยให้การสนทนาระหว่าง user กับ AI มีความต่อเนื่องและสามารถเก็บประวัติได้อย่างสมบูรณ์! 🚀
