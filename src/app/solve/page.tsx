'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Brain, Home, Sparkles, Loader2, Zap, Shield, Palette, Server } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

type ExamType = 'TYT' | 'AYT'
type AIModel = 'gemini' | 'claude' | 'gpt' | 'ollama' | 'auto'

const modelInfo: Record<AIModel, { name: string; icon: React.ReactNode; color: string }> = {
  gemini: { name: 'Google Gemini', icon: <Zap className="h-4 w-4" />, color: 'from-blue-500 to-cyan-500' },
  claude: { name: 'Claude 3', icon: <Brain className="h-4 w-4" />, color: 'from-purple-500 to-pink-500' },
  gpt: { name: 'GPT-4 Vision', icon: <Palette className="h-4 w-4" />, color: 'from-green-500 to-teal-500' },
  ollama: { name: 'Ollama (Yerel)', icon: <Server className="h-4 w-4" />, color: 'from-orange-500 to-red-500' },
  auto: { name: 'Otomatik Seçim', icon: <Shield className="h-4 w-4" />, color: 'from-indigo-500 to-purple-500' }
}

export default function SolvePage() {
  const [questionImage, setQuestionImage] = useState<File | null>(null)
  const [subject, setSubject] = useState('')
  const [examType, setExamType] = useState<ExamType>('TYT')
  const [selectedModel, setSelectedModel] = useState<AIModel>('auto')
  const [multiModel, setMultiModel] = useState(false)
  const [solution, setSolution] = useState('')
  const [solutions, setSolutions] = useState<Array<{ model: string; solution: string; confidence: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [availableModels, setAvailableModels] = useState<Record<string, boolean>>({})
  const [useMCP, setUseMCP] = useState(true)

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
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setQuestionImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const handleSolve = async () => {
    if (!questionImage) {
      setError('Lütfen bir soru görseli yükleyin.')
      return
    }

    if (!subject) {
      setError('Lütfen bir ders seçin.')
      return
    }

    setError('')
    setIsLoading(true)
    setSolution('')
    setSolutions([])

    const formData = new FormData()
    formData.append('image', questionImage)
    formData.append('subject', subject)
    formData.append('examType', examType)
    
    if (useMCP) {
      formData.append('model', selectedModel)
      formData.append('multiModel', multiModel.toString())
    }

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

      if (data.multiModel && data.solutions) {
        setSolutions(data.solutions)
      } else {
        setSolution(data.solution)
        
        if (data.isDemoMode) {
          setError('Demo modunda çalışıyor. Gerçek çözümler için API anahtarı ekleyin.')
        }
      }

    } catch (err) {
      console.error('Solve: Hata oluştu:', err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
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
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YKS Görsel AI</span>
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

      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center mb-12 pt-8">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              YKS Soru Çözücü
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
                {useMCP ? 'MCP AI Asistanı' : 'AI Asistanı'}
              </span>
            </h1>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            {useMCP 
              ? 'Çoklu AI modelleri ile güçlendirilmiş soru çözüm platformu. En iyi sonuç için birden fazla model kullanabilirsiniz!'
              : 'Soru görselini yükleyin, yapay zeka hemen çözsün! Google Gemini AI teknolojisi ile detaylı çözümler.'
            }
          </p>

          {useMCP && (
            <div className="flex justify-center gap-2 mb-6">
              {Object.entries(availableModels).map(([model, enabled]) => (
                <Badge 
                  key={model} 
                  variant={enabled ? "default" : "outline"}
                  className={enabled ? `bg-gradient-to-r ${modelInfo[model as AIModel]?.color}` : ''}
                >
                  {modelInfo[model as AIModel]?.icon}
                  <span className="ml-1">{modelInfo[model as AIModel]?.name}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YKS Soru Çözücü
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
              {useMCP ? 'MCP AI Asistanı' : 'AI Asistanı'}
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Soru görselini yükleyin, yapay zeka hemen çözsün! Google Gemini AI teknolojisi ile detaylı çözümler.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Soru Yükle</CardTitle>
              <CardDescription>
                Çözmek istediğiniz sorunun görselini yükleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Ders Seçin</h3>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ders seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matematik">Matematik</SelectItem>
                    <SelectItem value="fizik">Fizik</SelectItem>
                    <SelectItem value="kimya">Kimya</SelectItem>
                    <SelectItem value="biyoloji">Biyoloji</SelectItem>
                    <SelectItem value="turkce">Türkçe</SelectItem>
                    <SelectItem value="tarih">Tarih</SelectItem>
                    <SelectItem value="cografya">Coğrafya</SelectItem>
                    <SelectItem value="felsefe">Felsefe</SelectItem>
                    <SelectItem value="ingilizce">İngilizce</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              {useMCP && (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">AI Model Seçimi</h3>
                    <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as AIModel)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Model seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Otomatik Seçim (Önerilen)
                          </div>
                        </SelectItem>
                        <SelectItem value="gemini" disabled={!availableModels.gemini}>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Google Gemini {!availableModels.gemini && '(Kullanılamıyor)'}
                          </div>
                        </SelectItem>
                        <SelectItem value="claude" disabled={!availableModels.claude}>
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Claude 3 {!availableModels.claude && '(Kullanılamıyor)'}
                          </div>
                        </SelectItem>
                        <SelectItem value="gpt" disabled={!availableModels.gpt}>
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            GPT-4 Vision {!availableModels.gpt && '(Kullanılamıyor)'}
                          </div>
                        </SelectItem>
                        <SelectItem value="ollama" disabled={!availableModels.ollama}>
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            Ollama (Yerel) {!availableModels.ollama && '(Kullanılamıyor)'}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={multiModel}
                        onChange={(e) => setMultiModel(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={selectedModel !== 'auto'}
                      />
                      <span className="text-sm text-gray-700">
                        Çoklu Model Karşılaştırması {selectedModel !== 'auto' && '(Otomatik modda kullanılabilir)'}
                      </span>
                    </label>
                  </div>
                </>
              )}

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
              >
                <input {...getInputProps()} />
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setQuestionImage(null)
                          setPreviewUrl('')
                        }}
                      >
                        Değiştir
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Yeni görsel yüklemek için tıklayın veya sürükleyin
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isDragActive ? (
                        "Görseli buraya bırakın"
                      ) : (
                        "Soru görselini yüklemek için tıklayın veya sürükleyin"
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG veya JPEG • Max 10MB
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleSolve}
                disabled={isLoading || !questionImage || !subject}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Çözülüyor...
                  </>
                ) : (
                  <>
                    {useMCP && multiModel ? 'Tüm Modellerle Çöz' : 'Çöz'}
                  </>
                )}
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  {useMCP 
                    ? 'MCP teknolojisi ile çoklu AI model desteği'
                    : 'Google Gemini AI teknolojisi ile detaylı çözümler'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Çözüm</CardTitle>
              <CardDescription>
                AI tarafından üretilen detaylı çözüm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI Analiz Ediyor...
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {useMCP && multiModel 
                      ? 'Birden fazla AI modeli ile analiz ediliyor...'
                      : 'Görsel işleniyor ve çözüm hazırlanıyor'
                    }
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline">OCR</Badge>
                    <Badge variant="outline">Görsel Analiz</Badge>
                    <Badge variant="outline">Çözüm Üretme</Badge>
                    {useMCP && <Badge variant="outline">MCP Aktif</Badge>}
                  </div>
                </div>
              ) : solutions.length > 0 ? (
                <div className="space-y-4">
                  {solutions.map((sol, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {modelInfo[sol.model as AIModel]?.icon}
                            <CardTitle className="text-base">
                              {modelInfo[sol.model as AIModel]?.name}
                            </CardTitle>
                          </div>
                          <Badge variant="outline">
                            Güven: {Math.round(sol.confidence * 100)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div 
                          className="prose prose-sm prose-blue max-w-none"
                          dangerouslySetInnerHTML={{ __html: sol.solution.replace(/\n/g, '<br>') }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : solution ? (
                <div 
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: solution.replace(/\n/g, '<br>') }}
                />
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Soru Bekleniyor
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Soru görselini yükleyin ve "Çöz" butonuna basın
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline">OCR</Badge>
                    <Badge variant="outline">Görsel Analiz</Badge>
                    <Badge variant="outline">MEB Uyumlu</Badge>
                    {useMCP && <Badge variant="outline">MCP Destekli</Badge>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 