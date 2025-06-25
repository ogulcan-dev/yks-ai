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
    const subject = formData.get('subject') as string
    const examType = formData.get('examType') as 'TYT' | 'AYT' || 'TYT'
    const preferredModel = formData.get('model') as any || 'auto'
    const requireMultipleModels = formData.get('multiModel') === 'true'



    if (!image) {
      return NextResponse.json(
        { error: 'Lütfen soru görselini yükleyin.' },
        { status: 400 }
      )
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'Lütfen ders seçin.' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      
      const demoSolution = generateDemoSolution(subject, examType, preferredModel)
      return NextResponse.json({
        solution: demoSolution,
        model: preferredModel || 'gemini',
        confidence: 0.85,
        processingTime: 1500,
        examType,
        isDemoMode: true
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
      subject,
      examType,
      preferredModel: preferredModel === 'auto' ? undefined : preferredModel,
      requireMultipleModels
    })


    if (requireMultipleModels && responses.length > 1) {
      return NextResponse.json({
        solutions: responses,
        examType,
        multiModel: true
      })
    } else {
      const bestResponse = responses[0]
      
      if (!bestResponse || bestResponse.error) {
        console.error('MCP API: Çözüm hatası:', bestResponse?.error)
        throw new Error(bestResponse?.error || 'Çözüm oluşturulamadı')
      }

      return NextResponse.json({
        solution: bestResponse.solution,
        model: bestResponse.model,
        confidence: bestResponse.confidence,
        processingTime: bestResponse.processingTime,
        examType,
        error: bestResponse.error
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

function generateDemoSolution(subject: string, examType: string, model: string): string {
  const modelName = model === 'gemini' ? 'Google Gemini' 
    : model === 'claude' ? 'Claude 3'
    : model === 'gpt' ? 'GPT-4 Vision'
    : model === 'ollama' ? 'Ollama'
    : 'Otomatik Seçim'

  return `**🎯 DEMO MODU - ${examType} ${subject.toUpperCase()} ÇÖZÜM**

⚠️ **API Anahtarı Gerekli**
Gerçek çözümler için Google Gemini API anahtarı ekleyin.

📚 **Model: ${modelName}**
MCP teknolojisi ile çoklu model desteği

**🔧 Kurulum:**
1. Google AI Studio'dan ücretsiz API key alın
2. .env.local dosyasına ekleyin:
   GEMINI_API_KEY=your_api_key_here

**✨ MCP Özellikleri:**
- Otomatik model seçimi
- Çoklu model karşılaştırması
- Cache sistemi ile hızlı yanıt
- Fallback mekanizması

**📊 Model Yetenekleri:**
${model === 'gemini' ? '- Hızlı görsel analiz\n- Pratik çözümler\n- Ücretsiz kullanım'
  : model === 'claude' ? '- Detaylı mantıksal analiz\n- Adım adım açıklamalar\n- Yüksek doğruluk'
  : model === 'gpt' ? '- Yaratıcı çözümler\n- Alternatif yaklaşımlar\n- Çoklu perspektif'
  : model === 'ollama' ? '- Yerel çalışma\n- Gizlilik odaklı\n- İnternet gerektirmez'
  : '- En uygun model otomatik seçilir\n- Yüksek başarı oranı\n- Akıllı yönlendirme'}

**💡 ${examType} İpuçları:**
${examType === 'TYT' 
  ? '- Temel kavramlara odaklanın\n- Zaman yönetimi kritik\n- Pratik çözüm yöntemleri öğrenin'
  : '- Detaylı analiz yapın\n- Konular arası bağlantı kurun\n- Farklı çözüm stratejileri deneyin'}`
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
          icon: '🚀'
        },
        claude: {
          name: 'Anthropic Claude 3',
          description: 'Detaylı mantıksal analiz ve açıklamalar',
          enabled: modelStatus.claude,
          features: ['Derin analiz', 'Adım adım çözüm', 'Yüksek doğruluk'],
          icon: '🧠'
        },
        gpt: {
          name: 'OpenAI GPT-4 Vision',
          description: 'Yaratıcı çözümler ve alternatif yaklaşımlar',
          enabled: modelStatus.gpt,
          features: ['Çoklu çözüm', 'Yaratıcı yaklaşım', 'Görsel anlama'],
          icon: '🎨'
        },
        ollama: {
          name: 'Ollama (Yerel Model)',
          description: 'İnternet gerektirmeyen yerel çözüm',
          enabled: modelStatus.ollama,
          features: ['Gizlilik', 'Çevrimdışı', 'Hızlı yanıt'],
          icon: '🏠'
        }
      },
      capabilities: {
        multiModel: true,
        autoSelect: true,
        fallback: true,
        caching: true
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