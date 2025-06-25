# Güvenlik Politikası

## 🔒 Güvenlik Raporlama

Projede bir güvenlik açığı bulduysanız, lütfen aşağıdaki adımları izleyin:

1. **Acil Durum**: Eğer kritik bir güvenlik açığı bulduysanız, lütfen hemen [ogulcanozturk72@gmail.com](mailto:ogulcanozturk72@gmail.com) adresine mail atın.
2. **Normal Bildirim**: Düşük riskli güvenlik sorunları için [GitHub Issues](https://github.com/ogulcan-dev/yks-ai/issues) üzerinden "Security" etiketi ile bildirim yapın.

## 🛡️ Veri Güvenliği

### Kullanıcı Verileri
- Soru görselleri sadece analiz için kullanılır ve sunucularımızda saklanmaz
- Tüm işlemler tarayıcınızda (client-side) gerçekleşir
- Hiçbir kişisel veri toplanmaz veya saklanmaz
- Çözüm geçmişi sadece tarayıcı önbelleğinde tutulur

### API Güvenliği
- Tüm API istekleri HTTPS üzerinden yapılır
- Rate limiting uygulanır
- API anahtarları güvenli şekilde yönetilir
- Üçüncü parti API'ler (Gemini, Claude, GPT-4V) için güvenli proxy kullanılır

## 🔐 Desteklenen Sürümler

| Sürüm | Güvenlik Güncellemeleri |
| ----- | ----------------------- |
| 1.x   | ✅ Aktif               |
| < 1.0 | ❌ Desteklenmiyor      |

## 📝 Güvenlik Kontrolleri

### Düzenli Kontroller
- Bağımlılıklar için güvenlik taraması
- Kod analizi ve güvenlik testleri
- API endpoint güvenlik kontrolleri
- Rate limit monitörleme

### Kullanıcı Güvenliği
- Input validation
- XSS koruması
- CSRF koruması
- Güvenli dosya yükleme kontrolleri

## 🚫 Kısıtlamalar

- Maksimum dosya boyutu: 5MB
- İzin verilen dosya türleri: .jpg, .jpeg, .png
- API istek limiti: 60 istek/saat
- Maksimum çözüm süresi: 30 saniye

## 🔄 Güncelleme Politikası

- Kritik güvenlik güncellemeleri 24 saat içinde yayınlanır
- Normal güvenlik yamaları haftalık olarak yayınlanır
- Tüm güvenlik güncellemeleri CHANGELOG.md dosyasında belirtilir

## 📜 Lisans

Bu güvenlik politikası MIT Lisansı kapsamında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Güvenlikle ilgili sorularınız için:
- Email: [security@yks-ai.vercel.app](mailto:ogulcanozturk72@gmail.com)
- GitHub: [@ogulcan-dev](https://github.com/ogulcan-dev)

---

**Not**: Bu güvenlik politikası düzenli olarak güncellenir. Son güncelleme: Haziran 2025 