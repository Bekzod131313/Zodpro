# Zodpro — Isitish tizimini hisoblash kalkulyatori

Uy va xonalar o'lchamlarini kiritish orqali isitish tizimini avtomatik hisoblovchi
mobil-do'st veb-ilova / Telegram Mini App. Hech qanday qurish (build) jarayoni talab
qilinmaydi — fayllarni statik server orqali serving qilish kifoya.

## Nima hisoblanadi

Har bir xona uchun (o'lcham, tashqi devor, deraza/eshik maydoni, qavat joylashuvi,
devor yo'nalishi va tashqi/ichki haroratlar asosida) va butun uy bo'yicha:

- **Issiqlik yo'qotish** (Vt / kVt) — "yiriklashtirilgan" issiqlik balansi usuli bilan,
  devor/deraza/tom/pol materiallari, infiltratsiya va devor yo'nalishi tuzatishlari bilan
- **Radiatorlar soni** — tanlangan radiator turi va harorat rejimiga mos seksiyalar soni
- **Issiq pol quvur uzunligi** — tanlangan quvur qadami va kollektorgacha masofa asosida
- **Qozon quvvati (kVt)** va **qozon turi** tavsiyasi
- **Boyler (akkumulyatsion suv isitgich) hajmi** — oiladagi kishilar soniga qarab
- **Kengayish bagi (rasshirbak) hajmi** — tizimdagi taxminiy suv hajmi asosida
- **Gaz sarfi** — soatlik, oylik va mavsumiy taxmin

## Asosiy imkoniyatlar

- **Bir nechta loyiha** — turli uylar/variantlar uchun alohida loyihalar yaratish,
  nomini o'zgartirish va o'chirish (barchasi brauzerning `localStorage`'ida saqlanadi)
- **Hisobot chop etish / PDF** — "Natija" bo'limida hisobotni chop etish yoki
  "PDF saqlash" sifatida eksport qilish mumkin
- **Hududiy presetlar** — O'zbekiston viloyatlari bo'yicha tashqi hisoblash harorati
  avtomatik tanlanadi
- **Materiallar va uskunalar katalogi** — devor, deraza, tom, pol turlari hamda
  alyuminiy/bimetall/chuyan radiatorlar uchun taxminiy ko'rsatkichlar
- **Telegram Mini App** sifatida ishlash — Telegram ichida ochilganda mavzu (theme)
  ranglari, asosiy tugma (MainButton) va haptik signal avtomatik ulanadi

## Loyiha tuzilishi

```
index.html        — sahifa tuzilishi (sozlamalar / xonalar / natija tablari)
style.css         — uslublar (mobil-do'st, Telegram mavzu o'zgaruvchilari bilan)
js/data.js        — ma'lumotnoma: viloyatlar, materiallar, radiatorlar, standart qiymatlar
js/calc.js        — hisoblash mexanizmi
js/storage.js     — loyihalarni localStorage'da saqlash
js/telegram.js    — Telegram Mini App integratsiyasi
js/app.js         — UI mantiqi (tablar, formalar, loyihalar, hisobot)
```

## Ishlatish (veb sifatida)

1. Loyiha papkasida statik server ishga tushiring, masalan: `python3 -m http.server`.
2. `index.html` sahifasini brauzerda oching.
3. "Sozlamalar" bo'limida viloyat, qurilish materiallari va isitish tizimi
   parametrlarini tanlang.
4. "Xonalar" bo'limida har bir xona uchun o'lcham, tashqi devor uzunligi,
   deraza/eshik maydoni, qavat joylashuvi, devor yo'nalishi va isitish turini
   kiriting. Kerakli sondagi xonani "+ Xona qo'shish" tugmasi orqali qo'shing.
5. Pastdagi "Hisoblash" tugmasini bosing — natijalar "Natija" bo'limiga o'tadi.
6. "Natija" bo'limida "🖨️ Hisobotni chop etish / PDF" tugmasi orqali hisobotni
   chop etish yoki PDF sifatida saqlash mumkin.
7. Yuqoridagi loyiha panelidan yangi loyiha yaratish, nomini o'zgartirish yoki
   o'chirish mumkin — barcha ma'lumotlar avtomatik saqlanadi.

## Telegram Mini App sifatida sozlash

1. Ilovani GitHub Pages (yoki boshqa HTTPS hosting)'ga joylashtiring — masalan
   `https://bekzod131313.github.io/Zodpro/`.
2. Telegramda [@BotFather](https://t.me/BotFather) bilan suhbat oching.
3. Mavjud botingiz uchun `/newapp` (yoki `/mybots` → bot → Bot Settings → Menu Button /
   Mini App) buyrug'ini yuborib, yo'naltirish (Web App URL) sifatida 1-qadamdagi
   HTTPS manzilni kiriting.
4. Botni ochib, menyu tugmasi orqali Mini App'ni ishga tushiring — sahifa Telegram
   mavzusiga moslashadi, pastki "Hisoblash"/"Chop etish" tugmasi o'rniga Telegramning
   asosiy tugmasi (MainButton) ishlatiladi.

## Eslatma

Bu dastur taxminiy (loyihalashtirish bosqichidagi tezkor baholash uchun) hisob-kitob
beradi. Aniq loyiha uchun mutaxassis muhandis tomonidan to'liq issiqlik hisobi va
gidravlik hisoblar tavsiya etiladi.
