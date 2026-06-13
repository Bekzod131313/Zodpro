# Zodpro — Isitish tizimini hisoblash kalkulyatori

Uy va xonalar o'lchamlarini kiritish orqali isitish tizimini avtomatik hisoblovchi
veb-kalkulyator. Hech qanday qurish (build) jarayoni talab qilinmaydi — `index.html`
faylini brauzerda ochish kifoya.

## Nima hisoblanadi

Har bir xona uchun (o'lcham, tashqi devor, deraza/eshik maydoni, qavat joylashuvi va
tashqi/ichki haroratlar asosida) va butun uy bo'yicha:

- **Issiqlik yo'qotish** (Vt / kVt) — "yiriklashtirilgan" issiqlik balansi usuli bilan
- **Radiatorlar soni** — har bir xona uchun kerakli seksiyalar soni
- **Issiq pol quvur uzunligi** — tanlangan quvur qadamiga (sm) asosan
- **Qozon quvvati (kVt)** va **qozon turi** tavsiyasi
- **Boyler (akkumulyatsion suv isitgich) hajmi** — oiladagi kishilar soniga qarab
- **Kengayish bagi (rasshirbak) hajmi** — tizimdagi taxminiy suv hajmi asosida
- **Gaz sarfi** — soatlik, oylik va mavsumiy taxmin

## Ishlatish

1. `index.html` faylini brauzerda oching (yoki `python3 -m http.server` orqali serving qiling).
2. "Umumiy parametrlar" bo'limida devor/deraza/tom/pol turlari, tashqi harorat va
   isitish tizimi parametrlarini tanlang.
3. "Xonalar" bo'limida har bir xona uchun o'lcham, tashqi devor uzunligi, deraza/eshik
   maydoni, qavat joylashuvi va isitish turini kiriting. Kerakli sondagi xonani
   "+ Xona qo'shish" tugmasi orqali qo'shing.
4. "Hisoblash" tugmasini bosing — natijalar xonalar bo'yicha jadvalda va uy bo'yicha
   umumiy ko'rsatkichlar bo'limida chiqadi.

## Eslatma

Bu dastur taxminiy (loyihalashtirish bosqichidagi tezkor baholash uchun) hisob-kitob
beradi. Aniq loyiha uchun mutaxassis muhandis tomonidan to'liq issiqlik hisobi va
gidravlik hisoblar tavsiya etiladi.
