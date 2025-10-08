import axios from 'axios';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'midori.lol';

type FileItem = { file: string; data: string };

export async function deployStaticSite(subdomain: string, files: FileItem[]) {
  if (!VERCEL_TOKEN) throw new Error('Missing VERCEL_TOKEN');

  console.log(`🚀 Starting deployment for: ${subdomain}`);
  console.log(`📁 Files to deploy: ${files.length}`);

  const { data } = await axios.post(
    'https://api.vercel.com/v13/deployments',
    {
      name: subdomain,
      target: 'production',
      files,
      projectSettings: {
        framework: 'vite',
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install',
      },
    },
    {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      params: VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : undefined,
    }
  );

  const deploymentId = data.id;
  console.log(`✅ Deployment created: ${deploymentId}`);

  const domain = `${subdomain}.${MAIN_DOMAIN}`;
  try {
    await axios.post(
      `https://api.vercel.com/v9/projects/${subdomain}/domains`,
      { name: domain },
      {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
        params: VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : undefined,
      }
    );
    console.log(`✅ Custom domain added: ${domain}`);
  } catch (e: any) {
    if (e?.response?.status !== 409) {
      console.warn(
        `⚠️ Failed to add domain: ${e.response?.status} ${e.response?.data?.error?.message || e.message}`
      );
    } else {
      console.log(`✅ Domain already exists: ${domain}`);
    }
  }

  console.log(`⏳ Waiting for deployment to complete...`);
  for (let i = 0; i < 30; i++) {
    const r = await axios.get(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
        params: VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : undefined,
      }
    );

    const state = r.data.readyState;
    console.log(`⏳ Deployment state: ${state} (${i + 1}/30)`);

    if (state === 'READY') {
      console.log(`🎉 Deployment completed successfully!`);
      break;
    }
    if (state === 'ERROR') {
      throw new Error('Deployment failed');
    }

    await new Promise((res) => setTimeout(res, 5000));
  }

  return { url: `https://${domain}` };
}
