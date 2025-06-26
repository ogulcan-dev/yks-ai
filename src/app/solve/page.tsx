'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Camera, Upload, Brain, Home, Sparkles, Loader2, Zap, Shield, Palette, Server, Send, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { marked } from 'marked'

type ExamType = 'TYT' | 'AYT'
type AIModel = 'gemini' | 'claude' | 'gpt' | 'mistral' | 'cohere' | 'ollama' | 'auto'
type DifficultyLevel = 'kolay' | 'orta' | 'zor'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

const modelInfo: Record<AIModel, { name: string; icon: React.ReactNode; color: string }> = {
  gemini: { name: 'Google Gemini', icon: <Zap className="h-4 w-4" />, color: 'from-blue-500 to-cyan-500' },
  claude: { name: 'Claude 3', icon: <Brain className="h-4 w-4" />, color: 'from-purple-500 to-pink-500' },
  gpt: { name: 'GPT-4 Vision', icon: <Palette className="h-4 w-4" />, color: 'from-green-500 to-teal-500' },
  mistral: { name: 'Mistral AI', icon: <Sparkles className="h-4 w-4" />, color: 'from-yellow-500 to-amber-500' },
  cohere: { name: 'Cohere', icon: <Brain className="h-4 w-4" />, color: 'from-teal-500 to-emerald-500' },
  ollama: { name: 'Ollama (Yerel)', icon: <Server className="h-4 w-4" />, color: 'from-orange-500 to-red-500' },
  auto: { name: 'Otomatik Seçim', icon: <Shield className="h-4 w-4" />, color: 'from-indigo-500 to-purple-500' }
}

export default function SolvePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [questionImage, setQuestionImage] = useState<File | null>(null)
  const [hasQuestionImage, setHasQuestionImage] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>('auto')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [availableModels, setAvailableModels] = useState<Record<string, boolean>>({})
  const [useMCP, setUseMCP] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkModels = async () => {
      try {
        const response = await fetch('/api/solve-mcp')
        const data = await response.json()
        
        const modelStatus: Record<string, boolean> = {}
        Object.entries(data.models).forEach(([key, value]: [string, any]) => {
          modelStatus[key] = value.enabled
        })
        setAvailableModels(modelStatus)
      } catch (err) {
        console.error('Model kontrolü başarısız:', err)
      }
    }
    
    checkModels()

    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Merhaba! 👋 Ben YKS AI asistanınız. Size nasıl yardımcı olabilirim?\n\n**Soru görseli yükleyin ve otomatik çözüm alın! 🚀**\n\n- Görsel yüklediğinizde otomatik olarak soruyu analiz edip çözerim 📸\n- Çözümde anlamadığınız yerleri sorabilirsiniz ❓\n- "Baştan anlat", "Daha basit çöz" gibi isteklerde bulunabilirsiniz 💡\n- Farklı çözüm yolları isteyebilirsiniz 🔄\n- Hangi ders olursa olsun, sorudan otomatik algılarım 🎯'
    }])
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setQuestionImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError('')
      setHasQuestionImage(true)
      
      // Görsel yüklendiğinde mesaj ekle ve otomatik çözüm başlat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: 'Soru görseli yüklendi',
        imageUrl: URL.createObjectURL(file)
      }])
      
      // Otomatik çözüm başlat
      setTimeout(() => {
        handleAutoSolve(file)
      }, 500)
    }
  }, [selectedModel, useMCP])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const handleAutoSolve = async (imageFile: File) => {
    setError('')
    setIsLoading(true)
    setIsTyping(true)

    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('model', selectedModel)

    try {
      const endpoint = useMCP ? '/api/solve-mcp' : '/api/solve'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu')
      }

      // Yazma animasyonu için bekle
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Çözümü mesaj olarak ekle
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.solution || data.solutions[0].solution
      }])

    } catch (err) {
      console.error('Solve: Hata oluştu:', err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    // Kullanıcı mesajını ekle
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }])

    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      if (hasQuestionImage && questionImage) {
        const formData = new FormData()
        formData.append('image', questionImage)
        formData.append('model', selectedModel)
        formData.append('message', userMessage)
        formData.append('context', JSON.stringify(messages))

        const endpoint = useMCP ? '/api/solve-mcp' : '/api/solve'
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Bir hata oluştu')
        }

        // Yazma animasyonu için bekle
        await new Promise(resolve => setTimeout(resolve, 1200))

        // Yanıtı mesaj olarak ekle
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.solution || data.response || 'Size nasıl yardımcı olabilirim?'
        }])
      } else {
        // Henüz soru yüklenmemiş
        await new Promise(resolve => setTimeout(resolve, 800))
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Öncelikle bir soru görseli yüklemeniz gerekiyor. Görseli yükledikten sonra size yardımcı olmaktan memnuniyet duyarım! 📸'
        }])
      }
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err)
      setError(err instanceof Error ? err.message : 'Mesaj gönderilemedi')
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YKS AI Asistan</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button
                variant={useMCP ? "default" : "outline"}
                size="sm"
                onClick={() => setUseMCP(!useMCP)}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                {useMCP ? 'MCP Aktif' : 'MCP Kapalı'}
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-y-auto mb-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-4">
                    {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-white text-gray-900 shadow-lg rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-6 ${
                message.role === 'assistant'
                  ? 'bg-white text-gray-900 shadow-lg hover:shadow-xl transition-all border border-gray-100'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all'
              } transform hover:scale-[1.01]`}>
                {message.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={message.imageUrl}
                      alt="Yüklenen görsel"
                      className="max-h-64 rounded-lg"
                    />
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Model Seçimi */}
        {hasQuestionImage && (
          <Card className="mb-6 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all border border-gray-100/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">AI Modeli:</span>
                </div>
                <Select value={selectedModel} onValueChange={(value: string) => setSelectedModel(value as AIModel)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Model seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Otomatik Seçim
                      </div>
                    </SelectItem>
                    {Object.entries(availableModels).map(([model, enabled]) => (
                      enabled && (
                        <SelectItem key={model} value={model}>
                          <div className="flex items-center gap-2">
                            {modelInfo[model as AIModel]?.icon}
                            {modelInfo[model as AIModel]?.name}
                          </div>
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input Alanı */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg' 
                  : 'border-gray-300 hover:border-blue-400 hover:scale-[1.01] hover:bg-blue-50/30'
                } backdrop-blur-sm`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-2">
                <ImageIcon className={`h-5 w-5 ${isDragActive ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                <span className={`text-sm ${isDragActive ? 'text-blue-600' : 'text-gray-600'} transition-colors`}>
                  {previewUrl ? 'Görseli değiştir' : 'Soru görseli yükle'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 placeholder:text-gray-500"
              />
                              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all rounded-xl px-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
} 