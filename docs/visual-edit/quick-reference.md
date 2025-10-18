# Visual Edit Mode - Quick Reference

## 🚀 Quick Commands

### Test Storage API
```bash
# Upload
curl -X POST http://localhost:3000/api/test/storage/upload \
  -F "file=@/path/to/image.jpg"

# List
curl "http://localhost:3000/api/test/storage/list?prefix=test/"

# Delete
curl -X DELETE "http://localhost:3000/api/test/storage/delete?path=test/abc123.jpg"
```

### Environment Variables
```env
STORAGE_PROVIDER=cloudflare-r2
CLOUDFLARE_ACCOUNT_ID=832594a3255fccbb6b3f3e3136b321cc
CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=yyy
CLOUDFLARE_R2_BUCKET_NAME=midori
CLOUDFLARE_R2_PUBLIC_URL=https://pub-832594a3255fccbb6b3f3e3136b321cc.r2.dev
```

---

## 📁 File Structure

```
Midori/
├── src/
│   ├── libs/services/
│   │   └── storageService.ts          # Storage abstraction
│   ├── app/
│   │   ├── api/test/storage/          # Test API endpoints
│   │   │   ├── upload/route.ts
│   │   │   ├── list/route.ts
│   │   │   └── delete/route.ts
│   │   └── test/storage/
│   │       └── page.tsx               # Test UI page
│   └── components/projects/
│       └── VisualEditPanel.tsx        # Edit panel (planned)
├── docs/visual-edit/
│   ├── README.md                      # Main documentation
│   ├── visual-edit-implementation-plan.md
│   ├── cloudflare-r2-setup.md
│   ├── cloudflare-r2-usage-guide.md
│   ├── visual-edit-fixes.md
│   ├── visual-edit-troubleshooting.md
│   └── quick-reference.md             # This file
└── .env.local                         # Environment variables
```

---

## 🔧 Common Code Snippets

### Upload File
```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/test/storage/upload', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  return result.data.url
}
```

### Use Storage Service
```typescript
import { getStorageProvider } from '@/libs/services/storageService'

const storage = getStorageProvider()
const url = await storage.upload(file, 'path/filename.jpg')
```

### Save to Database
```typescript
const imageAsset = await prisma.imageAsset.create({
  data: {
    projectId,
    provider: 'cloudflare-r2',
    meta: {
      url: 'https://pub-xxx.r2.dev/path/file.jpg',
      filename: 'original-name.jpg',
      size: 245678,
      mimeType: 'image/jpeg'
    }
  }
})
```

---

## 🐛 Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `AccessDenied` | Wrong API token | Check permissions in Cloudflare |
| `NoSuchBucket` | Wrong bucket name | Check `CLOUDFLARE_R2_BUCKET_NAME` |
| `Cannot read properties` | Missing env vars | Check `.env.local` and restart |
| Image not loading | Public access off | Enable Public Development URL |
| Upload fails | File too large | Check file size limit (10MB) |

---

## 📊 Cost Calculator

### Free Tier Usage:
```
Storage: 10 GB free
Upload: 1M requests/month free  
Download: 10M requests/month free
Egress: Unlimited free
```

### Example:
```
1,000 images × 500KB = 500MB storage
1,000 uploads/month = 1,000 Class A ops
100,000 downloads/month = 100,000 Class B ops

Cost = $0 (within free tier) 🎉
```

---

## 🔗 Important URLs

| Purpose | URL |
|--------|-----|
| **Test Page** | http://localhost:3000/test/storage |
| **Upload API** | POST /api/test/storage/upload |
| **List API** | GET /api/test/storage/list |
| **Delete API** | DELETE /api/test/storage/delete |
| **Cloudflare Dashboard** | https://dash.cloudflare.com/ |
| **R2 Documentation** | https://developers.cloudflare.com/r2/ |

---

## ⚡ Quick Setup Checklist

- [ ] Create Cloudflare R2 bucket
- [ ] Generate API token (Object Read & Write)
- [ ] Enable Public Development URL
- [ ] Copy Account ID and Public URL
- [ ] Add environment variables to `.env.local`
- [ ] Install dependencies: `npm install @aws-sdk/client-s3 nanoid`
- [ ] Restart dev server: `npm run dev`
- [ ] Test at: http://localhost:3000/test/storage

---

## 🎯 Next Steps

1. ✅ **Storage working** - Test upload/list/delete
2. 🔄 **Visual Edit Backend** - Add data attributes to templates
3. ⏳ **Visual Edit Frontend** - Create edit UI components
4. ⏳ **Integration** - Connect storage with visual edit
5. ⏳ **Production** - Deploy and monitor

---

**Last Updated:** 18 ตุลาคม 2025  
**Quick Reference v1.0** 🚀
