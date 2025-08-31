const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUserProjects() {
  const userId = '755deeeb-a781-4610-bb35-06e4bc62092c';
  
  // ตรวจสอบว่า user มีอยู่จริงหรือไม่
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    console.log(`❌ ไม่พบ user id: ${userId}`);
    return;
  }
  
  console.log(`✅ พบ user: ${user.name} (${user.email})`);
  
  const projectData = [
    {
      name: "E-Commerce Platform",
      description: "ระบบขายของออนไลน์แบบครบวงจร พร้อมระบบจัดการสินค้า ตะกร้าสินค้า และการชำระเงิน",
      category: "E-Commerce",
      framework: "Next.js",
      styling: "Tailwind CSS"
    },
    {
      name: "Task Management App",
      description: "แอปพลิเคชันจัดการงานและโปรเจค พร้อมระบบแจ้งเตือนและการทำงานร่วมกัน",
      category: "Productivity",
      framework: "React",
      styling: "Material-UI"
    },
    {
      name: "Restaurant Website",
      description: "เว็บไซต์ร้านอาหารพร้อมเมนู การจองโต๊ะ และระบบสั่งอาหารออนไลน์",
      category: "Business",
      framework: "Next.js",
      styling: "Tailwind CSS"
    },
    {
      name: "Learning Management System",
      description: "ระบบจัดการการเรียนรู้ออนไลน์ พร้อมคอร์สเรียน วิดีโอ และระบบทดสอบ",
      category: "Education",
      framework: "Next.js",
      styling: "Chakra UI"
    },
    {
      name: "Weather Dashboard",
      description: "แดชบอร์ดแสดงสภาพอากาศแบบเรียลไทม์ พร้อมการพยากรณ์อากาศ 7 วัน",
      category: "Utility",
      framework: "React",
      styling: "Tailwind CSS"
    },
    {
      name: "Portfolio Website",
      description: "เว็บไซต์แสดงผลงานส่วนบุคคล พร้อมแกลเลอรี่และหน้าติดต่อ",
      category: "Portfolio",
      framework: "Next.js",
      styling: "CSS Modules"
    },
    {
      name: "Chat Application",
      description: "แอปพลิเคชันแชทแบบเรียลไทม์ พร้อมระบบกลุ่มและการแชร์ไฟล์",
      category: "Communication",
      framework: "Next.js",
      styling: "Tailwind CSS"
    },
    {
      name: "Blog Platform",
      description: "แพลตฟอร์มบล็อกพร้อมระบบเขียนบทความ หมวดหมู่ และความคิดเห็น",
      category: "Content Management",
      framework: "Next.js",
      styling: "Tailwind CSS"
    },
    {
      name: "Fitness Tracker",
      description: "แอปติดตามการออกกำลังกาย พร้อมสถิติ เป้าหมาย และการวางแผนการออกกำลังกาย",
      category: "Health & Fitness",
      framework: "React",
      styling: "Styled Components"
    },
    {
      name: "Event Management System",
      description: "ระบบจัดการงานอีเวนท์ พร้อมการลงทะเบียน ตารางเวลา และการจัดการผู้เข้าร่วม",
      category: "Event Management",
      framework: "Next.js",
      styling: "Tailwind CSS"
    }
  ];
  
  console.log(`🚀 เริ่มสร้าง ${projectData.length} projects สำหรับ user: ${user.name}`);
  
  for (let i = 0; i < projectData.length; i++) {
    const project = projectData[i];
    
    try {
      const createdProject = await prisma.project.create({
        data: {
          name: project.name,
          description: project.description,
          userId: userId,
          visibility: Math.random() > 0.3 ? 'public' : 'private', // 70% public, 30% private
          likeCount: Math.floor(Math.random() * 500) + 10, // Random likes between 10-510
          files: {
            create: [
              {
                path: 'package.json',
                content: JSON.stringify({
                  name: project.name.toLowerCase().replace(/\s+/g, '-'),
                  version: '1.0.0',
                  description: project.description,
                  main: 'index.js',
                  scripts: {
                    dev: 'next dev',
                    build: 'next build',
                    start: 'next start'
                  },
                  dependencies: {
                    'next': '^15.0.0',
                    'react': '^18.0.0',
                    'react-dom': '^18.0.0'
                  }
                }, null, 2),
                type: 'code'
              },
              {
                path: 'README.md',
                content: `# ${project.name}\n\n${project.description}\n\n## Framework\n${project.framework}\n\n## Styling\n${project.styling}\n\n## Category\n${project.category}`,
                type: 'code'
              },
              {
                path: 'index.js',
                content: `// ${project.name}\n// ${project.description}\n\nimport React from 'react';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-gray-100">\n      <header className="bg-white shadow">\n        <h1 className="text-3xl font-bold text-gray-900 p-6">\n          ${project.name}\n        </h1>\n      </header>\n      <main className="container mx-auto px-4 py-8">\n        <p className="text-lg text-gray-700 mb-8">\n          ${project.description}\n        </p>\n        <div className="bg-white rounded-lg shadow p-6">\n          <h2 className="text-xl font-semibold mb-4">เริ่มต้นใช้งาน</h2>\n          <p className="text-gray-600">\n            โปรเจคนี้ใช้ ${project.framework} และ ${project.styling}\n          </p>\n        </div>\n      </main>\n    </div>\n  );\n}\n\nexport default App;`,
                type: 'code'
              }
            ]
          }
        },
        include: {
          files: true
        }
      });
      
      console.log(`✅ สร้าง project ${i + 1}/10: "${createdProject.name}" (${createdProject.id})`);
      
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการสร้าง project "${project.name}":`, error.message);
    }
  }
  
  console.log('\n🎉 สร้าง projects เสร็จเรียบร้อยแล้ว!');
  
  // แสดงข้อมูลสรุป
  const userProjects = await prisma.project.findMany({
    where: { userId: userId },
    select: {
      id: true,
      name: true,
      visibility: true,
      likeCount: true,
      _count: {
        select: {
          files: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`\n📊 สรุป: User ${user.name} มี ${userProjects.length} projects ทั้งหมด`);
  userProjects.forEach((project, index) => {
    console.log(`${index + 1}. ${project.name} - ${project.visibility} - ${project.likeCount} likes - ${project._count.files} files`);
  });
}

createUserProjects()
  .catch((error) => {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
