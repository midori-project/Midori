// create_mock_project_with_preview.js
// Usage: node scripts/create_mock_project_with_preview.js <userId> <categoryId1> [<categoryId2> ...] <previewUrl>
// Example: node scripts/create_mock_project_with_preview.js 755deeeb-a781-4610-bb35-06e4bc62092c 3a2e42c5-5e24-4ca2-8987-758007346979 https://via.placeholder.com/300.png
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node scripts/create_mock_project_with_preview.js <userId> <categoryId1> [<categoryId2> ...] <previewUrl>');
    process.exit(1);
  }

  const userId = args[0];
  const previewUrl = args[args.length - 1];
  const categoryIds = [...new Set(args.slice(1, -1))];

  try {
    const project = await prisma.project.create({
      data: {
        userId,
        name: `Mock Project`,
        description: 'Mock project created for testing preview url',
        options: { theme: 'default' },
        visibility: 'public',
      },
    });

    for (let i = 0; i < categoryIds.length; i++) {
      const id = categoryIds[i];
      const cat = await prisma.category.findUnique({ where: { id } });
      if (!cat) {
        console.warn('Category not found:', id);
        continue;
      }
      await prisma.projectCategory.create({ data: { projectId: project.id, categoryId: id, order: i } });
    }

    const file = await prisma.file.create({ data: { projectId: project.id, path: previewUrl, type: 'asset', isBinary: false, content: previewUrl } });
    await prisma.project.update({ where: { id: project.id }, data: { previewFileId: file.id } });

    const full = await prisma.project.findUnique({ where: { id: project.id }, include: { previewFile: true, projectCategories: { include: { category: true } } } });
    console.log('Created project with preview:');
    console.dir(full, { depth: 5 });
  } catch (err) {
    console.error('Error creating mock project:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
