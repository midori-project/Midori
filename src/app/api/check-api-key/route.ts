import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.QUESTION_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'QUESTION_API_KEY not found in environment variables',
          hasApiKey: false
        },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า API Key มีรูปแบบที่ถูกต้อง (เริ่มต้นด้วย sk-)
    const isValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;
    
    return NextResponse.json({
      success: true,
      message: 'QUESTION_API_KEY found',
      hasApiKey: true,
      isValidFormat,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 7) + '...' // แสดงเฉพาะส่วนต้น
    });

  } catch (error) {
    console.error('Error checking API key:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking API key',
        error: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: false
      },
      { status: 500 }
    );
  }
}
