/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    const ContentSecurityPolicy = `
      default-src 'self';
      frame-src 'self' https://*.codesandbox.io https://codesandbox.io https://*.sandpack.codesandbox.io https://*.proxy.daytona.works https://*.daytona.work http://*.proxy.daytona.works http://*.daytona.work;
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self' data:;
      connect-src 'self' https://*.proxy.daytona.works https://*.daytona.work wss://*.proxy.daytona.works wss://*.daytona.work http://*.proxy.daytona.works http://*.daytona.work ws://*.proxy.daytona.works ws://*.daytona.work;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
    `.replace(/\s{2,}/g, ' ').trim()

    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }]
  },
}
module.exports = nextConfig
