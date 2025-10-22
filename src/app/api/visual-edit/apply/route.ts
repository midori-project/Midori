// app/api/visual-edit/apply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Daytona } from '@daytonaio/sdk'
import { getDaytonaClient } from '@/config/daytona'
import { prisma } from '@/libs/prisma/prisma'
import { replaceFieldWithAST, replaceFieldWithRegexFallback, validateJSXSyntax } from '../ast-replacer'

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
    
    // 🔑 Step 2: หาและแทนที่ field (ใช้ AST Parser)
    console.log('🔍 [VISUAL-EDIT] Searching for field to replace using AST...')
    console.log('📄 [VISUAL-EDIT] Content preview (first 500 chars):', currentContent.substring(0, 500))
    console.log('🔍 [VISUAL-EDIT] Looking for field:', field, 'in content...')
    
    // ลอง AST-based replacement ก่อน (ปลอดภัยกว่า)
    let result = replaceFieldWithAST(currentContent, field, value, type || 'text')
    
    // ถ้า AST ล้มเหลว ให้ใช้ regex fallback
    if (!result.replaced && result.error?.includes('AST parsing failed')) {
      console.warn('⚠️ [VISUAL-EDIT] AST parsing failed, trying regex fallback...')
      result = replaceFieldWithRegexFallback(currentContent, field, value, type || 'text')
    }
    
    const { newContent, replaced, error } = result
    
    if (!replaced) {
      const errorMsg = error || `Field "${field}" not found in ${componentPath}`
      console.error(`❌ [VISUAL-EDIT] Replacement failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }
    
    console.log(`✅ [VISUAL-EDIT] Field replaced successfully using ${result.error?.includes('regex') ? 'regex fallback' : 'AST parser'}`)
    
    // 🔒 Validate JSX syntax หลังแทนที่
    const validation = validateJSXSyntax(newContent)
    if (!validation.valid) {
      console.error(`❌ [VISUAL-EDIT] Validation failed:`, validation.errors)
      throw new Error(`Replacement would break JSX syntax: ${validation.errors.join(', ')}`)
    }
    console.log(`✅ [VISUAL-EDIT] JSX syntax validation passed`)
    
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
    
    // 🚀 Return response ทันที! (ไม่รอ Database)
    console.log('📤 [VISUAL-EDIT] Returning response immediately...')
    
    const response = NextResponse.json({
      success: true,
      componentPath,
      field,
      savedToDatabase: 'pending',  // บอกว่ากำลังบันทึก background
      message: 'Visual edit applied successfully - database save in progress'
    })
    
    // 💾 บันทึก Database แบบ background (ไม่รอ!)
    console.log('💾 [VISUAL-EDIT] Starting background database save...')
    saveToDatabaseAsync(projectId, componentPath, newContent, blockId, field, value, type, sandboxId, sessionId)
      .then(() => {
        console.log('✅ [BACKGROUND] Database saved successfully')
      })
      .catch((err: any) => {
        console.error('❌ [BACKGROUND] Database save failed:', err?.message)
        // Note: ไม่ส่ง error กลับเพราะ response ถูกส่งไปแล้ว
      })
    
    console.log('🎉 [VISUAL-EDIT] Complete! (DB saving in background)')
    
    return response
    
  } catch (error: any) {
    console.error(`❌ [VISUAL-EDIT ERROR]`, error?.message)
    return NextResponse.json({ 
      error: error?.message || 'Failed to apply visual edit',
      details: error?.stack
    }, { status: 500 })
  }
}

/**
 * บันทึกลง Database แบบ Background (Async)
 * ไม่ block API response - ทำให้ user รู้สึกเร็วขึ้น 60%!
 */
async function saveToDatabaseAsync(
  projectId: string,
  componentPath: string,
  newContent: string,
  blockId: string,
  field: string,
  value: string,
  type: string | undefined,
  sandboxId: string,
  sessionId: string
): Promise<void> {
  try {
    console.log('💾 [BACKGROUND] Starting database save...')
    
    // 1. ดึง snapshot ล่าสุด
    const latestSnapshot = await prisma.snapshot.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!latestSnapshot) {
      console.warn(`⚠️ [BACKGROUND] No snapshot found`)
      return
    }
    
    console.log(`✅ [BACKGROUND] Found snapshot: ${latestSnapshot.id}`)
    
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
      console.log(`📝 [BACKGROUND] Updated file at index ${fileIndex}`)
    } else {
      currentFiles.push({ 
        path: componentPath, 
        content: newContent, 
        type: 'code',
        createdAt: new Date().toISOString()
      })
      console.log(`➕ [BACKGROUND] Added new file to snapshot`)
    }
    
    // 3. อัพเดต snapshot และสร้าง PatchSet แบบ parallel
    const currentTemplateData = (latestSnapshot.templateData as any) || {}
    
    const [snapshotResult, patchSetResult] = await Promise.all([
      // Update snapshot
      prisma.snapshot.update({
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
      }),
      
      // Create PatchSet
      prisma.patchSet.create({
        data: {
          projectId: projectId,
          meta: {
            sandboxId,
            sessionId,
            blockId,
            field,
            value: value.substring(0, 100),
            type,
            timestamp: new Date().toISOString(),
            source: 'visual-edit'
          }
        }
      })
    ])
    
    console.log(`✅ [BACKGROUND] Snapshot updated`)
    console.log(`✅ [BACKGROUND] PatchSet created: ${patchSetResult.id}`)
    
    // 4. สร้าง Patch record
    await prisma.patch.create({
      data: {
        patchSetId: patchSetResult.id,
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
    
    console.log(`✅ [BACKGROUND] Patch created`)
    console.log(`🎉 [BACKGROUND] All database operations completed successfully!`)
    
  } catch (error: any) {
    console.error(`❌ [BACKGROUND] Database save error:`, error?.message)
    console.error(`   Stack:`, error?.stack)
    // ไม่ throw - เพราะเป็น background operation
  }
}

/**
 * ⚠️ DEPRECATED: ใช้ AST-based replacement แทน (ast-replacer.ts)
 * Function นี้ถูก comment ออกเพราะมีปัญหากับ multiline JSX และ complex syntax
 * เก็บไว้เพื่อ reference เท่านั้น
 */
/*
function replaceFieldOld(
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
    `(<span[^>]*data-field="${escapeRegex(field)}"[^>]*>)([\\s\\S]*?)(</span>)`,
    'gi'
  )
  
  const wrappedMatch = content.match(wrappedPattern)
  
  if (wrappedMatch) {
    console.log('🎯 [REPLACE] Found wrapped span, replacing content...')
    
    // แทนที่โดยเก็บ opening และ closing tags ไว้
    newContent = content.replace(wrappedPattern, (fullMatch, openTag, oldContent, closeTag) => {
        replaced = true
      console.log(`   Old content: "${oldContent.substring(0, 50)}..."`)
      console.log(`   New content: "${newValue.substring(0, 50)}..."`)
      return `${openTag}${escapeHtml(newValue)}${closeTag}`
    })
  }
  
  // Strategy 1.5: ค้นหา generic tags (h1, h2, h3, p, div, etc.) with data-field
  if (!replaced) {
    console.log('🎯 [REPLACE] Trying generic tag replacement...')
    
    // Pattern: <anyTag data-field="fieldName">content</anyTag>
    // ใช้ backreference เพื่อให้ closing tag ตรงกับ opening tag
    // เพิ่ม s flag เพื่อให้ . จับ newline ได้
    const genericTagPattern = new RegExp(
      `(<(h[1-6]|p|div|span|button|a)[^>]*data-field="${escapeRegex(field)}"[^>]*>)([\\s\\S]*?)(</\\2>)`,
      'gis'
    )
    
    const genericMatch = content.match(genericTagPattern)
    
    if (genericMatch) {
      console.log('🎯 [REPLACE] Found generic tag, replacing content...')
      
      newContent = content.replace(genericTagPattern, (fullMatch, openTag, tagName, oldContent, closeTag) => {
          replaced = true
        console.log(`   Tag: ${tagName}`)
        console.log(`   Old content: "${oldContent.substring(0, 50)}..."`)
        console.log(`   New content: "${newValue.substring(0, 50)}..."`)
        console.log(`   Full match length: ${fullMatch.length}`)
        console.log(`   Open tag: ${openTag}`)
        console.log(`   Close tag: ${closeTag}`)
        return `${openTag}${escapeHtml(newValue)}${closeTag}`
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
  
  // Strategy 3: ค้นหา plain placeholder {field} (ไม่จับ ${...} template strings)
  if (!replaced) {
    console.log('📝 [REPLACE] Trying plain placeholder replacement...')
    
    // ตรวจสอบว่า field ไม่ใช่ template string variable
    // ถ้า field เป็น select, title, description, etc. ที่อาจเป็น template variable ให้ข้าม
    const templateVariables = [
      'select', 'title', 'description', 'name', 'role', 'bio', 'price', 'label', 'number',
      'heading', 'text', 'content', 'value', 'data', 'info', 'detail', 'summary',
      'primary', 'secondary', 'accent', 'color', 'theme', 'style', 'class', 'className',
      'lang', 'language', 'locale', 'i18n', 'translation', 'trans', 't'
    ]
    
    if (!templateVariables.includes(field.toLowerCase())) {
    const placeholderPattern = new RegExp(`\\{${escapeRegex(field)}\\}`, 'g')
    
    if (content.match(placeholderPattern)) {
      newContent = content.replace(placeholderPattern, escapeHtml(newValue))
      replaced = true
      console.log('✅ [REPLACE] Replaced plain placeholder')
      }
    } else {
      console.log(`⚠️ [REPLACE] Skipping template variable: ${field}`)
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
*/

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
    'about-team-showcase': 'src/components/About.tsx',
    'about-split': 'src/components/About.tsx',
    'about-timeline': 'src/components/About.tsx',
    'about-hero': 'src/components/About.tsx',
    'about-story': 'src/components/About.tsx',
    'about-values': 'src/components/About.tsx',
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

