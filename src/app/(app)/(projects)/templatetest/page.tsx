"use client";
import { useState } from "react";

export default function TemplateTest() { 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };
  return (
    <div className="">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-200/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ม</span>
              </div>
              <span className="text-green-700 font-bold text-xl">แมวซ่า คาเฟ่</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-6">
                <li><a className="text-green-700 hover:text-green-900" href="/">หน้าแรก</a></li>
                <li><a className="text-green-700 hover:text-green-900" href="/about">เกี่ยวกับเรา</a></li>
                <li><a className="text-green-700 hover:text-green-900" href="/contact">ติดต่อ</a></li>
              </ul>
              
              {/* CTA Button */}
              <button className="bg-gradient-to-r from-green-500 to-green-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                สั่งอาหาร
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-green-700 hover:bg-green-50 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="py-4 space-y-4 border-t border-green-200/50">
              <ul className="space-y-3">
                <li><a className="text-green-700 hover:text-green-900" href="/">หน้าแรก</a></li>
                <li><a className="text-green-700 hover:text-green-900" href="/about">เกี่ยวกับเรา</a></li>
                <li><a className="text-green-700 hover:text-green-900" href="/contact">ติดต่อ</a></li>
              </ul>
              
              {/* Mobile CTA Button */}
              <div className="pt-4">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                  สั่งอาหาร
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Line */}
        <div className="h-1 bg-gradient-to-r from-green-500 via-green-500 to-green-500"></div>
      </nav>
      <section className="relative py-20 bg-gradient-to-br from-green-50 via-green-100 to-green-200 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiN7cHJpbWFyeX0yMCIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative container mx-auto text-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-green-200 text-green-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            ร้านอาหารคุณภาพ
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-green-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
              อาหารไทยแท้ รสชาติอร่อย ราคาเป็นมิตร
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-green-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            เราใช้วัตถุดิบสดใหม่ คัดสรรอย่างพิถี ปรุงสดทุกวัน เพื่อความอร่อยที่คุณจะจดจำ
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <span className="relative z-10">ดูเมนู</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            
            <a className="inline-flex items-center px-8 py-4 border-2 border-green-300 text-green-700 font-semibold text-lg rounded-full hover:bg-green-50 hover:border-green-400 transition-all duration-300">
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              จองโต๊ะ
            </a>
          </div>
        </div>
      </section>
      <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-green-900 mb-6">เกี่ยวกับร้านแมวซ่า</h2>
          <p className="text-lg text-green-700 mb-8 leading-relaxed">เราเป็นร้านอาหารไทยแท้ที่ชูรสชาติแบบดั้งเดิม บรรยากาศร่มรื่นด้วยโทนสีเขียว และวัตถุดิบคุณภาพสูง</p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">อาหารสดใหม่</h3>
        <p className="text-green-700">ปรุงสดทุกวัน</p>
      </div>
            <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">ราคาเป็นมิตร</h3>
        <p className="text-green-700">ราคาเข้าถึงง่าย</p>
      </div>
            <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">บรรยากาศอบอุ่น</h3>
        <p className="text-green-700">บริการด้วยรอยยิ้ม</p>
      </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">15+</div>
        <div className="text-green-700">ปีประสบการณ์</div>
      </div>
            <div className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
        <div className="text-green-700">ลูกค้าพึงพอใจ</div>
      </div>
            <div className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
        <div className="text-green-700">เมนูหลากหลาย</div>
      </div>
            <div className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
        <div className="text-green-700">บริการส่ง</div>
      </div>
          </div>
        </div>
      </div>
    </section>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-green-900 mb-4">เกี่ยวกับร้านแมวซ่า</h2>
            <p className="text-lg text-green-700">พร้อมให้บริการทุกวัน</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-green-900">ข้อมูลติดต่อ</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">ที่อยู่</h4>
                    <p className="text-green-700">123 ถนนสุขุมวิท กรุงเทพฯ 10110</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">📞</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">โทรศัพท์</h4>
                    <p className="text-green-700">02-123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">✉️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">อีเมล</h4>
                    <p className="text-green-700">info@restaurant.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">🕒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">เวลาทำการ</h4>
                    <p className="text-green-700">จันทร์-อาทิตย์ 10:00-22:00</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-green-900">ส่งข้อความ</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">ชื่อ</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="ชื่อของคุณ"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">อีเมล</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="อีเมลของคุณ"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">ข้อความ</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4} 
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="ข้อความของคุณ"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  ส่งข้อความ
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>  
    <footer className="bg-green-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-green-100">แมวซ่า คาเฟ่</h3>
            <p className="text-green-200 mb-4">เราเป็นร้านอาหารไทยแท้ที่ชูรสชาติแบบดั้งเดิม บรรยากาศร่มรื่นด้วยโทนสีเขียว และวัตถุดิบคุณภาพสูง</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-green-300 hover:text-white transition-colors">
        <span className="sr-only">Facebook</span>
        <span className="text-2xl">📘</span>
      </a>
              <a href="https://instagram.com" className="text-green-300 hover:text-white transition-colors">
        <span className="sr-only">Instagram</span>
        <span className="text-2xl">📷</span>
      </a>
              <a href="https://line.me" className="text-green-300 hover:text-white transition-colors">
        <span className="sr-only">Line</span>
        <span className="text-2xl">💬</span>
      </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-green-100">ลิงก์ด่วน</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-green-300 hover:text-white transition-colors">หน้าแรก</a></li>
              <li><a href="/about" className="text-green-300 hover:text-white transition-colors">เกี่ยวกับเรา</a></li>
              <li><a href="/contact" className="text-green-300 hover:text-white transition-colors">ติดต่อ</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-green-100">ติดต่อเรา</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-400 mr-3 mt-1">📍</span>
                <span className="text-green-200">123 ถนนสุขุมวิท กรุงเทพฯ 10110</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-3">📞</span>
                <span className="text-green-200">02-123-4567</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-3">✉️</span>
                <span className="text-green-200">info@restaurant.com</span>
              </div>
            </div>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-green-100">รับข่าวสาร</h4>
            <p className="text-green-200 mb-4">สมัครรับข่าวสารและโปรโมชั่น</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="อีเมลของคุณ" 
                className="flex-1 px-3 py-2 bg-green-800 border border-green-700 rounded-l-lg text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r-lg transition-colors">
                สมัคร
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-green-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-300 text-sm">
              &copy; 2024 แมวซ่า คาเฟ่. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-green-300 hover:text-white text-sm transition-colors">นโยบายความเป็นส่วนตัว</a>
              <a href="/terms" className="text-green-300 hover:text-white text-sm transition-colors">ข้อกำหนดการใช้งาน</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}