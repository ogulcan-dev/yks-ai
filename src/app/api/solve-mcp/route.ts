import { NextRequest, NextResponse } from 'next/server'
import { MCPService } from '@/lib/ai/mcp-service'

// MCP servisini başlat - her request için yeni instance
// Böylece environment variable'lar düzgün yüklenir
function getMCPService() {
  return new MCPService()
}

export async function POST(request: NextRequest) {
  
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const preferredModel = formData.get('model') as any || 'auto'
    const userMessage = formData.get('message') as string | null
    const contextData = formData.get('context') as string | null
    const requireMultipleModels = formData.get('multiModel') === 'true'
    const requireDifficulty = formData.get('difficulty') === 'true'
    const requireSimilar = formData.get('similar') === 'true'
    const requireTopicReview = formData.get('topicReview') === 'true'

    if (!image) {
      return NextResponse.json(
        { error: 'Lütfen soru görselini yükleyin.' },
        { status: 400 }
      )
    }

    // Context'i parse et
    let chatContext: any[] = []
    if (contextData) {
      try {
        chatContext = JSON.parse(contextData)
      } catch (e) {
        console.warn('Context parse edilemedi:', e)
      }
    }

    // Chat modu mu yoksa ilk çözüm mü?
    const isChatMode = !!userMessage && chatContext.length > 0

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      
      const demoSolution = generateDemoSolution(preferredModel, isChatMode, userMessage, {
        requireDifficulty,
        requireSimilar,
        requireTopicReview
      })
      return NextResponse.json({
        solution: demoSolution,
        response: demoSolution,
        model: preferredModel || 'gemini',
        confidence: 0.85,
        processingTime: 1500,
        isDemoMode: true,
        isChatMode,
        difficulty: 'Orta',
        similarQuestions: [
          {
            question: 'Demo benzer soru 1',
            topic: 'Otomatik algılanacak',
            difficulty: 'Kolay'
          }
        ],
        topicReview: {
          mainTopic: 'Otomatik algılanacak',
          subtopics: ['Alt Konu 1', 'Alt Konu 2'],
          recommendedResources: ['Kaynak 1', 'Kaynak 2'],
          practiceAdvice: 'Demo çalışma önerisi'
        }
      })
    }

    const imageBuffer = await image.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = image.type || 'image/jpeg'


    // MCP servisi oluştur
    const mcpService = getMCPService()

    // MCP ile çözüm al
    const responses = await mcpService.solve({
      image: base64Image,
      mimeType,
      userMessage,
      chatContext,
      isChatMode,
      preferredModel: preferredModel === 'auto' ? undefined : preferredModel,
      requireMultipleModels,
      requireDifficulty,
      requireSimilar,
      requireTopicReview
    })


    if (requireMultipleModels && responses.length > 1) {
      return NextResponse.json({
        solutions: responses,
        multiModel: true,
        isChatMode
      })
    } else {
      const bestResponse = responses[0]
      
      if (!bestResponse || bestResponse.error) {
        console.error('MCP API: Çözüm hatası:', bestResponse?.error)
        throw new Error(bestResponse?.error || 'Çözüm oluşturulamadı')
      }

      return NextResponse.json({
        solution: bestResponse.solution,
        response: bestResponse.solution,
        model: bestResponse.model,
        confidence: bestResponse.confidence,
        processingTime: bestResponse.processingTime,
        isChatMode,
        error: bestResponse.error,
        difficulty: bestResponse.difficulty,
        similarQuestions: bestResponse.similarQuestions,
        topicReview: bestResponse.topicReview
      })
    }

  } catch (error) {
    console.error('MCP API Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

function generateDemoSolution(
  model: string,
  isChatMode: boolean,
  userMessage: string | null,
  options: {
    requireDifficulty?: boolean,
    requireSimilar?: boolean,
    requireTopicReview?: boolean
  }
): string {
  const modelName = model === 'gemini' ? 'Google Gemini' 
    : model === 'claude' ? 'Claude 3'
    : model === 'gpt' ? 'GPT-4 Vision'
    : model === 'ollama' ? 'Ollama'
    : model === 'mistral' ? 'Mistral'
    : model === 'cohere' ? 'Cohere'
    : 'Otomatik Seçim'

  let solution = ''
  
  if (isChatMode && userMessage) {
    solution = `**💬 DEMO CHAT MODU**

📝 **Kullanıcı Sorusu:** ${userMessage}

🤖 **AI Yanıtı (${modelName}):**
Bu demo modda çalışıyor. Gerçek chat deneyimi için API anahtarı gerekli.

Sorunuzla ilgili demo yanıt: "${userMessage}" sorusuna yönelik detaylı açıklama burada olacak.

**🔧 Kurulum:**
1. Google AI Studio'dan ücretsiz API key alın
2. .env.local dosyasına ekleyin: \`GEMINI_API_KEY=your_api_key_here\``
  } else {
    solution = `**🎯 DEMO MODU - OTOMATIK SORU ÇÖZÜMLERİ**

⚠️ **API Anahtarı Gerekli**
Gerçek çözümler için Google Gemini API anahtarı ekleyin.

📚 **Model: ${modelName}**
MCP teknolojisi ile çoklu model desteği

**🔧 Kurulum:**
1. Google AI Studio'dan ücretsiz API key alın
2. .env.local dosyasına ekleyin:
   GEMINI_API_KEY=your_api_key_here

**✨ MCP Özellikleri:**
- Otomatik ders/sınav türü algılama
- Çoklu model karşılaştırması
- Cache sistemi ile hızlı yanıt
- Fallback mekanizması
- Chat desteği`
  }

  if (options.requireDifficulty) {
    solution += `\n\n**📊 Zorluk Seviyesi: Orta**
- Çözüm için temel bilgi yeterli
- 2-3 adımda çözülebilir
- Ortalama çözüm süresi: 3-5 dakika
- Başarı oranı: %65`
  }

  if (options.requireSimilar && !isChatMode) {
    solution += `\n\n**🔄 Benzer Sorular:**
1. Soru: Demo benzer soru 1
   Konu: Otomatik algılanacak - Temel Kavramlar
   Zorluk: Kolay

2. Soru: Demo benzer soru 2
   Konu: Otomatik algılanacak - Orta Seviye
   Zorluk: Orta

3. Soru: Demo benzer soru 3
   Konu: Otomatik algılanacak - İleri Seviye
   Zorluk: Zor`
  }

  if (options.requireTopicReview && !isChatMode) {
    solution += `\n\n**📖 Konu Tekrarı:**
Ana Konu: Otomatik algılanacak

Alt Konular:
- Temel Tanımlar
- Formüller
- Uygulama Yöntemleri

Kaynaklar:
- MEB Ders Kitabı
- Online Video Dersler
- Soru Bankaları

Çalışma Önerileri:
1. Temel kavramları tekrar edin
2. Örnek soruları çözün
3. Konuyu pekiştirin`
  }

  return solution
}

export async function GET() {
  try {
    const mcpService = getMCPService()
    const modelStatus = mcpService.getModelStatus()
    
    return NextResponse.json({
      models: {
        gemini: {
          name: 'Google Gemini 1.5 Flash',
          description: 'Hızlı görsel analiz ve pratik çözümler',
          enabled: modelStatus.gemini,
          features: ['Görsel analiz', 'Hızlı çözüm', 'Ücretsiz kullanım'],
          icon: '🚀',
          capabilities: {
            difficultyEstimation: true,
            similarQuestions: true,
            topicReview: true
          }
        },
        claude: {
          name: 'Anthropic Claude 3',
          description: 'Detaylı mantıksal analiz ve açıklamalar',
          enabled: modelStatus.claude,
          features: ['Derin analiz', 'Adım adım çözüm', 'Yüksek doğruluk'],
          icon: '🧠',
          capabilities: {
            difficultyEstimation: true,
            similarQuestions: true,
            topicReview: true
          }
        },
        gpt: {
          name: 'OpenAI GPT-4 Vision',
          description: 'Yaratıcı çözümler ve alternatif yaklaşımlar',
          enabled: modelStatus.gpt,
          features: ['Çoklu çözüm', 'Yaratıcı yaklaşım', 'Görsel anlama'],
          icon: '🎨',
          capabilities: {
            difficultyEstimation: true,
            similarQuestions: true,
            topicReview: true
          }
        },
        mistral: {
          name: 'Mistral AI',
          description: 'Yüksek performanslı açık kaynak model',
          enabled: modelStatus.mistral,
          features: ['Hızlı işlem', 'Açık kaynak', 'Yerel çalışma'],
          icon: '🌪️',
          capabilities: {
            difficultyEstimation: true,
            similarQuestions: false,
            topicReview: true
          }
        },
        cohere: {
          name: 'Cohere AI',
          description: 'Özelleştirilmiş eğitim ve analiz',
          enabled: modelStatus.cohere,
          features: ['Özel eğitim', 'Analitik yaklaşım', 'Çoklu dil'],
          icon: '🎯',
          capabilities: {
            difficultyEstimation: true,
            similarQuestions: true,
            topicReview: false
          }
        },
        ollama: {
          name: 'Ollama (Yerel Model)',
          description: 'İnternet gerektirmeyen yerel çözüm',
          enabled: modelStatus.ollama,
          features: ['Gizlilik', 'Çevrimdışı', 'Hızlı yanıt'],
          icon: '🏠',
          capabilities: {
            difficultyEstimation: true,
            similarQuestions: false,
            topicReview: false
          }
        }
      },
      capabilities: {
        multiModel: true,
        autoSelect: true,
        fallback: true,
        caching: true,
        difficultyEstimation: true,
        similarQuestions: true,
        topicReview: true
      }
    })
  } catch (error) {
    console.error('Model status error:', error)
    return NextResponse.json({
      models: {},
      capabilities: {},
      error: 'Model durumu alınamadı'
    })
  }
} 