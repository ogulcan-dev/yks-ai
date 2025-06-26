import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { MCPCache } from './mcp-cache'
import { Mistral } from '@mistralai/mistralai'
import { CohereClient } from 'cohere-ai'

export type AIModel = 'gemini' | 'claude' | 'gpt' | 'ollama' | 'mistral' | 'cohere' | 'auto'
export type ExamType = 'TYT' | 'AYT'
export type DifficultyLevel = 'Kolay' | 'Orta' | 'Zor' | 'Çok Zor'

export interface ModelConfig {
  model: AIModel
  priority: number
  enabled: boolean
  apiKey?: string
  maxRetries: number
  timeout: number
  capabilities: {
    difficultyEstimation: boolean
    similarQuestions: boolean
    topicReview: boolean
  }
}

export interface SolveRequest {
  image: string
  mimeType: string
  preferredModel?: AIModel
  userMessage?: string | null
  chatContext?: any[]
  isChatMode?: boolean
  requireMultipleModels?: boolean
  requireDifficulty?: boolean
  requireSimilar?: boolean
  requireTopicReview?: boolean
}

export interface ModelResponse {
  model: AIModel
  solution: string
  confidence: number
  processingTime: number
  difficulty?: DifficultyLevel
  similarQuestions?: Array<{
    question: string
    topic: string
    difficulty: DifficultyLevel
  }>
  topicReview?: {
    mainTopic: string
    subtopics: string[]
    recommendedResources: string[]
    practiceAdvice: string
  }
  error?: string
}

export class MCPService {
  private models: Map<AIModel, ModelConfig>
  private anthropic?: Anthropic
  private openai?: OpenAI
  private gemini?: GoogleGenerativeAI
  private mistral?: Mistral
  private cohere?: CohereClient
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
        timeout: 30000,
        capabilities: {
          difficultyEstimation: true,
          similarQuestions: true,
          topicReview: true
        }
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
        timeout: 45000,
        capabilities: {
          difficultyEstimation: true,
          similarQuestions: true,
          topicReview: true
        }
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
        timeout: 40000,
        capabilities: {
          difficultyEstimation: true,
          similarQuestions: true,
          topicReview: true
        }
      })
    }

    if (process.env.MISTRAL_API_KEY) {
      this.mistral = new Mistral({
        apiKey: process.env.MISTRAL_API_KEY
      })
      this.models.set('mistral', {
        model: 'mistral',
        priority: 4,
        enabled: true,
        maxRetries: 3,
        timeout: 35000,
        capabilities: {
          difficultyEstimation: true,
          similarQuestions: false,
          topicReview: true
        }
      })
    }

    if (process.env.COHERE_API_KEY) {
      this.cohere = new CohereClient({ 
        token: process.env.COHERE_API_KEY 
      })
      this.models.set('cohere', {
        model: 'cohere',
        priority: 5,
        enabled: true,
        maxRetries: 3,
        timeout: 35000,
        capabilities: {
          difficultyEstimation: true,
          similarQuestions: true,
          topicReview: false
        }
      })
    }

    if (process.env.OLLAMA_ENABLED === 'true') {
      this.models.set('ollama', {
        model: 'ollama',
        priority: 6,
        enabled: true,
        maxRetries: 2,
        timeout: 60000,
        capabilities: {
          difficultyEstimation: true,
          similarQuestions: false,
          topicReview: false
        }
      })
    }
  }

  async solve(request: SolveRequest): Promise<ModelResponse[]> {
    const { preferredModel, requireMultipleModels } = request

    const cacheKey = this.cache.generateKey(
      request.image.substring(0, 100), 
      request.userMessage || 'auto-solve',
      request.isChatMode ? 'chat' : 'solve'
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
        case 'mistral':
          solution = await this.solveWithMistral(request)
          break
        case 'cohere':
          solution = await this.solveWithCohere(request)
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
    const prompt = this.generatePrompt('gemini', request)

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

    const prompt = this.generatePrompt('claude', request)

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

    const prompt = this.generatePrompt('gpt', request)

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
        prompt: this.generatePrompt('ollama', request),
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

  private async solveWithMistral(request: SolveRequest): Promise<string> {
    if (!this.mistral) throw new Error('Mistral API yapılandırılmamış')

    const response = await this.mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: this.generatePrompt('mistral', request)
        }
      ]
    })

    const content = response.choices[0].message.content
    return typeof content === 'string' ? content : 'Çözüm oluşturulamadı.'
  }

  private async solveWithCohere(request: SolveRequest): Promise<string> {
    if (!this.cohere) throw new Error('Cohere API yapılandırılmamış')

    const response = await this.cohere.generate({
      prompt: this.generatePrompt('cohere', request),
      model: 'command',
      maxTokens: 1000,
      temperature: 0.7
    })

    return response.generations[0].text || 'Çözüm oluşturulamadı.'
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

  private generatePrompt(model: AIModel, request: SolveRequest): string {
    let basePrompt = ''
    
    if (request.isChatMode && request.userMessage) {
      basePrompt = this.generateChatPrompt(request.userMessage, request.chatContext || [])
    } else {
      basePrompt = this.generateAutoSolvePrompt()
    }
    
    let additionalPrompts = ''
    
    if (request.requireDifficulty) {
      additionalPrompts += `\n\nSorunun zorluk seviyesini de analiz et ve şu kategorilerden birine yerleştir: Kolay, Orta, Zor, Çok Zor. Zorluk seviyesi belirlenirken şunları dikkate al:
      - Sorunun çözümü için gereken bilgi düzeyi
      - Çözüm adımlarının karmaşıklığı
      - Sorunun çözümü için gereken süre
      - Benzer sorulardaki başarı oranları`
    }
    
    if (request.requireSimilar) {
      additionalPrompts += `\n\nBu soruya benzer 3 soru örneği ver. Her soru için:
      - Soru metni
      - İlgili konu başlığı
      - Zorluk seviyesi
      bilgilerini belirt.`
    }
    
    if (request.requireTopicReview) {
      additionalPrompts += `\n\nBu soru için konu tekrarı önerileri:
      - Ana konu başlığı
      - Alt konu başlıkları
      - Önerilen kaynaklar
      - Çalışma önerileri
      şeklinde detaylı bilgi ver.`
    }
    
    return basePrompt + additionalPrompts
  }

  private generateChatPrompt(userMessage: string, chatContext: any[]): string {
    const contextSummary = chatContext.length > 0 
      ? `\n\nÖnceki konuşma özeti: ${chatContext.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 100)}`).join('\n')}`
      : ''

    return `Sen uzman bir YKS öğretmenisin. Öğrenci soruyla ilgili "${userMessage}" diye soruyor.

${contextSummary}

Görseldeki soruya odaklanarak öğrencinin isteğini yerine getir:
- Eğer açıklama istiyorsa, detaylı açıkla
- Eğer tekrar çözüm istiyorsa, farklı yöntemle çöz
- Eğer anlamadığı kısım varsa, o kısmı basitleştir
- Eğer benzer soru istiyorsa, benzer örnekler ver

Açık, anlaşılır ve öğretici bir dille yanıtla.`
  }

  private generateAutoSolvePrompt(): string {
    return `Sen uzman bir YKS öğretmenisin. Görseldeki soruyu analiz et ve çöz.

**Görevlerin:**
1. Önce sorunun hangi ders ve konu olduğunu belirle
2. Sınav türünü (TYT/AYT) ve zorluk seviyesini tahmin et
3. Soruyu adım adım çöz
4. Çözümü anlaşılır şekilde açıkla

**Çözüm formatı:**
1. **Ders ve Konu:** [Otomatik algıladığın ders ve konu]
2. **Sınav Türü:** [TYT/AYT]
3. **Zorluk:** [Kolay/Orta/Zor]
4. **Çözüm Adımları:** [Detaylı çözüm]
5. **Sonuç:** [Final cevap]
6. **İpuçları:** [Bu tür sorular için genel tavsiyeler]

Açık, anlaşılır ve öğretici bir dille açıkla.`
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
      mistral: false,
      cohere: false,
      auto: true
    }

    this.models.forEach((config, model) => {
      status[model] = config.enabled
    })

    return status
  }

  private async extractModelResponse(rawResponse: string): Promise<Partial<ModelResponse>> {
    const response: Partial<ModelResponse> = {}
    
    // Zorluk seviyesi analizi
    const difficultyMatch = rawResponse.match(/Zorluk seviyesi: (Kolay|Orta|Zor|Çok Zor)/)
    if (difficultyMatch) {
      response.difficulty = difficultyMatch[1] as DifficultyLevel
    }
    
    // Benzer sorular analizi
    const similarQuestionsSection = rawResponse.match(/Benzer Sorular:([\s\S]*?)(?=\n\n|$)/)
    if (similarQuestionsSection) {
      response.similarQuestions = this.parseSimilarQuestions(similarQuestionsSection[1])
    }
    
    // Konu tekrarı önerileri
    const topicReviewSection = rawResponse.match(/Konu Tekrarı:([\s\S]*?)(?=\n\n|$)/)
    if (topicReviewSection) {
      response.topicReview = this.parseTopicReview(topicReviewSection[1])
    }
    
    return response
  }

  private parseSimilarQuestions(section: string): Array<{question: string; topic: string; difficulty: DifficultyLevel}> {
    const questions = []
    const questionBlocks = section.split(/\d+\.\s/).filter(Boolean)
    
    for (const block of questionBlocks) {
      const question = block.match(/Soru: (.*?)(?=\nKonu:|$)/)?.[1]?.trim()
      const topic = block.match(/Konu: (.*?)(?=\nZorluk:|$)/)?.[1]?.trim()
      const difficulty = block.match(/Zorluk: (Kolay|Orta|Zor|Çok Zor)/)?.[1] as DifficultyLevel
      
      if (question && topic && difficulty) {
        questions.push({ question, topic, difficulty })
      }
    }
    
    return questions
  }

  private parseTopicReview(section: string): {
    mainTopic: string;
    subtopics: string[];
    recommendedResources: string[];
    practiceAdvice: string;
  } {
    const mainTopic = section.match(/Ana Konu: (.*?)(?=\n|$)/)?.[1]?.trim() || ''
    const subtopics = section.match(/Alt Konular:\n([\s\S]*?)(?=\nKaynaklar:|$)/)?.[1]
      ?.split('\n')
      .map(topic => topic.trim())
      .filter(Boolean) || []
    const resources = section.match(/Kaynaklar:\n([\s\S]*?)(?=\nÇalışma Önerileri:|$)/)?.[1]
      ?.split('\n')
      .map(resource => resource.trim())
      .filter(Boolean) || []
    const advice = section.match(/Çalışma Önerileri:\n([\s\S]*?)$/)?.[1]?.trim() || ''
    
    return {
      mainTopic,
      subtopics,
      recommendedResources: resources,
      practiceAdvice: advice
    }
  }
}