'use client'

import { useState } from 'react'

interface UploadedFile {
  filename: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

interface FileItem {
  path: string
  url: string
}

export default function StorageTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  
  const [filesList, setFilesList] = useState<FileItem[]>([])
  const [isListing, setIsListing] = useState(false)
  const [listError, setListError] = useState<string>('')
  const [listPrefix, setListPrefix] = useState('test/')
  
  const [deleteError, setDeleteError] = useState<string>('')
  const [deleteSuccess, setDeleteSuccess] = useState<string>('')

  // Upload File
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError('')
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first')
      return
    }

    setIsUploading(true)
    setUploadError('')
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/test/storage/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult(result.data)
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Auto refresh list
        setTimeout(() => handleList(), 1000)
      } else {
        setUploadError(result.error || 'Upload failed')
      }
    } catch (error: any) {
      setUploadError(error.message || 'Network error')
    } finally {
      setIsUploading(false)
    }
  }

  // List Files
  const handleList = async () => {
    setIsListing(true)
    setListError('')
    setFilesList([])

    try {
      const url = listPrefix 
        ? `/api/test/storage/list?prefix=${encodeURIComponent(listPrefix)}`
        : '/api/test/storage/list'
      
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setFilesList(result.data.files)
      } else {
        setListError(result.error || 'List failed')
      }
    } catch (error: any) {
      setListError(error.message || 'Network error')
    } finally {
      setIsListing(false)
    }
  }

  // Delete File
  const handleDelete = async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return

    setDeleteError('')
    setDeleteSuccess('')

    try {
      const response = await fetch('/api/test/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      })

      const result = await response.json()

      if (result.success) {
        setDeleteSuccess(`Deleted: ${path}`)
        // Remove from list
        setFilesList(prev => prev.filter(f => f.path !== path))
        
        // Clear success message after 3s
        setTimeout(() => setDeleteSuccess(''), 3000)
      } else {
        setDeleteError(result.error || 'Delete failed')
      }
    } catch (error: any) {
      setDeleteError(error.message || 'Network error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Cloudflare R2 Storage Test</h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📤 POST - Upload File</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image File
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`px-6 py-2 rounded font-medium ${
                !selectedFile || isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? '⏳ Uploading...' : '📤 Upload'}
            </button>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                ❌ {uploadError}
              </div>
            )}

            {uploadResult && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="font-semibold mb-2">✅ Upload Success!</p>
                <div className="text-sm space-y-1">
                  <p><strong>Filename:</strong> {uploadResult.filename}</p>
                  <p><strong>Size:</strong> {(uploadResult.size / 1024).toFixed(2)} KB</p>
                  <p><strong>URL:</strong> <a href={uploadResult.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{uploadResult.url}</a></p>
                  <div className="mt-2">
                    <img src={uploadResult.url} alt="Uploaded" className="max-w-xs rounded border" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📋 GET - List Files</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={listPrefix}
                onChange={(e) => setListPrefix(e.target.value)}
                placeholder="Prefix (e.g. test/)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleList}
                disabled={isListing}
                className={`px-6 py-2 rounded font-medium ${
                  isListing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isListing ? '⏳ Loading...' : '📋 List Files'}
              </button>
            </div>

            {listError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                ❌ {listError}
              </div>
            )}

            {filesList.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Found {filesList.length} file(s)
                </p>
                <div className="space-y-2">
                  {filesList.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.path}
                        </p>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {file.url}
                        </a>
                      </div>
                      <button
                        onClick={() => handleDelete(file.path)}
                        className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filesList.length === 0 && !isListing && !listError && (
              <p className="text-gray-500 text-center py-8">
                No files found. Click "List Files" to load.
              </p>
            )}
          </div>
        </div>

        {/* Delete Feedback */}
        {(deleteSuccess || deleteError) && (
          <div className="fixed bottom-4 right-4 max-w-md">
            {deleteSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded shadow-lg">
                ✅ {deleteSuccess}
              </div>
            )}
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded shadow-lg">
                ❌ {deleteError}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Setup Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create Cloudflare R2 bucket (e.g. "project-images")</li>
            <li>Generate R2 API token with Read & Write permissions</li>
            <li>Add to <code className="bg-blue-100 px-1 rounded">.env.local</code>:</li>
          </ol>
          <pre className="bg-blue-100 text-blue-900 p-3 rounded mt-2 text-xs overflow-x-auto">
{`STORAGE_PROVIDER=cloudflare-r2
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=project-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev`}
          </pre>
          <p className="text-sm text-blue-800 mt-2">
            <strong>Note:</strong> Install AWS SDK: <code className="bg-blue-100 px-1 rounded">npm install @aws-sdk/client-s3</code>
          </p>
        </div>
      </div>
    </div>
  )
}

