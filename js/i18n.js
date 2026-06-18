/* ============================================================
   i18n.js — Ko'p tilli qo'llab-quvvatlash
   Tarjimalar TO'G'RIDAN-TO'G'RI bu faylda (fetch yo'q)
   Sabab: file:// protokolida va bitta HTML faylda fetch
          /locales/*.json yo'lini topa olmaydi.
   ============================================================ */

// ===== BARCHA TARJIMALAR INLINE =====
const _TRANSLATIONS = {
  uz: {
  "app_title": "So'z O'rgatuvchi",
  "auth_subtitle": "Ingliz tilini o'rgan!",
  "auth_login": "Kirish",
  "auth_register": "Ro'yxatdan o'tish",
  "auth_login_btn": "→ Kirish",
  "auth_reg_btn": "→ Ro'yxatdan o'tish",
  "auth_google": "Google bilan kirish",
  "auth_or": "yoki",
  "auth_fill_fields": "Barcha maydonlarni to'ldiring",
  "auth_wrong_pass": "Email yoki parol noto'g'ri",
  "auth_pass_mismatch": "Parollar mos kelmaydi",
  "auth_pass_short": "Parol kamida 6 ta belgi bo'lishi kerak",
  "auth_name": "Ismingiz",
  "auth_password": "Parol",
  "auth_pass_confirm": "Parolni takrorlang",
  "logout": "Chiqish",
  "level": "Level",
  "streak_days": "kun",
  "words": "ta so'z",
  "units": "ta bo'lim",
  "back": "← Orqaga",
  "stop": "⏹ Tugatish",
  "next": "Keyingisi →",
  "prev": "← Oldingi",
  "check": "Tekshir",
  "correct": "✓ To'g'ri!",
  "wrong_title": "✗ Xato!",
  "correct_answer": "To'g'ri javob:",
  "retry_note": "Bu so'z keyinroq qayta chiqadi",
  "time_up": "✗ Vaqt tugadi!",
  "write_word": "Inglizcha yozing...",
  "know": "✓ Bildim",
  "dont_know": "✗ Bilmadim",
  "start": "Boshlash →",
  "stats": "Statistika",
  "sections": "⚙ Bo'limlar",
  "share": "🔗 Ulashish",
  "ai_explain_label": "AI Tushuntirma",
  "ai_loading": "Tushuntirilmoqda",
  "clear_stats": "🗑 Statistikani tozalash",
  "clear_stats_confirm": "Haqiqatan ham tozalamoqchimisiz?",
  "total_answers": "Jami javoblar:",
  "correct_pct": "To'g'ri:",
  "wrong_pct": "Xato:",
  "most_errors": "Ko'p xato qilingan so'zlar:",
  "no_errors": "Hali xato yo'q!",
  "add_unit": "+ Bo'lim qo'shish",
  "save": "💾 Saqlash",
  "delete_unit": "O'chirish",
  "import_btn": "📥 Import",
  "done_great": "Ajoyib!",
  "done_score": "ball",
  "done_correct": "to'g'ri",
  "done_wrong": "xato",
  "select_correct": "TO'G'RI JAVOBNI TANLANG",
  "fill_blank": "BO'SH JOYNI TO'LDIRING",
  "true_false": "TO'G'RI YOKI XATO?",
  "admin_panel": "Admin Panel",
  "admin_total": "Jami foydalanuvchi",
  "admin_online": "Hozir online",
  "admin_sessions": "Jami sessiya",
  "level_beginner": "Beginner",
  "level_elementary": "Elementary",
  "level_pre_int": "Pre-Intermediate",
  "level_intermediate": "Intermediate",
  "level_upper": "Upper-Intermediate",
  "level_advanced": "Advanced",
  "select_units": "Bo'limlarni tanlang",
  "select_all": "Hammasini tanlash",
  "launch": "Boshlash →",
  "unit_words": "ta so'z",
  "edit_unit": "✏️ Tahrirlash",
  "unit_name": "Bo'lim nomi",
  "words_hint": "Har qatorga: inglizcha - o'zbekcha",
  "cancel": "Bekor qilish",
  "confirm_delete": "Bu bo'limni o'chirishni tasdiqlaysizmi?",
  "copy_code": "📋 Kodni nusxalash",
  "copied": "Nusxalandi!",
  "import_code": "Kodni bu yerga joylashtiring...",
  "import_error_invalid": "Noto'g'ri kod!",
  "import_success": "Muvaffaqiyatli import qilindi!",
  "flashcard_mode": "🃏 Yod olish",
  "flashcard_sub": "Flashcard + Audio",
  "quiz_mode": "✍️ Test",
  "quiz_sub": "So'z yozing",
  "mcq_mode": "🎯 Variantli",
  "mcq_sub": "4 ta variant",
  "speed_mode": "⚡ Tezkor",
  "speed_sub": "10 soniya!",
  "exercises_mode": "📝 Grammar Mashqlar",
  "exercises_sub": "Har unit uchun 30 ta mashq",
  "irregular_mode": "🔀 Irregular Verbs",
  "irregular_sub": "66 ta noto'g'ri fe'l — o'yin orqali yodlash",
  "tap_to_flip": "Kartani ag'darish uchun bosing",
  "session_result": "Sessiya natijasi",
  "knew": "Bildim",
  "didnt_know": "Bilmadim",
  "restart_all": "🔄 Hammasini qayta boshlash",
  "restart_wrong": "🔁 Xatolarni qayta boshlash",
  "back_home": "← Bosh sahifa",
  "exercise_select": "Bo'limni tanlang",
  "exercise_progress": "ta mashq",
  "irr_cards": "🃏 Kartalar",
  "irr_match": "🔗 Juftlash",
  "irr_fill": "✍️ Yozish",
  "irr_quiz": "🎯 Test",
  "irr_title": "Noto'g'ri fe'llar",
  "type_noun": "ot",
  "type_verb": "fe'l",
  "type_adj": "sifat",
  "type_adv": "ravish",
  "type_prep": "predlog",
  "type_phrase": "ibora",
  "online_learners": "ta o'quvchi online"
},
  ru: {
  "app_title": "Учим слова",
  "auth_subtitle": "Учи английский язык!",
  "auth_login": "Войти",
  "auth_register": "Регистрация",
  "auth_login_btn": "→ Войти",
  "auth_reg_btn": "→ Зарегистрироваться",
  "auth_google": "Войти через Google",
  "auth_or": "или",
  "auth_fill_fields": "Заполните все поля",
  "auth_wrong_pass": "Неверный email или пароль",
  "auth_pass_mismatch": "Пароли не совпадают",
  "auth_pass_short": "Пароль должен содержать минимум 6 символов",
  "auth_name": "Ваше имя",
  "auth_password": "Пароль",
  "auth_pass_confirm": "Повторите пароль",
  "logout": "Выйти",
  "level": "Уровень",
  "streak_days": "дн",
  "words": "слов",
  "units": "разделов",
  "back": "← Назад",
  "stop": "⏹ Стоп",
  "next": "Далее →",
  "prev": "← Пред",
  "check": "Проверить",
  "correct": "✓ Правильно!",
  "wrong_title": "✗ Ошибка!",
  "correct_answer": "Правильный ответ:",
  "retry_note": "Это слово появится снова",
  "time_up": "✗ Время вышло!",
  "write_word": "Напишите по-английски...",
  "know": "✓ Знаю",
  "dont_know": "✗ Не знаю",
  "start": "Начать →",
  "stats": "Статистика",
  "sections": "⚙ Разделы",
  "share": "🔗 Поделиться",
  "ai_explain_label": "Объяснение AI",
  "ai_loading": "Объясняю",
  "clear_stats": "🗑 Очистить статистику",
  "clear_stats_confirm": "Вы уверены?",
  "total_answers": "Всего ответов:",
  "correct_pct": "Правильно:",
  "wrong_pct": "Ошибки:",
  "most_errors": "Частые ошибки:",
  "no_errors": "Ошибок пока нет!",
  "add_unit": "+ Добавить раздел",
  "save": "💾 Сохранить",
  "delete_unit": "Удалить",
  "import_btn": "📥 Импорт",
  "done_great": "Отлично!",
  "done_score": "очков",
  "done_correct": "правильно",
  "done_wrong": "ошибок",
  "select_correct": "ВЫБЕРИТЕ ПРАВИЛЬНЫЙ ОТВЕТ",
  "fill_blank": "ЗАПОЛНИТЕ ПРОПУСК",
  "true_false": "ВЕРНО ИЛИ НЕТ?",
  "admin_panel": "Панель администратора",
  "admin_total": "Всего пользователей",
  "admin_online": "Сейчас онлайн",
  "admin_sessions": "Всего сессий",
  "level_beginner": "Начинающий",
  "level_elementary": "Элементарный",
  "level_pre_int": "Ниже среднего",
  "level_intermediate": "Средний",
  "level_upper": "Выше среднего",
  "level_advanced": "Продвинутый",
  "select_units": "Выберите разделы",
  "select_all": "Выбрать все",
  "launch": "Начать →",
  "unit_words": "слов",
  "edit_unit": "✏️ Редактировать",
  "unit_name": "Название раздела",
  "words_hint": "Каждая строка: английский - русский",
  "cancel": "Отмена",
  "confirm_delete": "Удалить этот раздел?",
  "copy_code": "📋 Копировать код",
  "copied": "Скопировано!",
  "import_code": "Вставьте код сюда...",
  "import_error_invalid": "Неверный код!",
  "import_success": "Успешно импортировано!",
  "flashcard_mode": "🃏 Запоминание",
  "flashcard_sub": "Флэшкарты + Аудио",
  "quiz_mode": "✍️ Тест",
  "quiz_sub": "Напишите слово",
  "mcq_mode": "🎯 Варианты",
  "mcq_sub": "4 варианта",
  "speed_mode": "⚡ Быстрый",
  "speed_sub": "10 секунд!",
  "exercises_mode": "📝 Грамматика",
  "exercises_sub": "30 упражнений на раздел",
  "irregular_mode": "🔀 Неправильные глаголы",
  "irregular_sub": "66 глаголов — через игру",
  "tap_to_flip": "Нажмите чтобы перевернуть",
  "session_result": "Результат сессии",
  "knew": "Знал",
  "didnt_know": "Не знал",
  "restart_all": "🔄 Начать заново",
  "restart_wrong": "🔁 Повторить ошибки",
  "back_home": "← На главную",
  "exercise_select": "Выберите раздел",
  "exercise_progress": "упражнений",
  "irr_cards": "🃏 Карточки",
  "irr_match": "🔗 Сопоставить",
  "irr_fill": "✍️ Написать",
  "irr_quiz": "🎯 Тест",
  "irr_title": "Неправильные глаголы",
  "type_noun": "сущ.",
  "type_verb": "гл.",
  "type_adj": "прил.",
  "type_adv": "нар.",
  "type_prep": "предл.",
  "type_phrase": "фраза",
  "online_learners": "учеников онлайн"
},
  en: {
  "app_title": "Word Learner",
  "auth_subtitle": "Learn English words!",
  "auth_login": "Sign In",
  "auth_register": "Sign Up",
  "auth_login_btn": "→ Sign In",
  "auth_reg_btn": "→ Sign Up",
  "auth_google": "Continue with Google",
  "auth_or": "or",
  "auth_fill_fields": "Please fill in all fields",
  "auth_wrong_pass": "Wrong email or password",
  "auth_pass_mismatch": "Passwords do not match",
  "auth_pass_short": "Password must be at least 6 characters",
  "auth_name": "Your name",
  "auth_password": "Password",
  "auth_pass_confirm": "Confirm password",
  "logout": "Sign Out",
  "level": "Level",
  "streak_days": "days",
  "words": "words",
  "units": "units",
  "back": "← Back",
  "stop": "⏹ Stop",
  "next": "Next →",
  "prev": "← Prev",
  "check": "Check",
  "correct": "✓ Correct!",
  "wrong_title": "✗ Wrong!",
  "correct_answer": "Correct answer:",
  "retry_note": "This word will appear again",
  "time_up": "✗ Time's up!",
  "write_word": "Type in English...",
  "know": "✓ I know",
  "dont_know": "✗ Don't know",
  "start": "Start →",
  "stats": "Statistics",
  "sections": "⚙ Sections",
  "share": "🔗 Share",
  "ai_explain_label": "AI Explanation",
  "ai_loading": "Explaining",
  "clear_stats": "🗑 Clear stats",
  "clear_stats_confirm": "Are you sure?",
  "total_answers": "Total answers:",
  "correct_pct": "Correct:",
  "wrong_pct": "Wrong:",
  "most_errors": "Most errors:",
  "no_errors": "No errors yet!",
  "add_unit": "+ Add unit",
  "save": "💾 Save",
  "delete_unit": "Delete",
  "import_btn": "📥 Import",
  "done_great": "Great job!",
  "done_score": "pts",
  "done_correct": "correct",
  "done_wrong": "wrong",
  "select_correct": "SELECT THE CORRECT ANSWER",
  "fill_blank": "FILL IN THE BLANK",
  "true_false": "TRUE OR FALSE?",
  "admin_panel": "Admin Panel",
  "admin_total": "Total users",
  "admin_online": "Now online",
  "admin_sessions": "Total sessions",
  "level_beginner": "Beginner",
  "level_elementary": "Elementary",
  "level_pre_int": "Pre-Intermediate",
  "level_intermediate": "Intermediate",
  "level_upper": "Upper-Intermediate",
  "level_advanced": "Advanced",
  "select_units": "Select units",
  "select_all": "Select all",
  "launch": "Start →",
  "unit_words": "words",
  "edit_unit": "✏️ Edit",
  "unit_name": "Unit name",
  "words_hint": "Each line: english - uzbek",
  "cancel": "Cancel",
  "confirm_delete": "Delete this unit?",
  "copy_code": "📋 Copy code",
  "copied": "Copied!",
  "import_code": "Paste code here...",
  "import_error_invalid": "Invalid code!",
  "import_success": "Successfully imported!",
  "flashcard_mode": "🃏 Flashcards",
  "flashcard_sub": "Flashcard + Audio",
  "quiz_mode": "✍️ Quiz",
  "quiz_sub": "Type the word",
  "mcq_mode": "🎯 Multiple Choice",
  "mcq_sub": "4 options",
  "speed_mode": "⚡ Speed",
  "speed_sub": "10 seconds!",
  "exercises_mode": "📝 Grammar Exercises",
  "exercises_sub": "30 exercises per unit",
  "irregular_mode": "🔀 Irregular Verbs",
  "irregular_sub": "66 verbs — learn through games",
  "tap_to_flip": "Tap to flip",
  "session_result": "Session result",
  "knew": "Knew",
  "didnt_know": "Didn't know",
  "restart_all": "🔄 Restart all",
  "restart_wrong": "🔁 Retry wrong",
  "back_home": "← Home",
  "exercise_select": "Select a unit",
  "exercise_progress": "exercises",
  "irr_cards": "🃏 Cards",
  "irr_match": "🔗 Match",
  "irr_fill": "✍️ Fill",
  "irr_quiz": "🎯 Quiz",
  "irr_title": "Irregular Verbs",
  "type_noun": "noun",
  "type_verb": "verb",
  "type_adj": "adj",
  "type_adv": "adv",
  "type_prep": "prep",
  "type_phrase": "phrase",
  "online_learners": "learners online"
}
};

const LANGS       = ['uz', 'ru', 'en'];
const LANG_LABELS = { uz: "O'zbekcha", ru: "Русский", en: "English" };
const LANG_FLAGS  = { uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧" };

let _t    = _TRANSLATIONS['uz'];
let _lang = localStorage.getItem('lang') || 'uz';

// Tarjima qaytarish
function T(key) {
  return _t[key] !== undefined ? _t[key] : key;
}

// Tilni o'zgartirish
async function setLang(l) {
  if (!LANGS.includes(l)) l = 'uz';
  _lang = l;
  localStorage.setItem('lang', l);
  loadLang(l);  // sync — fetch yo'q
  applyLang();
  updateLangButtons(l);
  if (typeof tracker !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
    tracker.updateLang(l);
  }
}

// Tarjimani yuklash (inline, sync)
function loadLang(l) {
  _t = _TRANSLATIONS[l] || _TRANSLATIONS['uz'];
}

// Barcha [data-i18n] elementlarni yangilash
function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key  = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    const val  = T(key);
    if (attr) el.setAttribute(attr, val);
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = T(el.getAttribute('data-i18n-ph'));
  });
  if (typeof document !== 'undefined') {
    document.title = T('app_title');
  }
  renderLangBar();
  updateLangButtons(_lang);
}

// Auth ekranidagi til tugmalar
function updateLangButtons(l) {
  LANGS.forEach(lang => {
    document.querySelectorAll(
      '#lang-' + lang + ', #lm-' + lang + ', .lang-btn-' + lang
    ).forEach(btn => {
      btn.classList.toggle('active', lang === l);
    });
  });
}

// Home ekranidagi mini lang bar
function renderLangBar() {
  const bar = document.getElementById('lang-bar');
  if (!bar) return;
  bar.innerHTML = LANGS.map(l =>
    `<button class="lang-btn ${l === _lang ? 'active' : ''}"
      onclick="setLang('${l}')">${LANG_FLAGS[l]} ${LANG_LABELS[l]}</button>`
  ).join('');
}

// Daraja nomi
function getLevelName(xpVal) {
  const lv = Math.floor((xpVal || 0) / 100) + 1;
  if (lv <= 2)  return T('level_beginner');
  if (lv <= 5)  return T('level_elementary');
  if (lv <= 10) return T('level_pre_int');
  if (lv <= 20) return T('level_intermediate');
  if (lv <= 35) return T('level_upper');
  return T('level_advanced');
}

// INIT — sahifa yuklanishi bilan darhol ishlaydi
(function initI18n() {
  loadLang(_lang);
  // DOM tayyor bo'lgach applyLang chaqiriladi (initAuth dan)
})();
