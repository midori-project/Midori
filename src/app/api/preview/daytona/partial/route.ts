// app/api/preview/daytona/partial/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Daytona } from '@daytonaio/sdk'
import { getDaytonaClient } from '@/config/daytona'
import { prisma } from '@/libs/prisma/prisma'

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
    
    // ✅ Validate projectId (recommended for database sync)
    if (!projectId) {
      console.warn(`⚠️ [PATCH] No projectId provided - changes won't be saved to database`)
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
    
    // ✅ ✨ บันทึกกลับไปที่ database
    let savedToDatabase = false
    if (projectId) {
      try {
        console.log(`💾 [DB-SAVE] Starting database save for project: ${projectId}`)
        console.log(`💾 [DB-SAVE] File to update: ${path}`)
        console.log(`💾 [DB-SAVE] New content length: ${newContent.length} characters`)
        
        // 1. ดึง snapshot ล่าสุด
        console.log(`🔍 [DB-SAVE] Fetching latest snapshot...`)
        const latestSnapshot = await prisma.snapshot.findFirst({
          where: { projectId },
          orderBy: { createdAt: 'desc' }
        })
        
        if (latestSnapshot) {
          console.log(`✅ [DB-SAVE] Found snapshot: ${latestSnapshot.id}`)
          console.log(`📅 [DB-SAVE] Snapshot created at: ${latestSnapshot.createdAt}`)
          console.log(`🏷️ [DB-SAVE] Snapshot label: ${latestSnapshot.label || 'No label'}`)
          
          // 2. อัพเดตไฟล์ใน snapshot
          const snapshotFiles = latestSnapshot.files as any
          let currentFiles: any[] = []
          
          // ดึงไฟล์จาก snapshot (รองรับหลายรูปแบบ)
          if (Array.isArray(snapshotFiles)) {
            currentFiles = [...snapshotFiles]
            console.log(`📦 [DB-SAVE] Snapshot files format: Array (${currentFiles.length} files)`)
          } else if (snapshotFiles && typeof snapshotFiles === 'object') {
            currentFiles = snapshotFiles.files || []
            console.log(`📦 [DB-SAVE] Snapshot files format: Object (${currentFiles.length} files)`)
          } else {
            console.log(`📦 [DB-SAVE] Snapshot files format: Empty or unknown`)
          }
          
          console.log(`📊 [DB-SAVE] Total files in snapshot before update: ${currentFiles.length}`)
          
          const fileIndex = currentFiles.findIndex((f: any) => 
            f.path === path || f.filePath === path
          )
          
          if (fileIndex >= 0) {
            // อัพเดตไฟล์ที่มีอยู่
            const oldContentLength = currentFiles[fileIndex].content?.length || 0
            currentFiles[fileIndex] = {
              ...currentFiles[fileIndex],
              content: newContent,
              path: path,
              updatedAt: new Date().toISOString()
            }
            console.log(`📝 [DB-SAVE] Updated existing file at index ${fileIndex}`)
            console.log(`📝 [DB-SAVE] Content changed: ${oldContentLength} → ${newContent.length} characters`)
          } else {
            // เพิ่มไฟล์ใหม่ (ถ้ายังไม่มี)
            currentFiles.push({ 
              path, 
              content: newContent, 
              type: 'code',
              createdAt: new Date().toISOString()
            })
            console.log(`➕ [DB-SAVE] Added new file to snapshot (total files: ${currentFiles.length})`)
          }
          
          // 3. อัพเดต snapshot
          const currentTemplateData = (latestSnapshot.templateData as any) || {}
          const newPartialUpdateCount = (currentTemplateData.partialUpdateCount || 0) + 1
          
          console.log(`🔄 [DB-SAVE] Updating snapshot in database...`)
          console.log(`📊 [DB-SAVE] Partial update count: ${currentTemplateData.partialUpdateCount || 0} → ${newPartialUpdateCount}`)
          
          await prisma.snapshot.update({
            where: { id: latestSnapshot.id },
            data: { 
              files: currentFiles,
              templateData: {
                ...currentTemplateData,
                lastPartialUpdate: new Date().toISOString(),
                partialUpdateCount: newPartialUpdateCount,
                lastPartialUpdateFile: path
              }
            }
          })
          
          console.log(`✅ [DB-SAVE] Snapshot ${latestSnapshot.id} updated successfully`)
          console.log(`✅ [DB-SAVE] Total files after update: ${currentFiles.length}`)
        } else {
          console.warn(`⚠️ [DB-SAVE] No snapshot found for project ${projectId}`)
          console.warn(`⚠️ [DB-SAVE] Cannot save changes to database - snapshot required`)
        }
        
        // 4. บันทึก PatchSet (สำหรับ history tracking)
        console.log(`📚 [DB-SAVE] Creating PatchSet for history tracking...`)
        console.log(`📚 [DB-SAVE] Operations to track: ${operations.length}`)
        
        const patchSet = await prisma.patchSet.create({
          data: {
            projectId: projectId,
            meta: {
              sandboxId,
              sessionId,
              timestamp: new Date().toISOString(),
              appliedOperations,
              totalOperations: operations.length,
              errors: errors.length > 0 ? errors : undefined,
              source: 'partial-update'
            }
          }
        })
        
        console.log(`✅ [DB-SAVE] PatchSet created: ${patchSet.id}`)
        
        // 5. สร้าง Patch record
        console.log(`📝 [DB-SAVE] Creating Patch record for file: ${path}`)
        console.log(`📝 [DB-SAVE] Operations breakdown:`)
        operations.forEach((op, idx) => {
          console.log(`   ${idx + 1}. ${op.type} at line ${op.line} (content length: ${op.content?.length || 0})`)
        })
        
        await prisma.patch.create({
          data: {
            patchSetId: patchSet.id,
            filePath: path,
            changeType: 'update',
            hunks: operations.map(op => ({
              type: op.type,
              line: op.line,
              content: op.content,
              oldContent: op.oldContent || null
            }))
          }
        })
        
        console.log(`✅ [DB-SAVE] Patch record created successfully`)
        console.log(`✅ [DB-SAVE] PatchSet ${patchSet.id} linked to project ${projectId}`)
        savedToDatabase = true
        
        console.log(`🎉 [DB-SAVE] Database save completed successfully!`)
        console.log(`📊 [DB-SAVE] Summary:`)
        console.log(`   - Snapshot updated: ✓`)
        console.log(`   - PatchSet created: ${patchSet.id}`)
        console.log(`   - File tracked: ${path}`)
        console.log(`   - Operations applied: ${appliedOperations}/${operations.length}`)
        
      } catch (dbError: any) {
        console.error(`❌ [DB-SAVE] Failed to save to database!`)
        console.error(`❌ [DB-SAVE] Error: ${dbError?.message || dbError}`)
        console.error(`❌ [DB-SAVE] Stack trace:`, dbError?.stack)
        // ไม่ throw error เพื่อไม่ให้กระทบ response หลัก
      }
    } else {
      console.log(`⏭️ [DB-SAVE] Skipping database save - no projectId provided`)
    }
    
    console.log(`✅ [PATCH] Successfully applied ${appliedOperations}/${operations.length} operations to ${path}`)
    
    return NextResponse.json({
      success: true,
      path,
      appliedOperations,
      totalOperations: operations.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully applied ${appliedOperations} patch operations to ${path}`,
      projectId,
      savedToDatabase,
      databaseMessage: savedToDatabase 
        ? 'Changes saved to snapshot and patch history' 
        : projectId 
          ? 'Failed to save to database (check logs)' 
          : 'No projectId provided - changes only in sandbox'
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
