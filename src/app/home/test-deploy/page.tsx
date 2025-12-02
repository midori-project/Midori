'use client';
import { useState } from 'react';

export default function TestDeployPage() {
  const [subdomain, setSubdomain] = useState('cafe-delight');
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string|undefined>();
  const [err, setErr] = useState<string|undefined>();
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null);

  const onDeploy = async () => {
    setLoading(true); 
    setErr(undefined); 
    setUrl(undefined);
    setDeploymentInfo(null);
    
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subdomain, 
          projectType: 'vite-react' 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErr(data.error || 'deploy failed');
        return;
      }
      
      setUrl(data.url);
      setDeploymentInfo(data);
      
    } catch (error: any) {
      setErr(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
        🚀 Test Deploy - Café Delight
      </h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 16 }}>
        Deploy โปรเจค Food Delivery & Table Reservation App ไปยัง subdomain ของคุณ
      </p>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: 24,
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: 12, color: '#495057' }}>📋 โปรเจคที่จะ Deploy:</h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#6c757d' }}>
          <li>🍽️ <strong>Menu Page</strong> - รายการอาหารพร้อม search</li>
          <li>📅 <strong>Reservation Page</strong> - ระบบจองโต๊ะ</li>
          <li>👨‍🍳 <strong>Chef Profile</strong> - ข้อมูลเชฟ</li>
          <li>🖼️ <strong>Dish Gallery</strong> - แกลเลอรี่อาหาร</li>
          <li>🎨 <strong>Tailwind CSS</strong> - Responsive design</li>
        </ul>
      </div>
      
      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Subdomain:
          </label>
          <input 
            placeholder="cafe-delight" 
            value={subdomain} 
            onChange={e=>setSubdomain(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ced4da',
              borderRadius: 8,
              fontSize: 16
            }}
          />
          <p style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>
            URL จะเป็น: <strong>https://{subdomain || 'your-subdomain'}.midori.lol</strong>
          </p>
        </div>
        
        <button 
          onClick={onDeploy} 
          disabled={loading || !subdomain}
          style={{
            padding: 16,
            background: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '⏳ Deploying Café Delight...' : '🚀 Deploy Café Delight'}
        </button>
      </div>
      
      {loading && (
        <div style={{ 
          background: '#e3f2fd', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #2196f3'
        }}>
          <p style={{ margin: 0, color: '#1976d2' }}>
            ⏳ กำลัง deploy โปรเจค... กรุณารอ 2-3 นาที
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#1976d2' }}>
            Vite จะ build โปรเจคและ deploy ไปยัง Vercel
          </p>
        </div>
      )}
      
      {url && deploymentInfo && (
        <div style={{ 
          background: '#d4edda', 
          padding: 20, 
          borderRadius: 12, 
          marginBottom: 16,
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#155724' }}>
            ✅ Café Delight deployed successfully!
          </h3>
          
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>
              🌐 <strong>Website URL:</strong>
            </p>
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer"
              style={{ 
                color: '#007bff', 
                textDecoration: 'none',
                fontSize: 18,
                fontWeight: 500
              }}
            >
              {url}
            </a>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: 16, 
            borderRadius: 8, 
            marginTop: 16 
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>
              📊 Project Details:
            </h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#6c757d' }}>
              <li><strong>Name:</strong> {deploymentInfo.projectName}</li>
              <li><strong>Framework:</strong> {deploymentInfo.framework}</li>
              <li><strong>Description:</strong> {deploymentInfo.description}</li>
              <li><strong>Features:</strong> {deploymentInfo.features?.join(', ')}</li>
            </ul>
          </div>
        </div>
      )}
      
      {err && (
        <div style={{ 
          background: '#f8d7da', 
          padding: 16, 
          borderRadius: 8, 
          border: '1px solid #f5c6cb'
        }}>
          <p style={{ margin: 0, color: '#721c24' }}>
            ❌ <strong>Deployment failed:</strong> {err}
          </p>
        </div>
      )}
    </div>
  );
}
