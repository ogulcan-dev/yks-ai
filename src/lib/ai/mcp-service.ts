import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { MCPCache } from './mcp-cache'

export type AIModel = 'gemini' | 'claude' | 'gpt' | 'ollama' | 'auto'
export type ExamType = 'TYT' | 'AYT'

export interface ModelConfig {
  model: AIModel
  priority: number
  enabled: boolean
  apiKey?: string
  maxRetries: number
  timeout: number
}

export interface SolveRequest {
  image: string // base64
  mimeType: string
  subject: string
  examType: ExamType
  preferredModel?: AIModel
  requireMultipleModels?: boolean
}

export interface ModelResponse {
  model: AIModel
  solution: string
  confidence: number
  processingTime: number
  error?: string
}

export class MCPService {
  private models: Map<AIModel, ModelConfig>
  private anthropic?: Anthropic
  private openai?: OpenAI
  private gemini?: GoogleGenerativeAI
  private cache: MCPCache

  constructor() {
    this.models = new Map()
    this.cache = new MCPCache(500, 12) 
    this.initializeModels()
  }

  private initializeModels() {
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      this.models.set('gemini', {
        model: 'gemini',
        priority: 1,
        enabled: true,
        maxRetries: 3,
        timeout: 30000
      })
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
      this.models.set('claude', {
        model: 'claude',
        priority: 2,
        enabled: true,
        maxRetries: 3,
        timeout: 45000
      })
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      this.models.set('gpt', {
        model: 'gpt',
        priority: 3,
        enabled: true,
        maxRetries: 3,
        timeout: 40000
      })
    }

    if (process.env.OLLAMA_ENABLED === 'true') {
      this.models.set('ollama', {
        model: 'ollama',
        priority: 4,
        enabled: true,
        maxRetries: 2,
        timeout: 60000
      })
    }
  }

  async solve(request: SolveRequest): Promise<ModelResponse[]> {
    const { preferredModel, requireMultipleModels } = request

    const cacheKey = this.cache.generateKey(
      request.image.substring(0, 100), 
      request.subject, 
      request.examType
    )
    
    if (!requireMultipleModels && process.env.CACHE_ENABLED !== 'false') {
      const cachedSolution = this.cache.get(cacheKey)
      if (cachedSolution) {
        return [{
          model: preferredModel || 'gemini',
          solution: cachedSolution,
          confidence: 0.95,
          processingTime: 10,
          error: undefined
        }]
      }
    }

    let responses: ModelResponse[]

    if (preferredModel && !requireMultipleModels) {
      const response = await this.solveWithModel(preferredModel, request)
      responses = [response]
    }
    else if (requireMultipleModels) {
      responses = await this.solveWithMultipleModels(request)
    }
    else {
      responses = await this.solveWithAutoSelect(request)
    }

    if (responses.length > 0 && responses[0].solution && !responses[0].error) {
      this.cache.set(cacheKey, responses[0].solution, responses[0].model)
    }

    return responses
  }

  private async solveWithModel(model: AIModel, request: SolveRequest): Promise<ModelResponse> {
    const startTime = Date.now()

    try {
      let solution = ''

      switch (model) {
        case 'gemini':
          solution = await this.solveWithGemini(request)
          break
        case 'claude':
          solution = await this.solveWithClaude(request)
          break
        case 'gpt':
          solution = await this.solveWithGPT(request)
          break
        case 'ollama':
          solution = await this.solveWithOllama(request)
          break
        default:
          throw new Error(`Desteklenmeyen model: ${model}`)
      }

      return {
        model,
        solution,
        confidence: this.calculateConfidence(solution),
        processingTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        model,
        solution: '',
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }
    }
  }

  private async solveWithGemini(request: SolveRequest): Promise<string> {
    if (!this.gemini) throw new Error('Gemini API yapılandırılmamış')

    const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = this.generatePrompt(request.subject, request.examType, 'gemini')

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: request.image,
          mimeType: request.mimeType,
        },
      },
    ])

    return result.response.text() || 'Çözüm oluşturulamadı.'
  }

  private async solveWithClaude(request: SolveRequest): Promise<string> {
    if (!this.anthropic) throw new Error('Claude API yapılandırılmamış')

    const prompt = this.generatePrompt(request.subject, request.examType, 'claude')

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: request.mimeType as any,
              data: request.image
            }
          }
        ]
      }]
    })

    return response.content[0].type === 'text' ? response.content[0].text : 'Çözüm oluşturulamadı.'
  }

  private async solveWithGPT(request: SolveRequest): Promise<string> {
    if (!this.openai) throw new Error('OpenAI API yapılandırılmamış')

    const prompt = this.generatePrompt(request.subject, request.examType, 'gpt')

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${request.mimeType};base64,${request.image}`
            }
          }
        ]
      }],
      max_tokens: 4096
    })

    return response.choices[0]?.message?.content || 'Çözüm oluşturulamadı.'
  }

  private async solveWithOllama(request: SolveRequest): Promise<string> {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
    
    try {
      const modelsResponse = await fetch(`${ollamaHost}/api/tags`)
      if (!modelsResponse.ok) throw new Error('Ollama bağlantısı başarısız')
      
      const modelsData = await modelsResponse.json()
      const availableModels = modelsData.models?.map((m: any) => m.name) || []
      
      let modelName = 'phi4-mini:latest' // Varsayılan
      if (availableModels.includes('llava:latest')) {
        modelName = 'llava:latest'
      } else if (availableModels.includes('llava')) {
        modelName = 'llava'
      } else if (availableModels.length > 0) {
        modelName = availableModels[0]
      }


      const isVisionModel = modelName.includes('llava')
      
      const requestBody: any = {
        model: modelName,
        prompt: this.generatePrompt(request.subject, request.examType, 'ollama'),
        stream: false
      }

      if (isVisionModel) {
        requestBody.images = [request.image]
      } else {
        requestBody.prompt += '\n\nNot: Bu bir görsel soru çözümü isteğidir. Görsel içeriği analiz edemediğim için genel bir yaklaşım sunacağım.'
      }

      const response = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama API hatası: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.response || 'Çözüm oluşturulamadı.'
      
    } catch (error) {
      console.error('Ollama error:', error)
      throw new Error(`Ollama bağlantı hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    }
  }

  private async solveWithMultipleModels(request: SolveRequest): Promise<ModelResponse[]> {
    const enabledModels = Array.from(this.models.entries())
      .filter(([_, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority)

    const promises = enabledModels.map(([model]) => 
      this.solveWithModel(model, request)
    )

    const responses = await Promise.allSettled(promises)
    
    return responses
      .filter((r): r is PromiseFulfilledResult<ModelResponse> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(r => r.confidence > 0.3) // Düşük güvenli çözümleri filtrele
  }

  private async solveWithAutoSelect(request: SolveRequest): Promise<ModelResponse[]> {
    const enabledModels = Array.from(this.models.entries())
      .filter(([_, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority)

    for (const [model] of enabledModels) {
      const response = await this.solveWithModel(model, request)
      if (response.confidence > 0.7 && !response.error) {
        return [response]
      }
    }

    const allResponses = await this.solveWithMultipleModels(request)
    return allResponses.slice(0, 1)
  }

  private generatePrompt(subject: string, examType: ExamType, model: AIModel): string {
    const basePrompt = examType === 'TYT' 
      ? this.generateTYTPrompt(subject) 
      : this.generateAYTPrompt(subject)

    const modelOptimizations: Record<AIModel, string> = {
      gemini: '\n\nGörsel analiz ve hızlı çözüm odaklı yaklaş.',
      claude: '\n\nDetaylı mantıksal açıklamalar ve adım adım analiz yap.',
      gpt: '\n\nYaratıcı çözüm yöntemleri ve alternatif yaklaşımlar sun.',
      ollama: '\n\nTemel kavramlara odaklan ve basit açıklamalar kullan.',
      auto: ''
    }

    return basePrompt + modelOptimizations[model]
  }

  private generateTYTPrompt(subject: string): string {
    return `Sen uzman bir TYT ${subject} öğretmenisin. Görseldeki TYT ${subject} sorusunu çöz.

Çözümde şunlara dikkat et:
1. TYT seviyesine uygun temel kavramları kullan
2. Adım adım, anlaşılır şekilde açıkla
3. Gereksiz detaylara girme
4. Pratik çözüm yöntemlerini göster
5. Benzer soru tipleri için ipuçları ver

Çözümü şu formatta sun:
📝 **Soru Analizi**
🔑 **Temel Kavramlar**
🔄 **Çözüm Adımları**
✅ **Sonuç**
💡 **İpuçları**

Türkçe olarak cevap ver ve açıklamalarını mümkün olduğunca detaylı yap.`
  }

  private generateAYTPrompt(subject: string): string {
    return `Sen uzman bir AYT ${subject} öğretmenisin. Görseldeki AYT ${subject} sorusunu çöz.

Çözümde şunlara dikkat et:
1. AYT seviyesine uygun ileri düzey analiz yap
2. Detaylı ve kapsamlı açıkla
3. Farklı çözüm yöntemlerini göster
4. Konunun diğer konularla ilişkisini kur
5. Üniversite sınavı odaklı stratejiler sun

Çözümü şu formatta sun:
📊 **Detaylı Soru Analizi**
🎯 **İleri Düzey Kavramlar**
🔬 **Çözüm Metodolojisi**
🔀 **Alternatif Çözüm Yolları**
📈 **Sonuç ve Değerlendirme**
⚡ **AYT Stratejileri**

Türkçe olarak cevap ver ve açıklamalarını mümkün olduğunca detaylı yap.`
  }

  private calculateConfidence(solution: string): number {
    if (!solution || solution.length < 100) return 0

    let score = 0.5 

    if (solution.includes('Adım') || solution.includes('adım')) score += 0.1
    if (solution.includes('Sonuç') || solution.includes('sonuç')) score += 0.1
    if (solution.includes('**') || solution.includes('##')) score += 0.1 
    if (solution.length > 500) score += 0.1
    if (solution.includes('Formül') || solution.includes('formül')) score += 0.1

    return Math.min(score, 1)
  }

  getModelStatus(): Record<AIModel, boolean> {
    const status: Record<AIModel, boolean> = {
      gemini: false,
      claude: false,
      gpt: false,
      ollama: false,
      auto: true
    }

    this.models.forEach((config, model) => {
      status[model] = config.enabled
    })

    return status
  }
}