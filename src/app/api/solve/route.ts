import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key')

type ExamType = 'TYT' | 'AYT'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const userMessage = formData.get('message') as string | null
    const contextData = formData.get('context') as string | null

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

    const isDemoMode = !hasValidAPIKey()
    
    if (isDemoMode) {
      const demoSolution = generateDemoSolution(isChatMode, userMessage)
      return NextResponse.json({ 
        solution: demoSolution,
        response: demoSolution,
        isChatMode,
        isDemoMode: true
      })
    }

    const imageBuffer = await image.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = image.type || 'image/jpeg'

    const solution = await solveWithGemini(base64Image, mimeType, isChatMode, userMessage, chatContext)

    return NextResponse.json({ 
      solution,
      response: solution,
      isChatMode,
      isDemoMode: false
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}

function hasValidAPIKey(): boolean {
  return !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
}

async function solveWithGemini(
  base64Image: string, 
  mimeType: string, 
  isChatMode: boolean, 
  userMessage: string | null, 
  chatContext: any[]
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  
  let prompt: string
  if (isChatMode && userMessage) {
    prompt = generateChatPrompt(userMessage, chatContext)
  } else {
    prompt = generateAutoSolvePrompt()
  }

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    },
  ])

  const response = await result.response
  return response.text() || 'Çözüm oluşturulamadı.'
}

function generateTYTPrompt(subject: string): string {
  return `Sen uzman bir TYT ${subject} öğretmenisin. Görseldeki TYT ${subject} sorusunu çöz.

Çözümde şunlara dikkat et:
1. TYT seviyesine uygun temel kavramları kullan
2. Adım adım, anlaşılır şekilde açıkla
3. Gereksiz detaylara girme
4. Pratik çözüm yöntemlerini göster
5. Benzer soru tipleri için ipuçları ver

Çözümü şu formatta sun:
1. Soru Analizi
2. Temel Kavramlar
3. Çözüm Adımları
4. Sonuç
5. Benzer Sorular İçin İpuçları`
}

function generateAYTPrompt(subject: string): string {
  return `Sen uzman bir AYT ${subject} öğretmenisin. Görseldeki AYT ${subject} sorusunu çöz.

Çözümde şunlara dikkat et:
1. AYT seviyesine uygun ileri düzey analiz yap
2. Detaylı ve kapsamlı açıkla
3. Farklı çözüm yöntemlerini göster
4. Konunun diğer konularla ilişkisini kur
5. Üniversite sınavı odaklı ipuçları ver

Çözümü şu formatta sun:
1. Detaylı Soru Analizi
2. İleri Düzey Kavramlar
3. Çözüm Metodolojisi
4. Alternatif Çözüm Yolları
5. Sonuç ve Değerlendirme
6. AYT Stratejik İpuçları`
}

function generateChatPrompt(userMessage: string, chatContext: any[]): string {
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

function generateAutoSolvePrompt(): string {
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

function generateDemoSolution(isChatMode: boolean, userMessage: string | null): string {
  if (isChatMode && userMessage) {
    return `**💬 DEMO CHAT MODU**

📝 **Kullanıcı Sorusu:** ${userMessage}

🤖 **AI Yanıtı:**
Bu demo modda çalışıyor. Gerçek chat deneyimi için API anahtarı gerekli.

"${userMessage}" sorunuzla ilgili detaylı açıklama burada olacak.

**🔧 Kurulum:**
1. Google AI Studio'dan ücretsiz API key alın
2. .env.local dosyasına ekleyin: \`GEMINI_API_KEY=your_api_key_here\`

**Model:** Google Gemini 1.5 Flash`
  }

  return `**🎯 DEMO MODU - OTOMATIK SORU ÇÖZÜM**

📚 Google Gemini AI ile çözüm yapılacak.

**Model**: Google Gemini 1.5 Flash
**Özellik**: Otomatik ders/konu algılama

**💡 Gerçek Çözüm İçin:**
- Google AI Studio'dan ücretsiz Gemini API key alın

**⚡ Yeni Özellikler:**
- Ders ve sınav türü otomatik algılama
- Chat desteği (soru sorabilirsiniz)
- Görsel işleme uzmanı
- Adım adım çözüm

**🎯 Kullanım:**
1. Soru görseli yükleyin → Otomatik çözüm
2. Çözüm sonrası chat ile sorular sorun
3. "Anlamadım", "Tekrar çöz" gibi isteklerde bulunun`
}

export async function GET() {
  return NextResponse.json({
    model: {
      name: 'Google Gemini 1.5 Flash',
      description: 'TYT ve AYT soruları için optimize edilmiş Google AI modeli',
      features: [
        'Görsel analiz',
        'Hızlı çözüm',
        'Temel ve ileri kavram odaklı',
        'Çoklu dil desteği'
      ],
      pricing: 'Ücretsiz (15 istek/ay)'
    }
  })
} 