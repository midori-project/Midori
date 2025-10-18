// Storage Service - Abstraction layer for different storage providers

export interface StorageProvider {
  upload(file: File | Buffer, path: string, contentType?: string): Promise<string>
  delete(path: string): Promise<void>
  getPublicUrl(path: string): string
  list(prefix?: string): Promise<string[]>
}

// Cloudflare R2 Provider
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

export class CloudflareR2Provider implements StorageProvider {
  private s3Client: S3Client
  private bucketName: string
  private publicUrl: string
  private accountId: string

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'project-images'
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || `https://pub-${this.accountId}.r2.dev`
    
    const jurisdiction = process.env.CLOUDFLARE_R2_JURISDICTION || 'global'
    const endpoint = this.getEndpoint(this.accountId, jurisdiction)
    
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
      }
    })

    console.log('✅ CloudflareR2Provider initialized')
    console.log('   Bucket:', this.bucketName)
    console.log('   Endpoint:', endpoint)
  }

  private getEndpoint(accountId: string, jurisdiction: string): string {
    switch (jurisdiction) {
      case 'eu':
        return `https://${accountId}.eu.r2.cloudflarestorage.com`
      case 'fedramp':
        return `https://${accountId}.fedramp.r2.cloudflarestorage.com`
      case 'global':
      default:
        return `https://${accountId}.r2.cloudflarestorage.com`
    }
  }

  async upload(file: File | Buffer, path: string, contentType?: string): Promise<string> {
    try {
      let buffer: Buffer
      let mimeType: string

      if (file instanceof Buffer) {
        buffer = file
        mimeType = contentType || 'application/octet-stream'
      } else {
        buffer = Buffer.from(await file.arrayBuffer())
        mimeType = file.type || contentType || 'application/octet-stream'
      }

      console.log(`📤 Uploading to R2: ${path}`)
      console.log(`   Size: ${buffer.length} bytes`)
      console.log(`   Type: ${mimeType}`)

      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable'
      }))

      const publicUrl = this.getPublicUrl(path)
      console.log(`✅ Uploaded successfully: ${publicUrl}`)
      
      return publicUrl
    } catch (error: any) {
      console.error('❌ Upload failed:', error.message)
      throw new Error(`Upload failed: ${error.message}`)
    }
  }

  async delete(path: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting from R2: ${path}`)
      
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: path
      }))

      console.log(`✅ Deleted successfully`)
    } catch (error: any) {
      console.error('❌ Delete failed:', error.message)
      throw new Error(`Delete failed: ${error.message}`)
    }
  }

  getPublicUrl(path: string): string {
    return `${this.publicUrl}/${path}`
  }

  async list(prefix?: string): Promise<string[]> {
    try {
      console.log(`📋 Listing objects with prefix: ${prefix || '(all)'}`)
      
      const response = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: 100
      }))

      const keys = response.Contents?.map(obj => obj.Key || '') || []
      console.log(`✅ Found ${keys.length} objects`)
      
      return keys
    } catch (error: any) {
      console.error('❌ List failed:', error.message)
      throw new Error(`List failed: ${error.message}`)
    }
  }
}

// Factory function
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'cloudflare-r2'
  
  switch (provider) {
    case 'cloudflare-r2':
      return new CloudflareR2Provider()
    default:
      throw new Error(`Unknown storage provider: ${provider}`)
  }
}

