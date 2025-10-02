// app/api/preview/daytona/partial/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Daytona } from '@daytonaio/sdk'
import { getDaytonaClient } from '@/config/daytona'

// ใช้ Node APIs ได้
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface PatchOperation {
  type: 'insert' | 'delete' | 'replace'
  line: number
  content: string
  oldContent?: string
}

interface PartialUpdateRequest {
  path: string
  operations: PatchOperation[]
  projectId?: string
}

// อัปเดตไฟล์แบบ partial (patch operations)
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    if (!sandboxId) return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 })

    console.log(`🔧 [PATCH] Partial update for sandbox: ${sandboxId}`)

    // Parse request body
    const body: PartialUpdateRequest = await req.json()
    const { path, operations, projectId } = body
    
    // Validate request
    if (!path) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 })
    }
    
    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json({ error: 'No patch operations provided' }, { status: 400 })
    }

    console.log(`🔧 [PATCH] Applying ${operations.length} patch operations to ${path}`)

    // Connect to Daytona
    const daytona = new Daytona(getDaytonaClient())
    const sandbox = await daytona.get(sandboxId)
    
    // ✅ สร้าง unique session ID ด้วย timestamp และ random string
    const sessionId = `partial-update-${Date.now()}-${Math.random().toString(36).substring(7)}`
    console.log(`📝 [PATCH] Creating session: ${sessionId}`)
    
    try {
      await sandbox.process.createSession(sessionId)
    } catch (sessionError: any) {
      // ถ้า session มีอยู่แล้ว ให้ลบและสร้างใหม่
      if (sessionError?.message?.includes('already exists')) {
        console.log(`🔄 [PATCH] Session already exists, trying to delete and recreate`)
        try {
          await sandbox.process.deleteSession(sessionId)
        } catch {}
        await sandbox.process.createSession(sessionId)
      } else {
        throw sessionError
      }
    }
    
    // Read current file content
    const readResult = await sandbox.process.executeSessionCommand(sessionId, {
      command: `cat "${path}" 2>/dev/null || echo ""`,
      runAsync: false,
    })
    
    const currentContent = readResult.stdout || readResult.output || ''
    console.log(`📖 [PATCH] Current file content length: ${currentContent.length} characters`)
    
    // Apply patch operations
    let lines = currentContent.split('\n')
    let appliedOperations = 0
    const errors: string[] = []
    
    // Sort operations by line number (descending) to avoid index shifting issues
    const sortedOperations = [...operations].sort((a, b) => b.line - a.line)
    
    for (const operation of sortedOperations) {
      try {
        const { type, line, content } = operation
        
        console.log(`🔧 [PATCH] Applying operation: ${type} at line ${line}`)
        
        switch (type) {
          case 'insert':
            if (line >= 0 && line <= lines.length) {
              lines.splice(line, 0, content)
              appliedOperations++
              console.log(`✅ [PATCH] Inserted line ${line}: ${content.substring(0, 50)}...`)
            } else {
              errors.push(`Invalid line number for insert: ${line}`)
            }
            break
            
          case 'delete':
            if (line >= 0 && line < lines.length) {
              const deletedLine = lines.splice(line, 1)[0]
              appliedOperations++
              console.log(`✅ [PATCH] Deleted line ${line}: ${deletedLine.substring(0, 50)}...`)
            } else {
              errors.push(`Invalid line number for delete: ${line}`)
            }
            break
            
          case 'replace':
            if (line >= 0 && line < lines.length) {
              const oldLine = lines[line]
              lines[line] = content
              appliedOperations++
              console.log(`✅ [PATCH] Replaced line ${line}: "${oldLine.substring(0, 30)}..." → "${content.substring(0, 30)}..."`)
            } else {
              errors.push(`Invalid line number for replace: ${line}`)
            }
            break
            
          default:
            errors.push(`Unknown operation type: ${type}`)
        }
      } catch (error: any) {
        const errorMsg = `Error applying operation ${operation.type} at line ${operation.line}: ${error.message}`
        console.error(`❌ [PATCH] ${errorMsg}`)
        errors.push(errorMsg)
      }
    }
    
    // Write updated content back to file
    const newContent = lines.join('\n')
    const b64Content = Buffer.from(newContent).toString('base64')
    
    const writeResult = await sandbox.process.executeSessionCommand(sessionId, {
      command: `echo "${b64Content}" | base64 -d > "${path}"`,
      runAsync: false,
    })
    
    if (writeResult.exitCode !== 0) {
      throw new Error(`Failed to write updated file: ${writeResult.stderr || writeResult.output}`)
    }
    
    // ✅ ลบ session หลังจากใช้งานเสร็จ
    try {
      await sandbox.process.deleteSession(sessionId)
      console.log(`🗑️ [PATCH] Deleted session: ${sessionId}`)
    } catch (deleteError) {
      console.warn(`⚠️ [PATCH] Failed to delete session: ${deleteError}`)
    }
    
    console.log(`✅ [PATCH] Successfully applied ${appliedOperations}/${operations.length} operations to ${path}`)
    
    return NextResponse.json({
      success: true,
      path,
      appliedOperations,
      totalOperations: operations.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully applied ${appliedOperations} patch operations to ${path}`,
      projectId
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Daytona-Skip-Preview-Warning': 'true',
      },
    })
    
  } catch (e: any) {
    console.error(`❌ [PATCH ERROR] ${e?.message}`)
    return NextResponse.json({ 
      error: e?.message || 'Failed to apply partial update',
      details: e?.stack || 'No additional details'
    }, { status: 500 })
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'X-Daytona-Skip-Preview-Warning': 'true',
    },
  })
}
