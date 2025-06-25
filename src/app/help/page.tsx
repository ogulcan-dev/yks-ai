'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, HelpCircle, BookOpen, Lightbulb, AlertCircle, CheckCircle, Home, MessageCircle, Menu, X, Search } from 'lucide-react'
import { PageLoader } from '@/components/ui/loading-screen'

export default function HelpPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YKS Görsel AI</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link href="/solve">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-all duration-300">
                  Soru Çöz
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-all duration-300">
                  Hakkımızda
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-all duration-300">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/solve" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Soru Çöz
                </Link>
                <Link href="/about" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Hakkımızda
                </Link>
                <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Ana Sayfa
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🆘 Yardım Merkezi
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            YKS Görsel AI kullanımı hakkında sorularınızın cevapları burada. 
            Eğer aradığınızı bulamazsanız bizimle iletişime geçin!
          </p>

          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Yardım konularında ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        <section className="mb-16 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/solve">
              <Card className="border-2 hover:border-blue-300 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Hemen Başla</h3>
                  <p className="text-gray-600 text-sm">Soru görselini yükle ve çözümü al</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="#tutorial">
              <Card className="border-2 hover:border-blue-300 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Öğretici Rehber</h3>
                  <p className="text-gray-600 text-sm">Adım adım kullanım rehberi</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="#contact">
              <Card className="border-2 hover:border-blue-300 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-6 w-6 text-white" onClick={() => window.open('https://github.com/ogulcan-dev/yks-ai/issues', '_blank')}/>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">İletişim</h3>
                  <p className="text-gray-600 text-sm">Doğrudan bizimle konuş</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ❓ Sık Sorulan Sorular
            </h2>
            <p className="text-lg text-gray-600">
              En çok merak edilen konular
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  {faq.tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {faq.tags.map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="secondary" 
                          className="text-xs hover:scale-105 transition-transform duration-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="tutorial" className="mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">📚 Kullanım Rehberi</CardTitle>
              <CardDescription>
                Adım adım nasıl kullanacağını öğren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tutorialSteps.map((step, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    <div className="mt-3 text-2xl group-hover:animate-bounce">{step.emoji}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🔧 Sorun Giderme
            </h2>
            <p className="text-lg text-gray-600">
              Yaşayabileceğiniz sorunlar ve çözümleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {troubleshooting.map((issue, index) => (
              <Card 
                key={index} 
                className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                    {issue.problem}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600">{issue.description}</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800 mb-1">Çözüm:</p>
                          <p className="text-green-700 text-sm">{issue.solution}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Lightbulb className="h-6 w-6 text-amber-600 animate-pulse" />
                💡 İpuçları & Öneriler
              </CardTitle>
              <CardDescription>
                Platform kullanımını optimize etmek için öneriler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="text-lg">{tip.emoji}</div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="contact" className="text-center">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="mb-6">
                <MessageCircle className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                💬 Hâlâ Yardıma İhtiyacınız Var mı?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Sorunuz burada yanıtlanmadıysa, bizimle doğrudan iletişime geçebilirsiniz. 
                Teknik ekibimiz size yardımcı olmak için burada!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  💌 İletişime Geç
                </Button>
                <Link href="/solve">
                  <Button variant="outline" size="lg" className="px-8 hover:scale-105 transition-all duration-300">
                    🚀 Şimdi Dene
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-500">Destek Saatleri</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">&lt;1 saat</div>
                  <div className="text-sm text-gray-500">Ortalama Yanıt Süresi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">%98</div>
                  <div className="text-sm text-gray-500">Çözüm Oranı</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

const faqs = [
  {
    question: "Platform nasıl çalışıyor?",
    answer: "Sadece soru görselini yükleyin ve hangi dersten olduğunu seçin. Yapay Zeka görseli analiz eder, soruyu okur ve MEB müfredatına uygun detaylı çözüm sunar. Tüm işlem 30 saniye içinde tamamlanır.",
    tags: ["Genel", "Kullanım"]
  },
  {
    question: "Hangi görsel formatları destekleniyor?",
    answer: "PNG, JPG, JPEG formatlarında görsel yükleyebilirsiniz. Maksimum dosya boyutu 10MB'dır. Görselin net olması ve sorunun tam görünür olması önemlidir.",
    tags: ["Görsel", "Format"]
  },
  {
    question: "API key olmadan kullanabilir miyim?",
    answer: "Evet! Demo modunda API key olmadan platformu test edebilirsiniz. Gerçek AI çözümleri için Google AI Studio'dan ücretsiz Gemini API key alabilirsiniz (aylık 15 istek ücretsiz).",
    tags: ["API", "Demo"]
  },
  {
    question: "Hangi derslerde soru çözebilirim?",
    answer: "9 farklı YKS dersinde uzmanız: Matematik, Fizik, Kimya, Biyoloji, Türkçe, Tarih, Coğrafya, Felsefe ve İngilizce. Her ders için özel optimizasyon yapılmıştır.",
    tags: ["Dersler", "YKS"]
  },
  {
    question: "Çözümler ne kadar güvenilir?",
    answer: "Dört farklı Yapay Zeka modeli kullanılmaktadır. Çözümler MEB müfredatına uygun şekilde tasarlanmıştır. Ancak önemli sınavlar öncesi çözümleri kontrol etmenizi öneririz.",
    tags: ["Güvenilirlik", "AI"]
  },
  {
    question: "Verilerim güvende mi?",
    answer: "Evet! Yüklediğiniz görseller sadece analiz için kullanılır ve sistemde saklanmaz. Kişisel hiçbir veri toplamıyoruz. Tamamen güvenli ve gizli.",
    tags: ["Güvenlik", "Gizlilik"]
  }
]

const tutorialSteps = [
  {
    title: "Ders Seç",
    description: "Hangi dersten soru çözeceğinizi açılır menüden seçin",
    emoji: "📚"
  },
  {
    title: "Görsel Yükle", 
    description: "Soru görselini drag & drop ile yükleyin veya tıklayarak seçin",
    emoji: "📸"
  },
  {
    title: "Çözümü Al",
    description: "'Çöz' butonuna basın ve 30 saniye içinde detaylı çözümü görün",
    emoji: "🎯"
  }
]

const troubleshooting = [
  {
    problem: "Görsel yüklenmiyor",
    description: "Dosya yükleme sırasında hata alıyorsunuz",
    solution: "Dosya formatının PNG, JPG veya JPEG olduğundan ve 10MB'dan küçük olduğundan emin olun. Tarayıcınızı yenileyin ve tekrar deneyin."
  },
  {
    problem: "AI yanıt vermiyor",
    description: "Çöz butonuna bastıktan sonra hiçbir şey olmuyor",
    solution: "İnternet bağlantınızı kontrol edin. Demo modundaysanız çözüm görünecektir. API key kullanıyorsanız, key'in doğru olduğundan emin olun."
  },
  {
    problem: "Çözüm kalitesi düşük",
    description: "AI soruyu doğru anlamamış veya yanlış çözüm vermiş",
    solution: "Görsel kalitesini artırın, sorunun net görünür olduğundan emin olun. Doğru dersi seçtiğinizden ve sorunun tam frame'de olduğundan emin olun."
  },
  {
    problem: "Sayfa yavaş çalışıyor",
    description: "Platform yavaş yükleniyor veya donuyor",
    solution: "Tarayıcı cache'ini temizleyin, farklı bir tarayıcı deneyin. İnternet bağlantınızın stabil olduğundan emin olun."
  }
]

const tips = [
  {
    title: "Soru görselinin net ve okunabilir olmasına dikkat edin",
    description: "Sadece sorunun bulunduğu kısmı fotoğraflayın, fazla alan bırakmayın",
    emoji: "📸"
  },
  {
    title: "Işıklı bir ortamda fotoğraf çekin, gölge oluşmasın",
    description: "Dersi doğru seçmeyi unutmayın, bu çözüm kalitesini etkiler",
    emoji: "🌞"
  },
  {
    title: "API key kullanırken internet bağlantınızın stabil olduğundan emin olun",
    description: "Demo modunda gerçekçi çözüm şablonları gösterilir",
    emoji: "🌐"
  },
  {
    title: "Önemli sınavlar öncesi çözümleri bir öğretmeninizle kontrol ettirin",
    description: "Platform tamamen ücretsizdir, hiçbir ödeme talep edilmez",
    emoji: "👩‍🏫"
  }
] 