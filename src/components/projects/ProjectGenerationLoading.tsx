'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProjectGenerationLoadingProps {
  projectName?: string;
  currentStep?: string;
}

export const ProjectGenerationLoading: React.FC<ProjectGenerationLoadingProps> = ({
  projectName = "โปรเจคของคุณ",
  currentStep = "กำลังสร้างเว็บไซต์"
}) => {
  const steps = [
    { title: "วิเคราะห์ความต้องการ", icon: "🔍", completed: true },
    { title: "ออกแบบโครงสร้าง", icon: "🏗️", completed: true },
    { title: "สร้างโค้ดเว็บไซต์", icon: "💻", active: true },
    { title: "ปรับแต่งและทดสอบ", icon: "⚡", completed: false },
    { title: "เสร็จสิ้น", icon: "✅", completed: false }
  ];

  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear" as const
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const progressVariants = {
    animate: {
      width: ["0%", "60%", "80%"],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Loading Animation */}
        <motion.div 
          className="flex justify-center mb-8"
          variants={pulseVariants}
          animate="animate"
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 border-4 border-blue-200 rounded-full"
              variants={loadingVariants}
              animate="animate"
            >
              <div className="absolute inset-2 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </motion.div>

        {/* Project Info */}
        <div className="space-y-4">
          <motion.h1 
            className="text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            กำลังสร้าง {projectName}
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {currentStep}... กรุณารอสักครู่
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              variants={progressVariants}
              animate="animate"
            />
          </div>
          <p className="text-sm text-gray-500">AI กำลังทำงานเพื่อคุณ...</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">ขั้นตอนการสร้าง</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  step.active
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : step.completed
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="text-center space-y-2">
                  <motion.div 
                    className="text-2xl"
                    animate={step.active ? { scale: [1, 1.2, 1] } : {}}
                    transition={step.active ? { duration: 1.5, repeat: Infinity } : {}}
                  >
                    {step.icon}
                  </motion.div>
                  <p className={`text-sm font-medium ${
                    step.active ? 'text-blue-700' : step.completed ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h4 className="font-semibold text-gray-700 mb-2">💡 รู้ไหม?</h4>
          <p className="text-gray-600 text-sm">
            Midori AI ใช้เทคโนโลยี Large Language Model ขั้นสูง 
            เพื่อสร้างเว็บไซต์ที่ตรงตามความต้องการของคุณได้อย่างแม่นยำ
          </p>
        </motion.div>

        {/* Estimated Time */}
        <motion.div 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          ⏱️ เวลาโดยประมาณ: 30-60 วินาที
        </motion.div>

      </div>
    </div>
  );
};
