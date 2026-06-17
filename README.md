# So'z O'rgatuvchi — Loyiha Hujjati

## 📁 Loyiha tuzilmasi

```
project/
├── index.html            ← Asosiy sahifa (HTML skelet)
├── README.md             ← Shu fayl
├── css/
│   └── styles.css        ← Barcha stillar
├── js/
│   ├── data.js           ← Ma'lumotlar (so'zlar, irregular verbs)
│   ├── core.js           ← Asosiy logika
│   ├── flashcard.js      ← Flashcard rejimi
│   ├── quiz.js           ← Yozma test rejimi
│   ├── mcq.js            ← Ko'p tanlovli test
│   ├── speed.js          ← Tezkor rejim
│   ├── stats.js          ← Statistika
│   ├── share.js          ← Ulashish va Import
│   ├── units.js          ← Birliklar boshqaruvi
│   ├── exercises.js      ← Grammar mashqlar
│   └── irregular.js      ← Noto'g'ri fe'llar o'yinlari
└── img/
    └── logo.png          ← Favicon / logo
```

---

## 📂 Fayllar tavsifi

### `index.html`
Sahifaning HTML skeleti. `<style>` yoki `<script>` teglar yo'q —
barcha stillar va skriptlar alohida fayllardan yuklanadi.  
HTML kommentarlar orqali har bir `<div class="screen">` qaysi
funksiyaga tegishli ekanligi belgilangan.

---

### `css/styles.css`
Barcha vizual stillar yagona faylda:

| Blok | Nima |
|------|------|
| Reset & body | `*`, `body`, dark/light tema |
| `.card`, `.screen` | Asosiy konteyner va ekranlar |
| Tugmalar | `.btn`, `.btn-sec`, `.btn-green`, `.btn-icon` va h.k. |
| Home ekran | `.streak-badge`, `.xp-bar-wrap`, `.mode-grid` |
| Unit kartalar | `.unit-list`, `.unit-card`, `.unit-actions` |
| Flashcard | `.fc-card`, `.fc-front`, `.fc-back`, `.flip` animatsiyasi |
| Quiz / MCQ / Speed | Tegishli bloklar |
| Statistika | `.stat-item`, `.err-list` |
| Exercises & Irregular | Mashq va fe'l bloklar |
| Animatsiyalar | `shake`, `bounce`, `flip` keyframe'lar |

---

### `js/data.js`
Faqat ma'lumotlar. Hech qanday DOM yoki logika yo'q.

```
WORD_TYPES       — { "apple": "n", "run": "v", ... }
TYPE_LABELS      — { "n": "noun", "v": "verb", ... }
DEFAULT_UNITS    — [ { id, name, words:[{en,uz}] }, ... ]
IRREGULAR_VERBS  — [ { base, past, pp, uz, emoji }, ... ]
```

**Yangi so'z qo'shish:** `DEFAULT_UNITS` massiviga yangi `{en, uz}` ob'ekt qo'shing.  
**Yangi fe'l qo'shish:** `IRREGULAR_VERBS` massiviga qo'shing.

---

### `js/core.js`
Dasturning "yuragi". `data.js` dan keyin yuklanishi **shart**.

Asosiy eksportlar (global o'zgaruvchilar/funksiyalar):
- `units`, `xp`, `streak`, `theme` — holat o'zgaruvchilari
- `ld(key, default)` / `sv(key, value)` — localStorage yordamchilari
- `showScreen(name)` — ekranlar orasida o'tish
- `speak(text, onEnd)` — Web Speech API
- `addXP(amount)` — XP qo'shish va animatsiya
- `shuffle(arr)` / `norm(str)` — umumiy yordamchilar

---

### `js/flashcard.js`
Flashcard rejimi (🃏 Yod olish).

Kirish nuqtasi: `startFlashcard()` — `launchMode()` tomonidan chaqiriladi.

Asosiy oqim:
```
startFlashcard() → renderFcCard() → [fcFlip() | fcRate()] → fcFinish()
```

---

### `js/quiz.js`
Yozma test rejimi (✍️ Test). Foydalanuvchi so'zni klaviaturadan yozadi.

Kirish nuqtasi: `startQuiz()`  
Klaviatura: `handleKey(e)` — `keydown` hodisasiga bog'langan.

---

### `js/mcq.js`
Ko'p tanlovli test (🎯 Variantli). 4 ta tugmadan birini bosish.

Kirish nuqtasi: `startMcq()`

---

### `js/speed.js`
Tezkor rejim (⚡). Har bir savol uchun 10 soniya taymer.

Kirish nuqtasi: `startSpeed()`  
Taymer: `setInterval` → `spTimeUp()` avtomatik o'tadi.

---

### `js/stats.js`
Statistika ekrani (📊).

- `renderStats()` — jami/to'g'ri/xato foizlar + eng ko'p xato so'zlar
- `resetStats()` — `confirm()` bilan barcha statistikani tozalash

---

### `js/share.js`
Ulashish va import (🔗).

- `copyUnit(id)` — birlikni `btoa(JSON.stringify(...))` bilan kodlaydi
- `doImport()` — `atob()` bilan dekod qilib yangi birlik sifatida qo'shadi

---

### `js/units.js`
Birliklar boshqaruvi (✏️ Tahrirlash).

- `renderUnitManage()` — mavjud birliklarni ko'rsatish
- `editUnit(id)` / `saveUnit()` — tahrirlash/saqlash
- `deleteUnit(id)` — o'chirish
- `parseWords(text)` — `"apple - olma\nbook - kitob"` formatini parse qilish
- `uid()` — `"u_" + Date.now() + random` formatida noyob ID

---

### `js/exercises.js`
Grammar mashqlar (📝). Har birlik uchun 30 ta savol.

Savol turlari:
| Tur | Tavsif |
|-----|--------|
| `mcq` | 4 variantli test |
| `gap` | Bo'sh joy to'ldirish (input) |
| `tf` | To'g'ri / Noto'g'ri |

Kirish nuqtasi: `showExScreen()` → `startExUnit(idx)`

---

### `js/irregular.js`
Noto'g'ri fe'llar (🔀). 4 ta o'yin rejimi:

| Rejim | Funksiya | Tavsif |
|-------|----------|--------|
| Flashcard | `startIrrCards()` | Kartalar ag'darish |
| Match | `startIrrMatch()` | Juftlik topish o'yini |
| Fill-in | `startIrrFill()` | past/pp yozish |
| Quiz | `startIrrQuiz()` | 4 variantli test |

---

## 🚀 Ishga tushirish

Oddiy HTTP server kerak (fayl:// protokoli `SpeechSynthesis` va
ba'zi brauzer APIlarini bloklashi mumkin):

```bash
# Python bilan:
python3 -m http.server 8080

# Node.js bilan:
npx serve .
```

Keyin brauzerda: `http://localhost:8080`

---

## 💾 Ma'lumotlar saqlash

Barcha foydalanuvchi ma'lumotlari `localStorage`da saqlanadi:

| Kalit | Tarkib |
|-------|--------|
| `vocab_v5` | Barcha birliklar (units massivi) |
| `xp` | Umumiy XP ball |
| `streak` | Ketma-ket kunlar |
| `lastDay` | Oxirgi faollik sanasi |
| `wordErrors` | `{ "en_so'z": xato_soni }` |
| `totalAnswered` / `totalCorrect` | Statistika |
| `theme` | `"dark"` yoki `"light"` |

