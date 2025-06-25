'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, BookOpen, Zap, Shield, Users, Star, ArrowRight, Sparkles, Menu, X } from 'lucide-react'
import { PageLoader } from '@/components/ui/loading-screen'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YKS Görsel AI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="#ozellikler" className="text-gray-600 hover:text-gray-900 transition-colors">
                Özellikler
              </Link>
              <Link href="#nasil-calisir" className="text-gray-600 hover:text-gray-900 transition-colors">
                Nasıl Çalışır?
              </Link>
              <Link href="#dersler" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dersler
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                Hakkımızda
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">
                Yardım
              </Link>
              <Link href="/solve">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Şimdi Dene
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
                <Link href="#ozellikler" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Özellikler
                </Link>
                <Link href="#nasil-calisir" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Nasıl Çalışır?
                </Link>
                <Link href="#dersler" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Dersler
                </Link>
                <Link href="/about" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Hakkımızda
                </Link>
                <Link href="/help" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                  Yardım
                </Link>
                <Link href="/solve" className="block px-3 py-2">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Şimdi Dene
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 animate-bounce">
              🆓 Tamamen Ücretsiz
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              YKS Sorularını
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block animate-pulse">
                📸 Görsel ile Çözün
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              Sadece soru görselini yükleyin, Yapay Zeka anında analiz edip MEB müfredatına uygun 
              detaylı çözüm sunsun. 9 farklı ders için özel optimizasyon!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link href="/solve">
                <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  🚀 Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#nasil-calisir">
                <Button variant="outline" size="lg" className="px-8 hover:scale-105 transition-all duration-300">
                  📖 Nasıl Çalışır?
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center shadow-lg">
            📐
          </div>
        </div>
        <div className="absolute top-32 right-10 animate-bounce delay-300">
          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center shadow-lg">
            🧮
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce delay-700">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center shadow-lg">
            🔬
          </div>
        </div>
        <div className="absolute top-40 right-1/4 animate-bounce delay-1000">
          <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center shadow-lg">
            📚
          </div>
        </div>
      </section>

      <section id="ozellikler" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ✨ Neden YKS Görsel AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En gelişmiş AI teknolojisi ile soru çözme deneyiminizi kolaylaştırıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🔥 3 Adımda Soru Çözümü
            </h2>
            <p className="text-xl text-gray-600">
              Bu kadar basit olamaz demeyin, gerçekten bu kadar kolay!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl font-bold text-white">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                <div className="mt-4 text-4xl group-hover:animate-bounce">{step.emoji}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dersler" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📚 Desteklenen Dersler
            </h2>
            <p className="text-xl text-gray-600">
              YKS&apos;deki tüm derslerde uzman çözümler
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {subjects.map((subject, index) => (
              <Card 
                key={index} 
                className="border-2 hover:border-blue-300 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-lg"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {subject.emoji}
                  </div>
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              📊 Güven İstatistikleri
            </h2>
            <p className="text-xl text-purple-100">
              Platform güvenilirlik verileri
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">30sn</div>
              <div className="text-purple-200">Ortalama Çözüm Süresi</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">9</div>
              <div className="text-purple-200">Desteklenen Ders</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">15</div>
              <div className="text-purple-200">Aylık Ücretsiz İstek</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-purple-200">Ücretsiz Platform</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            🎯 YKS Hazırlığında Fark Yaratın!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Sadece 30 saniyede soru çözümü alın. Binlerce öğrenci zaten kullanıyor!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/solve">
              <Button size="lg" variant="secondary" className="px-8 hover:scale-105 transition-all duration-300 shadow-lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Ücretsiz Başla
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-300">
                Daha Fazla Bilgi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">YKS Görsel AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI destekli YKS soru çözüm platformu. MEB müfredatına uygun, ücretsiz ve hızlı.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Sayfalar</h3>
              <div className="space-y-2">
                <Link href="/solve" className="block text-gray-400 hover:text-white transition-colors">
                  Soru Çöz
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
                <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                  Yardım
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Dersler</h3>
              <div className="space-y-2 text-gray-400">
                <div>🔢 Matematik</div>
                <div>⚛️ Fizik</div>
                <div>🧪 Kimya</div>
                <div>📖 Türkçe</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Teknoloji</h3>
              <div className="space-y-2 text-gray-400">
                <div>🤖 4 Farklı Yapay Zeka Modeli</div>
                <div>⚡ Next.js 15</div>
                <div>🎨 Tailwind CSS</div>
                <div>📱 Responsive Design</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p className="mb-2">© 2025 YKS Görsel AI - MEB müfredatına uygun eğitim desteği</p>
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Yapay Zeka ile güçlendirilmiştir</span>
              <Sparkles className="h-4 w-4" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Camera,
    title: "Görsel Okuma AI",
    description: "Yapay Zeka ile soru görsellerini mükemmel okur, her detayı analiz eder."
  },
  {
    icon: Zap,
    title: "Anında Çözüm",
    description: "30 saniyede detaylı, adım adım çözüm alın. Zamanınızı boşa harcamayın!"
  },
  {
    icon: BookOpen,
    title: "MEB Müfredatı",
    description: "Tamamen MEB müfredatına uygun, YKS formatında profesyonel çözümler."
  },
  {
    icon: Shield,
    title: "100% Güvenli",
    description: "Görselleriniz sadece analiz için kullanılır, saklanmaz. Gizliliğiniz korunur."
  },
  {
    icon: Users,
    title: "9 Ders Desteği",
    description: "Matematik'ten Türkçe'ye, Fizik'ten Tarih'e tüm YKS derslerinde uzman."
  },
  {
    icon: Star,
    title: "Tamamen Ücretsiz",
    description: "Hiçbir ücret ödemeden sınırsız soru çözebilirsiniz. Premium özellik yok!"
  }
]

const steps = [
  {
    title: "Ders Seç & Görsel Yükle",
    description: "Hangi dersten soru çözeceğinizi seçin ve soru görselini yükleyin.",
    emoji: "📸"
  },
  {
    title: "AI Analiz Ediyor",
    description: "Yapay Zeka görseli okur, soruyu analiz eder ve çözüm hazırlar.",
    emoji: "🤖"
  },
  {
    title: "Çözümü Al & Öğren",
    description: "Detaylı, adım adım çözümü görün ve konuyu tam olarak öğrenin.",
    emoji: "🎯"
  }
]

const subjects = [
  { name: "Matematik", emoji: "🔢" },
  { name: "Fizik", emoji: "⚛️" },
  { name: "Kimya", emoji: "🧪" },
  { name: "Biyoloji", emoji: "🧬" },
  { name: "Türkçe", emoji: "📖" },
  { name: "Tarih", emoji: "🏛️" },
  { name: "Coğrafya", emoji: "🌍" },
  { name: "Felsefe", emoji: "🤔" },
  { name: "İngilizce", emoji: "🇬🇧" }
] 