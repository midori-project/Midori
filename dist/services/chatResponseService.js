"use strict";
/**
 * 💬 Chat Response Service
 * จัดการการตอบสนองแบบ Chat AI ของ Orchestrator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatResponseService = exports.ChatResponseService = void 0;
class ChatResponseService {
    // 💬 สร้าง Chat Response ตาม Context
    createChatResponse(userInput, intent, context = {}) {
        // วิเคราะห์ประเภทการตอบสนอง
        const responseType = this.analyzeResponseType(userInput, intent);
        return {
            message: this.generateMessage(responseType, intent, context),
            tone: this.selectTone(responseType),
            suggestions: this.generateSuggestions(responseType, context),
            followUpQuestions: this.generateFollowUpQuestions(responseType, context),
            context: {
                responseType,
                userIntent: intent,
                ...context
            },
            timestamp: new Date().toISOString()
        };
    }
    // 🎯 วิเคราะห์ประเภทการตอบสนอง
    analyzeResponseType(userInput, intent) {
        const lower = userInput.toLowerCase();
        // Greeting responses
        if (lower.includes('สวัสดี') || lower.includes('หวัดดี') || lower.includes('hello')) {
            return 'greeting';
        }
        // Help requests
        if (lower.includes('ช่วย') || lower.includes('help') || lower.includes('วิธี')) {
            return 'help_request';
        }
        // Creation requests
        if (lower.includes('สร้าง') || lower.includes('ทำ') || lower.includes('create')) {
            return 'creation_request';
        }
        // Modification requests
        if (lower.includes('แก้') || lower.includes('เปลี่ยน') || lower.includes('ปรับ')) {
            return 'modification_request';
        }
        // Questions
        if (lower.includes('?') || lower.includes('ไหม') || lower.includes('อะไร')) {
            return 'question';
        }
        // Feedback
        if (lower.includes('ดี') || lower.includes('ไม่ดี') || lower.includes('ชอบ') || lower.includes('ไม่ชอบ')) {
            return 'feedback';
        }
        return 'general';
    }
    // 💬 สร้างข้อความตอบกลับ
    generateMessage(responseType, intent, context) {
        const templates = {
            greeting: [
                "👋 สวัสดีครับ! ยินดีต้อนรับสู่ Midori AI Assistant ครับ",
                "🎉 หวัดดีครับ! ผมพร้อมช่วยสร้างเว็บไซต์ให้คุณ",
                "✨ สวัสดีครับ! มีอะไรให้ผมช่วยสร้างเว็บไซต์ไหมครับ?"
            ],
            creation_request: [
                "🎯 เข้าใจแล้วครับ! ผมจะช่วยสร้างให้ตามที่คุณต้องการ",
                "🚀 ดีเลยครับ! ให้ผมเริ่มสร้างให้เลยนะครับ",
                "✨ ไอเดียดีมากครับ! ผมจะใช้ template ที่เหมาะสมมาให้"
            ],
            modification_request: [
                "🔧 เข้าใจครับ! ให้ผมปรับแต่งให้ตามที่คุณต้องการ",
                "✏️ ไม่มีปัญหาครับ! ผมจะแก้ไขให้เลย",
                "🎨 ได้เลยครับ! การปรับแต่งจะทำให้ดีขึ้นแน่นอน"
            ],
            help_request: [
                "💡 ผมยินดีช่วยครับ! มีหลายวิธีที่เราสามารถทำได้",
                "🤝 แน่นอนครับ! ให้ผมแนะนำวิธีที่ดีที่สุด",
                "📚 ไม่มีปัญหาครับ! ผมจะอธิบายให้ฟังแบบละเอียด"
            ],
            question: [
                "🤔 คำถามดีครับ! ให้ผมตอบให้ฟัง",
                "💭 เป็นคำถามที่น่าสนใจครับ! ",
                "🔍 ผมจะอธิบายให้ฟังครับ"
            ],
            feedback: [
                "🙏 ขอบคุณสำหรับ feedback ครับ! มันช่วยให้ผมปรับปรุงได้",
                "💝 ขอบคุณมากครับ! ความคิดเห็นของคุณสำคัญมาก",
                "🎉 ดีใจที่ได้ฟัง feedback ครับ!"
            ],
            general: [
                "🤖 ผมเข้าใจแล้วครับ! ให้ผมช่วยอะไรได้บ้าง",
                "💬 ขอบคุณที่บอกครับ! มีอะไรให้ช่วยเพิ่มเติมไหม",
                "✨ ได้รับข้อความแล้วครับ! ผมพร้อมช่วยเหลือ"
            ]
        };
        const messageTemplates = templates[responseType] || templates.general;
        const randomTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        // เพิ่มข้อมูลเฉพาะตาม context
        if (responseType === 'creation_request' && context.templateCategory) {
            return `${randomTemplate} โดยใช้ ${this.getTemplateName(context.templateCategory)} template`;
        }
        return randomTemplate;
    }
    // 🎭 เลือก Tone ของการตอบสนอง
    selectTone(responseType) {
        const toneMap = {
            greeting: 'friendly',
            help_request: 'helpful',
            creation_request: 'encouraging',
            modification_request: 'professional',
            question: 'helpful',
            feedback: 'friendly',
            general: 'friendly'
        };
        return toneMap[responseType] || 'friendly';
    }
    // 💡 สร้างคำแนะนำ
    generateSuggestions(responseType, context) {
        if (responseType === 'creation_request') {
            if (context.templateCategory === 'restaurant') {
                return [
                    "🍽️ รวมเมนูอาหารพร้อมรูปภาพ",
                    "📱 ระบบสั่งอาหารออนไลน์",
                    "📍 แผนที่และข้อมูลติดต่อ",
                    "⭐ ระบบรีวิวจากลูกค้า"
                ];
            }
            if (context.templateCategory === 'ecommerce') {
                return [
                    "🛒 ระบบตะกร้าสินค้า",
                    "💳 ระบบชำระเงินออนไลน์",
                    "📦 ระบบติดตามการจัดส่ง",
                    "🔍 ระบบค้นหาสินค้า"
                ];
            }
        }
        return [
            "🎨 ปรับแต่งสีและฟอนต์ตามแบรนด์",
            "📱 รองรับการใช้งานบนทุกอุปกรณ์",
            "⚡ โหลดเร็วและใช้งานง่าย",
            "🔒 ปลอดภัยและเชื่อถือได้"
        ];
    }
    // ❓ สร้างคำถามติดตาม
    generateFollowUpQuestions(responseType, context) {
        if (responseType === 'creation_request') {
            return [
                "🎨 มีสีหรือธีมที่ชอบเป็นพิเศษไหมครับ?",
                "📋 มีเนื้อหาหรือข้อมูลที่ต้องการเพิ่มไหม?",
                "🚀 ต้องการฟีเจอร์พิเศษอะไรเพิ่มเติมไหม?"
            ];
        }
        if (responseType === 'modification_request') {
            return [
                "🔍 ต้องการแก้ไขส่วนไหนเป็นพิเศษไหมครับ?",
                "💭 มีแนวทางที่ต้องการหรือให้ผมแนะนำครับ?",
                "✨ มีอะไรเพิ่มเติมที่อยากปรับไหม?"
            ];
        }
        return [
            "💬 มีคำถามอะไรเพิ่มเติมไหมครับ?",
            "🎯 ต้องการให้ช่วยอะไรอีกไหม?",
            "📝 มีข้อเสนอแนะอะไรไหมครับ?"
        ];
    }
    // 🏷️ ชื่อ Template ที่เป็นมิตร
    getTemplateName(category) {
        const names = {
            restaurant: 'Restaurant',
            ecommerce: 'E-commerce',
            business: 'Business',
            landing: 'Landing Page',
            blog: 'Blog'
        };
        return names[category] || category;
    }
    // 🎯 สร้าง Unified Response (Chat + Command)
    createUnifiedResponse(userInput, analysisResult, commandResult) {
        const chatResponse = this.createChatResponse(userInput, analysisResult.analysis?.userIntent || 'general', {
            templateCategory: commandResult?.command?.payload?.templateCategory,
            complexity: analysisResult.analysis?.complexity
        });
        return {
            chatResponse,
            orchestratorCommand: commandResult?.command ? {
                commandType: commandResult.command.commandType,
                payload: commandResult.command.payload,
                priority: commandResult.command.priority
            } : undefined,
            analysis: {
                userIntent: analysisResult.analysis?.userIntent || 'general',
                complexity: analysisResult.analysis?.complexity || 'simple',
                requiresAction: !!commandResult?.command,
                conversationStage: this.determineConversationStage(userInput, analysisResult)
            }
        };
    }
    // 🔄 ระบุ Stage ของการสนทนา
    determineConversationStage(userInput, analysisResult) {
        const lower = userInput.toLowerCase();
        if (lower.includes('สวัสดี') || lower.includes('hello')) {
            return 'greeting';
        }
        if (lower.includes('สร้าง') || lower.includes('ทำ')) {
            return 'planning';
        }
        if (lower.includes('แก้') || lower.includes('เปลี่ยน')) {
            return 'execution';
        }
        if (lower.includes('เสร็จ') || lower.includes('ขอบคุณ')) {
            return 'completion';
        }
        return 'planning';
    }
}
exports.ChatResponseService = ChatResponseService;
exports.chatResponseService = new ChatResponseService();
