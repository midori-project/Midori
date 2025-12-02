import ngrok, { type Config, type Listener } from '@ngrok/ngrok';

export interface NgrokConnectionOptions {
  port: number;
  authtoken?: string;
  domain?: string;
  region?: string;
}

export class NgrokManager {
  private listener: Listener | null = null;
  private publicUrl: string | null = null;

  /**
   * เชื่อมต่อกับ ngrok tunnel
   */
  async connect(options: NgrokConnectionOptions): Promise<string> {
    try {
      // ตรวจสอบ authtoken
      const authtoken = options.authtoken || process.env.NGROK_AUTHTOKEN;
      if (!authtoken) {
        throw new Error(
          'NGROK_AUTHTOKEN ไม่ถูกตั้งค่า กรุณาตั้งค่าใน environment variable หรือส่งผ่าน options'
        );
      }

      // สร้าง config
      const config: Config = {
        addr: options.port,
        authtoken: authtoken,
      };

      // เพิ่ม domain ถ้ามี
      if (options.domain) {
        config.domain = options.domain;
      }

      // เพิ่ม region ถ้ามี (แม้ว่า region จะ deprecated แล้ว แต่ยังรองรับอยู่)
      // Note: region ไม่ได้อยู่ใน Config interface แต่เราจะส่งผ่านได้ถ้า API รองรับ

      // เริ่ม tunnel
      this.listener = await ngrok.forward(config);

      // เก็บ public URL
      this.publicUrl = this.listener.url();

      if (!this.publicUrl) {
        throw new Error('ไม่สามารถดึง public URL จาก ngrok listener ได้');
      }

      console.log(`✅ ngrok tunnel เริ่มทำงานแล้ว`);
      console.log(`🌐 Public URL: ${this.publicUrl}`);
      console.log(`🔗 Local URL: http://localhost:${options.port}`);

      return this.publicUrl;
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ ngrok:', error);
      throw error;
    }
  }

  /**
   * ปิดการเชื่อมต่อ ngrok tunnel
   */
  async disconnect(): Promise<void> {
    try {
      if (this.listener) {
        await this.listener.close();
        this.listener = null;
        this.publicUrl = null;
        console.log('✅ ngrok tunnel ถูกปิดแล้ว');
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการปิด ngrok:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่ามีการเชื่อมต่ออยู่หรือไม่
   */
  isConnected(): boolean {
    return this.listener !== null;
  }

  /**
   * ดึง public URL ปัจจุบัน
   */
  getPublicUrl(): string | null {
    return this.publicUrl;
  }
}
