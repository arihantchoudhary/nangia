"use client"

import React from "react"

export function AnimatedBackground() {
  return (
    <>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20"></div>
        
        {/* Large Gradient Orbs */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 opacity-40 blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-400 to-blue-300 opacity-40 blur-[100px] animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-cyan-400 to-teal-300 opacity-30 blur-[120px] animate-pulse animation-delay-4000"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-400 to-green-300 opacity-35 blur-[80px] animate-float"></div>
        <div className="absolute bottom-1/3 left-1/4 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-sky-400 to-blue-300 opacity-35 blur-[90px] animate-float animation-delay-2000"></div>
        <div className="absolute top-3/4 right-1/4 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-violet-400 to-purple-300 opacity-30 blur-[70px] animate-float animation-delay-4000"></div>
        
        {/* Moving gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-200/20 to-transparent animate-slide"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-indigo-200/20 to-transparent animate-slide animation-delay-2000"></div>
        
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          50% {
            transform: translateY(-30px) translateX(20px) scale(1.1);
          }
        }

        @keyframes slide {
          0% {
            transform: translate(-100%, -100%);
          }
          100% {
            transform: translate(100%, 100%);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-slide {
          animation: slide 15s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}