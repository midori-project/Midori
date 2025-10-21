// app/api/visual-edit/apply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Daytona } from '@daytonaio/sdk'
import { getDaytonaClient } from '@/config/daytona'
import { prisma } from '@/libs/prisma/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface VisualEditRequest {
  sandboxId: string
  projectId: string
  blockId: string
  field: string
  value: string
  type?: 'text' | 'heading' | 'subheading' | 'button' | 'image' | 'icon' | 'badge'
}

/**
 * Visual Edit API
 * อ่านจาก Daytona → หาและแทนที่ → เขียนกลับ Daytona (HMR) → บันทึก DB
 */
export async function POST(req: NextRequest) {
  console.log('🎨 [VISUAL-EDIT] ========== API CALLED ==========')
  
  try {
    console.log('📥 [VISUAL-EDIT] Parsing request body...')
    const body: VisualEditRequest = await req.json()
    const { sandboxId, projectId, blockId, field, value, type } = body
    
    console.log('✅ [VISUAL-EDIT] Request parsed successfully!')
    console.log('   Sandbox:', sandboxId)
    console.log('   Project:', projectId)
    console.log('   Block:', blockId)
    console.log('   Field:', field)
    console.log('   Value:', value?.substring?.(0, 50) || value)
    console.log('   Type:', type)
    
    // Validate request
    if (!sandboxId || !projectId || !blockId || !field || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }
    
    // Map blockId to component path
    const componentPath = getComponentPath(blockId)
    console.log('📁 [VISUAL-EDIT] Component path:', componentPath)
    
    // Connect to Daytona
    const daytona = new Daytona(getDaytonaClient())
    const sandbox = await daytona.get(sandboxId)
    
    const sessionId = `visual-edit-${Date.now()}-${Math.random().toString(36).substring(7)}`
    console.log(`📝 [VISUAL-EDIT] Creating session: ${sessionId}`)
    
    try {
      await sandbox.process.createSession(sessionId)
    } catch (sessionError: any) {
      if (sessionError?.message?.includes('already exists')) {
        try {
          await sandbox.process.deleteSession(sessionId)
        } catch {}
        await sandbox.process.createSession(sessionId)
      } else {
        throw sessionError
      }
    }
    
    // 🔑 Step 1: อ่านไฟล์จาก Daytona (source of truth)
    console.log('📖 [VISUAL-EDIT] Reading file from Daytona...')
    console.log('📁 [VISUAL-EDIT] Component path:', componentPath)
    
    const readResult = await sandbox.process.executeSessionCommand(sessionId, {
      command: `cat "${componentPath}" 2>/dev/null || echo ""`,
      runAsync: false,
    })
    
    const currentContent = readResult.stdout || readResult.output || ''
    console.log(`✅ [VISUAL-EDIT] File read: ${currentContent.length} characters`)
    console.log('📄 [VISUAL-EDIT] File first 500 chars:', currentContent.substring(0, 500))
    
    // Debug: ตรวจสอบว่ามี data-field ไหม
    const hasDataField = currentContent.includes('data-field=')
    console.log('🔍 [VISUAL-EDIT] File has data-field?', hasDataField)
    if (hasDataField) {
      const allDataFields = currentContent.match(/data-field="([^"]+)"/g)
      console.log('📋 [VISUAL-EDIT] All data-fields in file:', allDataFields ? allDataFields.slice(0, 10) : 'none')
    }
    
    if (!currentContent) {
      throw new Error(`File not found: ${componentPath}`)
    }
    
    // 🔑 Step 2: หาและแทนที่ field
    console.log('🔍 [VISUAL-EDIT] Searching for field to replace...')
    console.log('📄 [VISUAL-EDIT] Content preview (first 500 chars):', currentContent.substring(0, 500))
    console.log('🔍 [VISUAL-EDIT] Looking for field:', field, 'in content...')
    const { newContent, replaced } = replaceField(currentContent, blockId, field, value, type || 'text')
    
    if (!replaced) {
      throw new Error(`Field "${field}" not found in ${componentPath}`)
    }
    
    console.log(`✅ [VISUAL-EDIT] Field replaced successfully`)
    
    // 🔑 Step 3: เขียนกลับ Daytona (→ HMR จะทำงาน)
    console.log('💾 [VISUAL-EDIT] Writing updated file to Daytona...')
    const b64Content = Buffer.from(newContent).toString('base64')
    
    const writeResult = await sandbox.process.executeSessionCommand(sessionId, {
      command: `echo "${b64Content}" | base64 -d > "${componentPath}"`,
      runAsync: false,
    })
    
    if (writeResult.exitCode !== 0) {
      throw new Error(`Failed to write file: ${writeResult.stderr || writeResult.output}`)
    }
    
    console.log('✅ [VISUAL-EDIT] File written to Daytona - HMR should trigger!')
    
    // ✅ ลบ session
    try {
      await sandbox.process.deleteSession(sessionId)
    } catch {}
    
    // 🔑 Step 4: บันทึกลง Database (reuse logic from partial update)
    console.log('💾 [VISUAL-EDIT] Saving to database...')
    let savedToDatabase = false
    
    try {
      // 1. ดึง snapshot ล่าสุด
      const latestSnapshot = await prisma.snapshot.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      })
      
      if (latestSnapshot) {
        console.log(`✅ [DB] Found snapshot: ${latestSnapshot.id}`)
        
        // 2. อัพเดตไฟล์ใน snapshot
        const snapshotFiles = latestSnapshot.files as any
        let currentFiles: any[] = Array.isArray(snapshotFiles) 
          ? [...snapshotFiles] 
          : (snapshotFiles?.files || [])
        
        const fileIndex = currentFiles.findIndex((f: any) => 
          f.path === componentPath || f.filePath === componentPath
        )
        
        if (fileIndex >= 0) {
          currentFiles[fileIndex] = {
            ...currentFiles[fileIndex],
            content: newContent,
            path: componentPath,
            updatedAt: new Date().toISOString()
          }
          console.log(`📝 [DB] Updated file at index ${fileIndex}`)
        } else {
          currentFiles.push({ 
            path: componentPath, 
            content: newContent, 
            type: 'code',
            createdAt: new Date().toISOString()
          })
          console.log(`➕ [DB] Added new file to snapshot`)
        }
        
        // 3. อัพเดต snapshot
        const currentTemplateData = (latestSnapshot.templateData as any) || {}
        
        await prisma.snapshot.update({
          where: { id: latestSnapshot.id },
          data: { 
            files: currentFiles,
            templateData: {
              ...currentTemplateData,
              lastVisualEdit: new Date().toISOString(),
              visualEditCount: (currentTemplateData.visualEditCount || 0) + 1,
              lastVisualEditField: `${blockId}.${field}`
            }
          }
        })
        
        console.log(`✅ [DB] Snapshot updated`)
        
        // 4. บันทึก PatchSet (สำหรับ history)
        const patchSet = await prisma.patchSet.create({
          data: {
            projectId: projectId,
            meta: {
              sandboxId,
              sessionId,
              blockId,
              field,
              value: value.substring(0, 100), // เก็บแค่ 100 ตัวอักษรแรก
              type,
              timestamp: new Date().toISOString(),
              source: 'visual-edit'
            }
          }
        })
        
        // 5. สร้าง Patch record
        await prisma.patch.create({
          data: {
            patchSetId: patchSet.id,
            filePath: componentPath,
            changeType: 'update',
            hunks: [{
              type: 'visual-edit',
              field,
              value,
              blockId
            }]
          }
        })
        
        console.log(`✅ [DB] PatchSet created: ${patchSet.id}`)
        savedToDatabase = true
      } else {
        console.warn(`⚠️ [DB] No snapshot found`)
      }
    } catch (dbError: any) {
      console.error(`❌ [DB] Failed to save:`, dbError?.message)
      // ไม่ throw - ให้ Daytona update ยังสำเร็จอยู่
    }
    
    console.log('🎉 [VISUAL-EDIT] Complete!')
    
    return NextResponse.json({
      success: true,
      componentPath,
      field,
      savedToDatabase,
      message: savedToDatabase 
        ? 'Visual edit applied and saved to database' 
        : 'Visual edit applied (DB save failed)',
    })
    
  } catch (error: any) {
    console.error(`❌ [VISUAL-EDIT ERROR]`, error?.message)
    return NextResponse.json({ 
      error: error?.message || 'Failed to apply visual edit',
      details: error?.stack
    }, { status: 500 })
  }
}

/**
 * หาและแทนที่ field ในไฟล์
 */
function replaceField(
  content: string, 
  blockId: string, 
  field: string, 
  newValue: string,
  type: string
): { newContent: string; replaced: boolean } {
  
  let replaced = false
  let newContent = content
  
  // Escape special regex characters
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const escapeHtml = (str: string) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  
  console.log(`🔧 [REPLACE] Starting replacement for field: "${field}", type: "${type}"`)
  
  // 🎯 FIX: Strategy 0 - ถ้าเป็น image ให้ทำ image attribute replacement ก่อนเลย
  if (type === 'image' || field.includes('Image') || field.includes('image')) {
    console.log('🖼️ [REPLACE] Image field detected - trying attribute replacement first...')
    
    // ถ้าเป็น alt attribute
    if (field.toLowerCase().includes('alt')) {
      const altPattern1 = new RegExp(
        `(data-field="${escapeRegex(field)}"[^>]*alt=")([^"]*)(")`,'gi'
      )
      const altPattern2 = new RegExp(
        `(alt=")([^"]*)("[^>]*data-field="${escapeRegex(field)}")`,'gi'
      )
      
      if (content.match(altPattern1)) {
        newContent = content.replace(altPattern1, `$1${escapeHtml(newValue)}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced alt attribute (pattern 1)')
      } else if (content.match(altPattern2)) {
        newContent = content.replace(altPattern2, `$1${escapeHtml(newValue)}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced alt attribute (pattern 2)')
      }
    } 
    // ถ้าเป็น src attribute
    else {
      const srcPattern1 = new RegExp(
        `(data-field="${escapeRegex(field)}"[^>]*src=")([^"]*)(")`,'gi'
      )
      const srcPattern2 = new RegExp(
        `(src=")([^"]*)("[^>]*data-field="${escapeRegex(field)}")`,'gi'
      )
      
      if (content.match(srcPattern1)) {
        newContent = content.replace(srcPattern1, `$1${newValue}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced src attribute (pattern 1)')
      } else if (content.match(srcPattern2)) {
        newContent = content.replace(srcPattern2, `$1${newValue}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced src attribute (pattern 2)')
      }
    }
    
    // ถ้ายังไม่สำเร็จ ลอง template format
    if (!replaced) {
      const templatePattern = new RegExp(
        `(src=")\\{${escapeRegex(field)}\\}("[\\s\\S]*?data-field="${escapeRegex(field)}")`,
        'gims'
      )
      
      if (content.match(templatePattern)) {
        newContent = content.replace(templatePattern, `$1${newValue}$2`)
        replaced = true
        console.log('✅ [REPLACE] Replaced template format')
      }
    }
    
    // ลอง simple template format
    if (!replaced) {
      const simpleTemplatePattern = new RegExp(
        `(src=")\\{${escapeRegex(field)}\\}(")`,
        'gims'
      )
      
      if (content.match(simpleTemplatePattern)) {
        newContent = content.replace(simpleTemplatePattern, `$1${newValue}$2`)
        replaced = true
        console.log('✅ [REPLACE] Replaced simple template format')
      }
    }
    
    // Return ทันทีถ้าแทนที่สำเร็จ - ไม่ต้องไป Strategy 1 หรือ 1.5 (ป้องกันแทนที่ซ้ำ)
    if (replaced) {
      console.log('🎉 [REPLACE] Image replacement successful, skipping text strategies')
      return { newContent, replaced };
    }
  }
  
  // 🎯 FIX: Strategy 0.5 - ถ้าเป็น icon ให้ทำ icon replacement ก่อนเลย
  if (type === 'icon' || field.includes('icon') || field.includes('Icon')) {
    console.log('🎨 [REPLACE] Icon field detected - trying icon replacement first...')
    
    // Pattern 1: icon ใน span tag
    const iconSpanPattern = new RegExp(
      `<span[^>]*data-field="${escapeRegex(field)}"[^>]*>([\\s\\S]*?)</span>`,
      'gims'
    )
    
    if (content.match(iconSpanPattern)) {
      newContent = content.replace(iconSpanPattern, (fullMatch) => {
        const openTagEnd = fullMatch.indexOf('>')
        if (openTagEnd >= 0) {
          const openTag = fullMatch.substring(0, openTagEnd + 1)
          replaced = true
          // ไม่ escape HTML สำหรับ icon เพราะอาจเป็น emoji
          return `${openTag}${newValue}</span>`
        }
        return fullMatch
      })
      console.log('✅ [REPLACE] Replaced icon in span tag')
    }
    
    // Pattern 2: icon ใน generic tag
    if (!replaced) {
      const iconTagPattern = new RegExp(
        `<([a-zA-Z][a-zA-Z0-9]*)[^>]*data-field="${escapeRegex(field)}"[^>]*>([\\s\\S]*?)</\\1>`,
        'gims'
      )
      
      if (content.match(iconTagPattern)) {
        newContent = content.replace(iconTagPattern, (fullMatch, tagName) => {
          const openTagEnd = fullMatch.indexOf('>')
          if (openTagEnd >= 0) {
            const openTag = fullMatch.substring(0, openTagEnd + 1)
            replaced = true
            // ไม่ escape HTML สำหรับ icon เพราะอาจเป็น emoji
            return `${openTag}${newValue}</${tagName}>`
          }
          return fullMatch
        })
        console.log('✅ [REPLACE] Replaced icon in generic tag')
      }
    }
    
    // Return ทันทีถ้าแทนที่สำเร็จ
    if (replaced) {
      console.log('🎉 [REPLACE] Icon replacement successful, skipping text strategies')
      return { newContent, replaced };
    }
  }
  
  // Strategy 1: ค้นหา wrapped span (multiline) - สำหรับ text content เท่านั้น
  // <span data-editable="true" data-block-id="..." data-field="..." data-type="...">OLD VALUE</span>
  const wrappedPattern = new RegExp(
    `<span[\\s\\S]*?data-field="${escapeRegex(field)}"[\\s\\S]*?>([\\s\\S]*?)</span>`,
    'gims'
  )
  
  const wrappedMatch = content.match(wrappedPattern)
  
  if (wrappedMatch) {
    console.log('🎯 [REPLACE] Found wrapped span, replacing content...')
    
    // แทนที่เฉพาะ content ข้างใน span
    newContent = content.replace(wrappedPattern, (fullMatch) => {
      // เก็บ attributes เดิมไว้ แทนที่แค่ content
      const openTagEnd = fullMatch.indexOf('>')
      const closeTagStart = fullMatch.lastIndexOf('</')
      
      if (openTagEnd >= 0 && closeTagStart > openTagEnd) {
        const openTag = fullMatch.substring(0, openTagEnd + 1)
        replaced = true
        return `${openTag}${escapeHtml(newValue)}</span>`
      }
      
      return fullMatch
    })
  }
  
  // Strategy 1.5: ค้นหา generic tags (h1, h2, h3, p, div, etc.) with data-field
  if (!replaced) {
    console.log('🎯 [REPLACE] Trying generic tag replacement...')
    
    // Pattern: <anyTag data-field="fieldName">content</anyTag>
    const genericTagPattern = new RegExp(
      `<([a-zA-Z][a-zA-Z0-9]*)[\\s\\S]*?data-field="${escapeRegex(field)}"[\\s\\S]*?>([\\s\\S]*?)</\\1>`,
      'gims'
    )
    
    const genericMatch = content.match(genericTagPattern)
    
    if (genericMatch) {
      console.log('🎯 [REPLACE] Found generic tag, replacing content...')
      
      newContent = content.replace(genericTagPattern, (fullMatch, tagName) => {
        // เก็บ attributes เดิมไว้ แทนที่แค่ content
        const openTagEnd = fullMatch.indexOf('>')
        const closeTagStart = fullMatch.lastIndexOf('</')
        
        if (openTagEnd >= 0 && closeTagStart > openTagEnd) {
          const openTag = fullMatch.substring(0, openTagEnd + 1)
          replaced = true
          return `${openTag}${escapeHtml(newValue)}</${tagName}>`
        }
        
        return fullMatch
      })
    }
  }
  
  // Strategy 2: ถ้าเป็น image field (fallback), ค้นหา attribute ใน <img> tag
  if (!replaced && (field.includes('Image') || field.includes('image') || type === 'image')) {
    console.log('🖼️ [REPLACE] Trying image attribute replacement (fallback)...')
    
    // ถ้าเป็น alt attribute
    if (field.toLowerCase().includes('alt')) {
      // Pattern 1: data-field comes before alt
      const altPattern1 = new RegExp(
        `(data-field="${escapeRegex(field)}"[^>]*alt=")([^"]*)(")`,'gi'
      )
      // Pattern 2: alt comes before data-field (template format)
      const altPattern2 = new RegExp(
        `(alt=")([^"]*)("[^>]*data-field="${escapeRegex(field)}")`,'gi'
      )
      
      if (content.match(altPattern1)) {
        newContent = content.replace(altPattern1, `$1${escapeHtml(newValue)}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced alt attribute (pattern 1)')
      } else if (content.match(altPattern2)) {
        newContent = content.replace(altPattern2, `$1${escapeHtml(newValue)}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced alt attribute (pattern 2)')
      }
    } 
    // ถ้าเป็น src attribute
    else {
      // Pattern 1: data-field comes before src
      const srcPattern1 = new RegExp(
        `(data-field="${escapeRegex(field)}"[^>]*src=")([^"]*)(")`,'gi'
      )
      // Pattern 2: src comes before data-field (template format)
      const srcPattern2 = new RegExp(
        `(src=")([^"]*)("[^>]*data-field="${escapeRegex(field)}")`,'gi'
      )
      
      if (content.match(srcPattern1)) {
        newContent = content.replace(srcPattern1, `$1${newValue}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced src attribute (pattern 1)')
      } else if (content.match(srcPattern2)) {
        newContent = content.replace(srcPattern2, `$1${newValue}$3`)
        replaced = true
        console.log('✅ [REPLACE] Replaced src attribute (pattern 2)')
      }
    }
  }
  
  // Strategy 3: ค้นหา plain placeholder {field}
  if (!replaced) {
    console.log('📝 [REPLACE] Trying plain placeholder replacement...')
    const placeholderPattern = new RegExp(`\\{${escapeRegex(field)}\\}`, 'g')
    
    if (content.match(placeholderPattern)) {
      newContent = content.replace(placeholderPattern, escapeHtml(newValue))
      replaced = true
      console.log('✅ [REPLACE] Replaced plain placeholder')
    }
  }
  
  // Strategy 4: ค้นหา template format src="{field}" with data-field
  if (!replaced && (field.includes('Image') || field.includes('image') || type === 'image')) {
    console.log('🎯 [REPLACE] Trying template format replacement...')
    
    // Pattern for template format: src="{heroImage}" ... data-field="heroImage"
    // รองรับ attributes ระหว่าง src และ data-field
    const templatePattern = new RegExp(
      `(src=")\\{${escapeRegex(field)}\\}("[\\s\\S]*?data-field="${escapeRegex(field)}")`,
      'gims'
    )
    
    if (content.match(templatePattern)) {
      newContent = content.replace(templatePattern, `$1${newValue}$2`)
      replaced = true
      console.log('✅ [REPLACE] Replaced template format')
    }
  }
  
  // Strategy 5: ค้นหา template format src="{field}" แบบง่าย (ไม่มี data-field)
  if (!replaced && (field.includes('Image') || field.includes('image') || type === 'image')) {
    console.log('🎯 [REPLACE] Trying simple template format replacement...')
    
    // Pattern for simple template format: src="{heroImage}"
    const simpleTemplatePattern = new RegExp(
      `(src=")\\{${escapeRegex(field)}\\}(")`,
      'gims'
    )
    
    if (content.match(simpleTemplatePattern)) {
      newContent = content.replace(simpleTemplatePattern, `$1${newValue}$2`)
      replaced = true
      console.log('✅ [REPLACE] Replaced simple template format')
    }
  }
  
  return { newContent, replaced }
}

/**
 * แปลง blockId เป็น component path
 */
function getComponentPath(blockId: string): string {
  // Direct mapping to template system files
  const componentMap: Record<string, string> = {
    'hero': 'src/components/Hero.tsx',
    'hero-basic': 'src/components/Hero.tsx',
    'about': 'src/components/About.tsx',
    'about-basic': 'src/components/About.tsx',
    'about-minimal': 'src/components/About-minimal.tsx',
    'features': 'src/components/Features.tsx',
    'features-basic': 'src/components/Features.tsx',
    'cta': 'src/components/CTA.tsx',
    'cta-basic': 'src/components/CTA.tsx',
    'footer': 'src/components/Footer.tsx',
    'footer-basic': 'src/components/Footer.tsx',
    'header': 'src/components/Header.tsx',
    'header-basic': 'src/components/Header.tsx',
    'navbar': 'src/components/Navbar.tsx',
    'navbar-basic': 'src/components/Navbar.tsx',
    'menu': 'src/components/Menu.tsx',
    'menu-basic': 'src/components/Menu.tsx',
    'contact': 'src/components/Contact.tsx',
    'contact-basic': 'src/components/Contact.tsx',
  }
  
  // ถ้ามีใน map ให้ใช้เลย
  if (componentMap[blockId]) {
    return componentMap[blockId];
  }
  
  // ถ้าไม่มี ให้ strip `-basic`, `-variant` ออกแล้วลองใหม่
  const baseBlockId = blockId.replace(/-basic$|-variant\d*$/, '');
  if (componentMap[baseBlockId]) {
    return componentMap[baseBlockId];
  }
  
  // Fallback: capitalize first letter
  const componentName = baseBlockId.charAt(0).toUpperCase() + baseBlockId.slice(1);
  return `src/components/${componentName}.tsx`;
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

