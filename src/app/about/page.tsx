'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Code, Target, Users, Zap, Home, Github, Heart, Menu, X } from 'lucide-react'
import { PageLoader } from '@/components/ui/loading-screen'

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

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
              <Link href="/help">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-all duration-300">
                  Yardım
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
                <Link href="/help" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Yardım
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
            🌟 Hakkımızda
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            YKS öğrencileri için AI destekli görsel soru çözüm platformu. 
            Teknoloji ile eğitimi birleştirerek öğrenmeyi kolaylaştırıyoruz.
          </p>
        </div>

        <section className="mb-16 animate-slide-up">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Misyonumuz</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-gray-600 leading-relaxed">
                Her öğrencinin AI&apos;ın gücünden faydalanarak daha etkili çalışabilmesi, 
                soru çözme sürecini hızlandırması ve YKS&apos;de başarılı olması için 
                <strong className="text-blue-600"> ücretsiz ve erişilebilir</strong> bir platform sunmak.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ⚡ Teknoloji Yığını
            </h2>
            <p className="text-lg text-gray-600">
              En modern teknolojilerle geliştirildi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {tech.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tech.name}</CardTitle>
                      <CardDescription>{tech.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🔥 Neler Yapabilir?
            </h2>
            <p className="text-lg text-gray-600">
              Platform özelliklerinin detaylı incelemesi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <capability.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">{capability.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                    {capability.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {capability.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        variant="secondary" 
                        className="text-xs hover:scale-105 transition-transform duration-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">📊 Proje İstatistikleri</h2>
                <p className="text-blue-100">Şu ana kadar elde ettiğimiz başarılar</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Geliştirme Süreci
            </h2>
            <p className="text-lg text-gray-600">
              Proje nasıl hayata geçti?
            </p>
          </div>

          <div className="space-y-6">
            {timeline.map((item, index) => (
              <Card 
                key={index} 
                className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <Badge variant="outline">{item.duration}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="mb-6">
                <Heart className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🤝 Katkıda Bulunun
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Bu proje açık kaynak kodludur. Geliştirmeye katkıda bulunmak, 
                hata bildirmek veya yeni özellik önermek isterseniz bize ulaşın!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300" onClick={() => window.open('https://github.com/ogulcan-dev/yks-ai', '_blank')}>
                  <Github className="mr-2 h-5 w-5" />
                  GitHub&apos;da Görüntüle
                </Button>
                <Link href="/help">
                  <Button variant="outline" size="lg" className="px-8 hover:scale-105 transition-all duration-300">
                    💬 Destek Al
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

const technologies = [
  {
    name: "Next.js 15",
    category: "Frontend Framework",
    icon: "⚛️",
    description: "React tabanlı modern web framework'ü, server-side rendering ve optimizasyon özelliklerile."
  },
  {
    name: "Google Gemini",
    category: "AI & Vision",
    icon: "🤖",
    description: "Google'ın güçlü AI modeli, görsel analiz ve doğal dil işleme yetenekleri."
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    icon: "🎨",
    description: "Utility-first CSS framework, hızlı ve tutarlı UI geliştirme için."
  },
  {
    name: "Shadcn/UI",
    category: "UI Components",
    icon: "🧩",
    description: "Modern, erişilebilir ve özelleştirilebilir React komponent kütüphanesi."
  },
  {
    name: "TypeScript",
    category: "Programming Language",
    icon: "📝",
    description: "Type-safe JavaScript, daha güvenli ve sürdürülebilir kod için."
  },
  {
    name: "React Dropzone",
    category: "File Upload",
    icon: "📁",
    description: "Drag & drop dosya yükleme için kullanıcı dostu React komponenti."
  }
]

const capabilities = [
  {
    icon: Camera,
    title: "Gelişmiş Görsel Analizi",
    description: "Google Gemini AI'ın güçlü görsel işleme yetenekleri ile matematik formüllerinden tarih haritalarına kadar her türlü soru görselini okur ve analiz eder.",
    tags: ["OCR", "AI Vision", "Çoklu Format"]
  },
  {
    icon: Code,
    title: "MEB Müfredatı Uyumluluğu",
    description: "Her ders için özel geliştirilmiş prompt'lar ve çözüm şablonları ile tamamen Milli Eğitim Bakanlığı müfredatına uygun çözümler üretir.",
    tags: ["YKS Format", "Ders Bazlı", "Müfredat Uygun"]
  },
  {
    icon: Zap,
    title: "Hızlı & Güvenilir",
    description: "30 saniye içinde detaylı çözüm alın. Verileriniz güvende, görselleriniz sadece analiz için kullanılır ve saklanmaz.",
    tags: ["Hızlı Yanıt", "Güvenli", "Gizlilik"]
  },
  {
    icon: Users,
    title: "Kapsamlı Ders Desteği",
    description: "9 farklı YKS dersinde (Matematik, Fizik, Kimya, Biyoloji, Türkçe, Tarih, Coğrafya, Felsefe, İngilizce) uzman seviyesinde çözüm desteği.",
    tags: ["9 Ders", "Uzman Seviye", "Tam Destek"]
  }
]

const stats = [
  { value: "9", label: "Desteklenen Ders" },
  { value: "100%", label: "Ücretsiz" },
  { value: "30sn", label: "Ortalama Yanıt" },
  { value: "1", label: "Aylık Ücretsiz Kullanım" }
]

const timeline = [
  {
    title: "Proje Planlaması",
    description: "YKS öğrencilerinin ihtiyaçları analiz edildi, AI entegrasyonu araştırıldı.",
    duration: "Gün 1"
  },
  {
    title: "UI/UX Tasarımı",
    description: "Modern ve kullanıcı dostu arayüz tasarlandı, Shadcn/UI komponentleri entegre edildi.",
    duration: "Gün 1"
  },
  {
    title: "AI Entegrasyonu",
    description: "Google Gemini API entegre edildi, görsel işleme ve soru çözme altyapısı kuruldu.",
    duration: "Gün 1"
  },
  {
    title: "Ders Optimizasyonu",
    description: "9 farklı ders için özel prompt'lar ve çözüm şablonları geliştirildi.",
    duration: "Gün 1"
  }
] 