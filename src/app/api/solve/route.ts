import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key')

type ExamType = 'TYT' | 'AYT'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const subject = formData.get('subject') as string
    const examType = (formData.get('examType') as ExamType) || 'TYT'

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

    const isDemoMode = !hasValidAPIKey()
    
    if (isDemoMode) {
      const demoSolution = generateDemoSolution(subject, examType)
      return NextResponse.json({ 
        solution: demoSolution,
        examType,
        isDemoMode: true
      })
    }

    const imageBuffer = await image.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = image.type || 'image/jpeg'

    const solution = await solveWithGemini(base64Image, mimeType, subject, examType)

    return NextResponse.json({ 
      solution,
      examType,
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

async function solveWithGemini(base64Image: string, mimeType: string, subject: string, examType: ExamType): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const prompt = examType === 'TYT' ? generateTYTPrompt(subject) : generateAYTPrompt(subject)

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

function generateDemoSolution(subject: string, examType: ExamType): string {
  return `**${examType} ${subject.toUpperCase()} DEMO ÇÖZÜM**

📚 Google Gemini AI ile çözüm yapılacak.

**Soru Türü**: ${examType} ${subject} 
**Seviye**: ${examType === 'TYT' ? 'Temel Yeterlilik' : 'Alan Yeterlilik'}
**Model**: Google Gemini 1.5 Flash

**💡 Gerçek Çözüm İçin:**
- Google AI Studio'dan ücretsiz Gemini API key alın (aylık 15 istek ücretsiz)

**⚡ Model Özellikleri:**
${examType === 'TYT' 
  ? '- Hızlı ve pratik çözümler\n- Temel kavram odaklı\n- Görsel işleme uzmanı'
  : '- Detaylı ve kapsamlı analiz\n- İleri düzey yaklaşım\n- Çoklu çözüm stratejisi'}

**🎯 ${examType} İpuçları:**
${examType === 'TYT'
  ? '- Zaman yönetimi kritik\n- Temel kavramlara odaklan\n- Pratik çözümleri öğren'
  : '- Detaylı analiz yap\n- Konular arası bağlantı kur\n- Farklı çözüm yollarını dene'}`
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