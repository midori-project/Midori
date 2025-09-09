'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProjectGenerationLoadingProps {
  projectName?: string;
  currentStep?: string;
}

export const ProjectGenerationLoading: React.FC<ProjectGenerationLoadingProps> = ({
  projectName = "Your Project",
  currentStep = "Generating Website"
}) => {
  const steps = [
    { title: "Analyzing Requirements", icon: "🔍", completed: true },
    { title: "Designing Structure", icon: "🏗️", completed: true },
    { title: "Generating Code", icon: "💻", active: true },
    { title: "Testing & Optimization", icon: "⚡", completed: false },
    { title: "Complete", icon: "✅", completed: false }
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
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Loading Animation */}
        <motion.div 
          className="flex justify-center mb-8"
          variants={pulseVariants}
          animate="animate"
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 border-4 border-green-200 rounded-full"
              variants={loadingVariants}
              animate="animate"
            >
              <div className="absolute inset-2 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/img/logo.png" alt="Midori" className="w-24 h-24" />
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
            Generating {projectName}
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {currentStep}... Please wait a moment
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
              variants={progressVariants}
              animate="animate"
            />
          </div>
          <p className="text-sm text-gray-500">AI is working for you...</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Generation Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  step.active
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : step.completed
                    ? 'border-emerald-500 bg-emerald-50'
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
                    step.active ? 'text-green-700' : step.completed ? 'text-emerald-700' : 'text-gray-500'
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
          <h4 className="font-semibold text-gray-700 mb-2">💡 Did you know?</h4>
          <p className="text-gray-600 text-sm">
            Midori AI uses advanced Large Language Model technology 
            to create websites that precisely match your requirements
          </p>
        </motion.div>

        {/* Estimated Time */}
        <motion.div 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          ⏱️ Estimated time: 30-60 seconds
        </motion.div>

      </div>
    </div>
  );
};
