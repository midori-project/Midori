'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Eye, Play, Download, Trash2, Plus } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'draft' | 'published' | 'deprecated';
  placeholderConfig?: any;
  previewUrl?: string;
  createdAt: string;
}

interface JsonTemplate {
  template: {
    name: string;
    category: string;
    version: string;
    files: Array<{
      path: string;
      content: string;
    }>;
    placeholders: {
      theme: string;
      imagery: string;
      tone: string;
    };
  };
}

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Load templates from API
  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/template');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, []);

  // Validate JSON template
  const validateJsonTemplate = (json: string): { valid: boolean; error?: string; data?: JsonTemplate } => {
    try {
      const parsed = JSON.parse(json);
      
      // Check required fields
      if (!parsed.template) {
        return { valid: false, error: 'Missing template object' };
      }
      
      if (!parsed.template.name || !parsed.template.category || !parsed.template.version) {
        return { valid: false, error: 'Missing required template fields (name, category, version)' };
      }
      
      if (!parsed.template.files || !Array.isArray(parsed.template.files)) {
        return { valid: false, error: 'Missing or invalid files array' };
      }
      
      if (!parsed.template.placeholders) {
        return { valid: false, error: 'Missing placeholders object' };
      }
      
      // Check placeholder syntax in files
      const files = parsed.template.files;
      for (const file of files) {
        if (!file.path || !file.content) {
          return { valid: false, error: 'Invalid file structure (missing path or content)' };
        }
        
        // Check for placeholder syntax
        const content = file.content;
        const placeholderRegex = /<(tw|text|img|data)\/?>/g;
        const matches = content.match(placeholderRegex);
        
        if (matches) {
          console.log(`Found placeholders in ${file.path}:`, matches);
        }
      }
      
      return { valid: true, data: parsed };
    } catch (error) {
      return { valid: false, error: 'Invalid JSON format' };
    }
  };

  // Upload template
  const uploadTemplate = async () => {
    if (!jsonInput.trim()) {
      setUploadError('กรุณาใส่ JSON template');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const validation = validateJsonTemplate(jsonInput);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid template format');
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch('/api/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: validation.data!.template.name.toLowerCase().replace(/\s+/g, '-'),
          label: validation.data!.template.name,
          category: validation.data!.template.category,
          meta: {
            description: `Template with placeholder support: ${validation.data!.template.name}`,
            engine: 'placeholder',
            status: 'draft',
            author: 'User'
          },
          initialVersion: {
            version: 1,
            semver: validation.data!.template.version,
            files: validation.data!.template.files.reduce((acc, file) => {
              acc[file.path] = file.content;
              return acc;
            }, {} as Record<string, string>),
            slots: validation.data!.template.placeholders,
            status: 'draft'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload template');
      }

      const result = await response.json();
      console.log('Template uploaded successfully:', result);
      
      // Clear form and reload templates
      setJsonInput('');
      await loadTemplates();
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('เกิดข้อผิดพลาดในการอัพโหลด template');
    } finally {
      setIsUploading(false);
    }
  };

  // Preview template with AI
  const previewTemplate = async (template: Template) => {
    setIsPreviewing(true);
    try {
      // ใช้ QUESTION_API_KEY สำหรับ AI filling
      const response = await fetch('/api/questionAi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_QUESTION_API_KEY}`,
        },
        body: JSON.stringify({
          template: template,
          theme: 'modern cozy; primary:sky-600; accent:amber-400; radius:xl; elevation:lg; grid:3; header:underlined; font:inter; imagery:"coffee latte art"; tone:thai-casual',
          projectId: 'demo-project',
          action: 'fill_placeholders'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const result = await response.json();
      setPreviewData(result);
      
    } catch (error) {
      console.error('Preview error:', error);
      setUploadError('เกิดข้อผิดพลาดในการสร้าง preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  // Load templates on mount
  React.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Management</h1>
          <p className="text-muted-foreground">
            จัดการ templates และทดสอบ placeholder system
          </p>
        </div>
        <Button onClick={loadTemplates} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">อัพโหลด Template</TabsTrigger>
          <TabsTrigger value="gallery">Template Gallery</TabsTrigger>
          <TabsTrigger value="preview">Preview & Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>อัพโหลด Template JSON</CardTitle>
              <CardDescription>
                อัพโหลด template ในรูปแบบ JSON พร้อม placeholder support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">JSON Template</Label>
                <Textarea
                  id="json-input"
                  placeholder={`{
  "template": {
    "name": "Coffee Shop Template",
    "category": "Restaurant",
    "version": "1.0.0",
    "files": [
      {
        "path": "src/components/Hero.tsx",
        "content": "import React from 'react';\\nconst Hero = () => {\\n  return (\\n    <div className=\\"<tw/>\\">\\n      <h1><text/></h1>\\n      <p><text/></p>\\n      <img src=\\"<img/>\\" alt=\\"<text/>\\" />\\n    </div>\\n  );\\n};\\nexport default Hero;"
      }
    ],
    "placeholders": {
      "theme": "modern cozy; primary:sky-600; accent:amber-400",
      "imagery": "coffee latte art",
      "tone": "thai-casual"
    }
  }
}`}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              {uploadError && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={uploadTemplate} 
                disabled={isUploading || !jsonInput.trim()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'กำลังอัพโหลด...' : 'อัพโหลด Template'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.status === 'published' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.category} • v{template.version}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => previewTemplate(template)}
                      disabled={isPreviewing}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">ยังไม่มี templates</p>
                <p className="text-sm text-muted-foreground">อัพโหลด template แรกของคุณในแท็บ "อัพโหลด Template"</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Template Preview: {selectedTemplate.name}</CardTitle>
                <CardDescription>
                  ตัวอย่าง template หลัง AI เติม placeholder
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewData ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">AI Generated Content:</h3>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(previewData, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">ยังไม่มี preview data</p>
                    <Button 
                      onClick={() => previewTemplate(selectedTemplate)}
                      disabled={isPreviewing}
                      className="mt-4"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isPreviewing ? 'กำลังสร้าง preview...' : 'สร้าง Preview'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!selectedTemplate && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">เลือก template เพื่อดู preview</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
