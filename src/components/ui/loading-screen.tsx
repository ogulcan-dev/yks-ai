import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Brain, BookOpen, Target } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  submessage?: string
  type?: 'default' | 'ai' | 'page' | 'search'
  progress?: number
  steps?: string[]
  currentStep?: number
}

export function LoadingScreen({ 
  message = "Yükleniyor...", 
  submessage = "Lütfen bekleyin",
  type = 'default',
  progress,
  steps,
  currentStep = 0
}: LoadingScreenProps) {
  
  const getLoadingIcon = () => {
    switch (type) {
      case 'page':
        return BookOpen
      default:
        return Sparkles
    }
  }

  const LoadingIcon = getLoadingIcon()

  const getGradientColors = () => {
    switch (type) {
      case 'page':
        return 'from-orange-500 to-red-600'
      default:
        return 'from-blue-500 to-purple-600'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-96 border-0 shadow-2xl bg-white/95 backdrop-blur-md">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className={`w-20 h-20 bg-gradient-to-r ${getGradientColors()} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                <LoadingIcon className="h-10 w-10 text-white animate-bounce" />
              </div>
              
              <div className="absolute inset-0">
                <div className="w-20 h-20 mx-auto border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-50"
                    style={{
                      left: `${20 + (i * 15)}%`,
                      top: `${30 + (i % 2 * 40)}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 animate-pulse">
              {message}
            </h3>
            <p className="text-gray-600 mb-6">
              {submessage}
            </p>
            
            {(progress !== undefined || steps) && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className={`bg-gradient-to-r ${getGradientColors()} h-2 rounded-full transition-all duration-500 ease-out`}
                    style={{ 
                      width: progress !== undefined 
                        ? `${progress}%` 
                        : steps 
                          ? `${((currentStep + 1) / steps.length) * 100}%`
                          : '50%'
                    }}
                  ></div>
                </div>
                
                {steps && steps[currentStep] && (
                  <p className="text-sm text-gray-500">
                    {steps[currentStep]}
                  </p>
                )}
              </div>
            )}
            
            {steps && (
              <div className="flex justify-center gap-2 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-blue-500 scale-110' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
            
            <div className="flex justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function PageLoader() {
  return (
    <LoadingScreen
      message="Sayfa Yükleniyor..."
      submessage="İçerik hazırlanıyor"
      type="page"
      progress={75}
    />
  )
}


