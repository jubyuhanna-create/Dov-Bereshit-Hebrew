import { useState, useEffect, useCallback, useRef } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "YOUR_SUPABASE_ANON_KEY";

const isConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_URL.startsWith("http") &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

const supabase: SupabaseClient = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (null as unknown as SupabaseClient);

// ─── اللغة ──────────────────────────────────────────────────────────────────
type Lang = "ar" | "he";

const TR = {
  ar: {
    appName: "حفلة",
    tagline: "ابحث عن ديجي أو مكان متاح في يومك المفضل",
    search: "بحث",
    dashboard: "لوحة التحكم",
    login: "دخول",
    logout: "خروج",
    searchByDate: "📅 بحث بالتاريخ",
    searchByVendor: "🎤 بحث بالبائع",
    searchNow: "🔍 ابحث الآن",
    dj: "ديجي",
    venue: "قاعة",
    available: "✓ متاح",
    booked: "✕ محجوز",
    empty: "فارغ",
    whatsapp: "واتساپ",
    instagram: "إنستغرام",
    results: "نتائج",
    vendorsAvailable: "البائعون المتاحون",
    noMatch: "لا يوجد تطابق",
    noVendors: "لا يوجد نتائج",
    noAvailableVendors: "لا يوجد بائعون متاحون في هذا التاريخ",
    typeVendorName: "اكتب اسم البائع...",
    selected: "تم اختياره",
    searching: "جارٍ البحث...",
    welcomeBack: "أهلاً! 🎉",
    loggedOut: "تم تسجيل الخروج",
    vendorPortal: "بوابة البائع",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginBtn: "دخول →",
    loggingIn: "جارٍ الدخول...",
    fillAll: "يرجى ملء جميع الحقول",
    wrongPassword: "كلمة المرور خاطئة",
    invalidEmail: "البريد غير صالح",
    networkError: "خطأ في الاتصال",
    backToSearch: "← العودة للبحث",
    controlPanel: "لوحة التحكم",
    welcomeUser: "أهلاً",
    profileTitle: "الملف الشخصي",
    nameLabel: "اسم البزنس",
    namePlaceholder: "اكتب اسم البزنس...",
    phoneLabel: "الهاتف",
    instagramLabel: "إنستغرام",
    save: "💾 حفظ",
    saving: "جارٍ الحفظ...",
    savingError: "خطأ في الحفظ",
    saved: "تم الحفظ ✓",
    availabilityCalendar: "جدول التوفر",
    calendarInstructions: "انقر على يوم لتغيير حالته",
    howToUse: "طريقة الاستخدام:",
    clickCycle: "⬜ فارغ → 🟢 متاح → 🔴 محجوز → ⬜ حذف",
    daySetAvailable: "تم ضبط اليوم كمتاح ✓",
    daySetBooked: "تم ضبطه كمحجوز",
    dayRemoved: "تمت إزالة اليوم",
    searchError: "خطأ في البحث",
    calError: "خطأ في التقويم — حاول مجدداً",
    selectDate: "اختر تاريخاً",
    selectVendor: "اختر بائعاً",
    loginFirst: "يجب تسجيل الدخول أولاً",
    setupRequired: "الإعداد مطلوب",
    setupDesc: "لإعداد التطبيق، أضف متغيرات البيئة:",
    setupNote: "أضفها في Secrets ثم أعد تشغيل التطبيق",
    footer: "معاً نصنع الحفلات",
    tryAnother: "جرب بائعاً آخر",
    vendor: "بائع",
    searchDateTitle: "ابحث بتاريخ",
    searchVendorTitle: "ابحث بالبائع",
    legendAvailable: "متاح",
    legendBooked: "محجوز",
    legendEmpty: "فارغ",
    onlineIndicator: "متاح",
    // Onboarding
    onboardingTitle: "أهلاً بك في حفلة!",
    onboardingSubtitle: "أخبرنا عن بزنسك",
    onboardingTypeQ: "إيش نوع بزنسك؟",
    onboardingDj: "ديجي 🎧",
    onboardingVenue: "قاعة / فينيو 🏛",
    onboardingNameLabel: "اسم البزنس",
    onboardingNamePlaceholder: "اكتب اسم البزنس...",
    onboardingContinue: "ابدأ →",
    onboardingFillAll: "اختر النوع واكتب اسم البزنس",
    // Photo
    uploadPhoto: "رفع صورة",
    uploadingPhoto: "جارٍ الرفع...",
    photoUploaded: "تم رفع الصورة ✓",
    photoError: "خطأ في رفع الصورة",
    changePhoto: "تغيير الصورة",
  },
  he: {
    appName: "Hafla",
    tagline: "מצא דיג׳יי או מקום פנוי לאירוע שלך",
    search: "חיפוש",
    dashboard: "לוח בקרה",
    login: "כניסה",
    logout: "יציאה",
    searchByDate: "📅 חיפוש לפי תאריך",
    searchByVendor: "🎤 חיפוש לפי ספק",
    searchNow: "🔍 חפש",
    dj: "דיג׳יי",
    venue: "אולם",
    available: "✓ זמין",
    booked: "✕ תפוס",
    empty: "ריק",
    whatsapp: "וואטסאפ",
    instagram: "אינסטגרם",
    results: "תוצאות",
    vendorsAvailable: "ספקים זמינים",
    noMatch: "אין התאמות",
    noVendors: "אין תוצאות",
    noAvailableVendors: "אין ספקים זמינים בתאריך זה",
    typeVendorName: "חפש ספק...",
    selected: "נבחר",
    searching: "מחפש...",
    welcomeBack: "ברוך הבא! 🎉",
    loggedOut: "התנתקת",
    vendorPortal: "פורטל הספקים",
    email: "אימייל",
    password: "סיסמה",
    loginBtn: "כניסה →",
    loggingIn: "נכנס...",
    fillAll: "מלא את כל השדות",
    wrongPassword: "סיסמה שגויה",
    invalidEmail: "אימייל לא תקין",
    networkError: "שגיאת רשת",
    backToSearch: "← חזרה לחיפוש",
    controlPanel: "לוח בקרה",
    welcomeUser: "ברוך הבא",
    profileTitle: "פרופיל",
    nameLabel: "שם העסק",
    namePlaceholder: "כתוב שם העסק...",
    phoneLabel: "טלפון",
    instagramLabel: "אינסטגרם",
    save: "💾 שמור",
    saving: "שומר...",
    savingError: "שגיאה בשמירה",
    saved: "נשמר ✓",
    availabilityCalendar: "לוח זמינות",
    calendarInstructions: "לחץ על יום לשינוי",
    howToUse: "איך להשתמש:",
    clickCycle: "ריק → 🟢 זמין → 🔴 תפוס → ריק",
    daySetAvailable: "נקבע כזמין ✓",
    daySetBooked: "נקבע כתפוס",
    dayRemoved: "היום הוסר",
    searchError: "שגיאה בחיפוש",
    calError: "שגיאה בלוח — נסה שוב",
    selectDate: "בחר תאריך",
    selectVendor: "בחר ספק",
    loginFirst: "יש להתחבר קודם",
    setupRequired: "נדרשת הגדרה",
    setupDesc: "להגדרת האפליקציה, הוסף משתני סביבה:",
    setupNote: "הוסף ב-Secrets ואז הפעל מחדש",
    footer: "ביחד עושים מסיבות",
    tryAnother: "נסה ספק אחר",
    vendor: "ספק",
    searchDateTitle: "חפש לפי תאריך",
    searchVendorTitle: "חפש לפי ספק",
    legendAvailable: "זמין",
    legendBooked: "תפוס",
    legendEmpty: "ריק",
    onlineIndicator: "זמין",
    // Onboarding
    onboardingTitle: "ברוך הבא לסוא פארטי!",
    onboardingSubtitle: "ספר לנו על העסק שלך",
    onboardingTypeQ: "מה סוג העסק?",
    onboardingDj: "דיג׳יי 🎧",
    onboardingVenue: "אולם / וניו 🏛",
    onboardingNameLabel: "שם העסק",
    onboardingNamePlaceholder: "כתוב שם העסק...",
    onboardingContinue: "המשך →",
    onboardingFillAll: "בחר סוג וכתוב שם העסק",
    // Photo
    uploadPhoto: "העלה תמונה",
    uploadingPhoto: "מעלה...",
    photoUploaded: "התמונה הועלתה ✓",
    photoError: "שגיאה בהעלאה",
    changePhoto: "שנה תמונה",
  },
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  name: string;
  type: "dj" | "venue";
  phone: string;
  instagram: string;
  avatar_url: string | null;
}
interface Availability {
  id: number;
  vendor_id: string;
  date: string;
  status: "available" | "booked";
}
interface SearchResult extends Profile {
  status: "available" | "booked";
}
interface GroupedResult {
  date: string;
  vendors: SearchResult[];
}
type View = "search" | "login" | "dashboard" | "onboarding";
type SearchMode = "date" | "vendor";

// ─── Toast ──────────────────────────────────────────────────────────────────
interface ToastItem { id: number; message: string; type: "success" | "error" | "info"; }
let toastId = 0;

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`glass-strong rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-3 pointer-events-auto animate-slide-up shadow-xl ${
          t.type === "success" ? "border-green-500/40 text-green-700" : t.type === "error" ? "border-red-500/40 text-red-700" : "border-green-500/30 text-green-800"
        }`} style={{ borderWidth: "1px" }}>
          <span className="text-base">{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ url, name, type, size = "md" }: { url?: string | null; name?: string; type?: "dj" | "venue"; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-10 h-10 text-xl" : size === "lg" ? "w-20 h-20 text-4xl" : "w-14 h-14 text-3xl";
  const bg = type === "dj" ? "bg-green-100 border-green-300" : "bg-emerald-100 border-emerald-300";
  if (url) return <img src={url} alt={name ?? ""} className={`${sz} rounded-2xl object-cover border-2 ${bg} flex-shrink-0`} />;
  return (
    <div className={`${sz} rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${bg}`}>
      {type === "dj" ? "🎧" : "🏛"}
    </div>
  );
}

// ─── Calendar ───────────────────────────────────────────────────────────────
const MONTHS_AR = ["يناير","فبراير","مارس","إبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const DAYS_AR = ["أحد","إثن","ثلاث","أربع","خمس","جمعة","سبت"];
const DAYS_HE = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function Calendar({ availabilityMap, onDayClick, loading, lang }: {
  availabilityMap: Record<string, Availability>;
  onDayClick: (dateStr: string, current: Availability | undefined) => void;
  loading: boolean;
  lang: Lang;
}) {
  const t = TR[lang];
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = formatDate(new Date());
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const monthName = lang === "ar" ? MONTHS_AR[month] : MONTHS_HE[month];
  const days = lang === "ar" ? DAYS_AR : DAYS_HE;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-lg">‹</button>
        <div className="font-bold text-foreground">{monthName} {year}</div>
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-lg">›</button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {days.map((d, i) => <div key={i} className="text-center py-1 text-xs font-bold text-green-700">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const avail = availabilityMap[dateStr];
          const isToday = dateStr === today;
          const isPast = dateStr < today;
          let cls = "day-empty";
          if (avail?.status === "available") cls = "day-available";
          else if (avail?.status === "booked") cls = "day-booked";
          return (
            <button key={i} onClick={() => !isPast && !loading && onDayClick(dateStr, avail)} disabled={isPast || loading}
              className={`relative aspect-square rounded-lg text-sm font-bold transition-all duration-200 ${cls} ${isToday ? "day-today" : ""} ${isPast ? "opacity-25 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}>
              {day}
              {loading && avail && <span className="absolute inset-0 rounded-lg bg-white/40 flex items-center justify-center text-xs">⏳</span>}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-300 border border-green-500" /><span className="text-muted-foreground">{t.legendAvailable}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-200 border border-red-400" /><span className="text-muted-foreground">{t.legendBooked}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300" /><span className="text-muted-foreground">{t.legendEmpty}</span></div>
      </div>
    </div>
  );
}

// ─── VendorCard (small) ───────────────────────────────────────────────────────
function VendorCard({ vendor, lang }: { vendor: SearchResult; lang: Lang }) {
  const t = TR[lang];
  const waLink = `https://wa.me/${vendor.phone?.replace(/\D/g, "")}`;
  const igLink = `https://instagram.com/${vendor.instagram?.replace("@", "")}`;
  return (
    <div className="glass-strong rounded-2xl p-5 animate-slide-up hover:neon-glow transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <Avatar url={vendor.avatar_url} name={vendor.name} type={vendor.type} size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-foreground truncate">{vendor.name}</h3>
          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${vendor.type === "dj" ? "badge-dj" : "badge-venue"}`}>
            {vendor.type === "dj" ? t.dj : t.venue}
          </span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${vendor.status === "available" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
          {vendor.status === "available" ? t.available : t.booked}
        </div>
      </div>
      <div className="flex gap-2">
        {vendor.phone && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-green-100 border border-green-300 text-green-700 hover:bg-green-200">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.98 0C5.363 0 0 5.363 0 11.98c0 2.107.553 4.082 1.52 5.8L0 24l6.387-1.494A11.932 11.932 0 0011.98 23.96C18.596 23.96 24 18.596 24 11.98 24 5.363 18.596 0 11.98 0zm0 21.927a9.913 9.913 0 01-5.047-1.377l-.362-.215-3.792.886.932-3.699-.236-.38A9.888 9.888 0 012.047 11.98c0-5.485 4.463-9.933 9.933-9.933s9.933 4.448 9.933 9.933-4.448 9.947-9.933 9.947z"/></svg>
            {t.whatsapp}
          </a>
        )}
        {vendor.instagram && (
          <a href={igLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-100 border border-emerald-300 text-emerald-700 hover:bg-emerald-200">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            {t.instagram}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── VendorCardLarge ──────────────────────────────────────────────────────────
function VendorCardLarge({ vendor, lang }: { vendor: SearchResult; lang: Lang }) {
  const t = TR[lang];
  const waLink = `https://wa.me/${vendor.phone?.replace(/\D/g, "")}`;
  const igLink = `https://instagram.com/${vendor.instagram?.replace("@", "")}`;
  return (
    <div className="glass-strong rounded-2xl p-6 animate-slide-up hover:neon-glow transition-all duration-300 space-y-4">
      <div className="flex items-center gap-4">
        <Avatar url={vendor.avatar_url} name={vendor.name} type={vendor.type} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-xl text-foreground leading-tight">{vendor.name}</h3>
          <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${vendor.type === "dj" ? "badge-dj" : "badge-venue"}`}>
            {vendor.type === "dj" ? t.dj : t.venue}
          </span>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-300 px-2.5 py-0.5 rounded-full text-xs font-bold mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-glow inline-block" />
            {t.onlineIndicator}
          </div>
        </div>
      </div>
      {vendor.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>📞</span><span dir="ltr">{vendor.phone}</span></div>}
      {vendor.instagram && (
        <a href={igLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 hover:underline transition-colors w-fit">
          <span>📸</span><span dir="ltr">@{vendor.instagram?.replace("@", "")}</span>
        </a>
      )}
      <div className="flex gap-3">
        {vendor.phone && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all bg-green-100 border border-green-300 text-green-700 hover:bg-green-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.98 0C5.363 0 0 5.363 0 11.98c0 2.107.553 4.082 1.52 5.8L0 24l6.387-1.494A11.932 11.932 0 0011.98 23.96C18.596 23.96 24 18.596 24 11.98 24 5.363 18.596 0 11.98 0zm0 21.927a9.913 9.913 0 01-5.047-1.377l-.362-.215-3.792.886.932-3.699-.236-.38A9.888 9.888 0 012.047 11.98c0-5.485 4.463-9.933 9.933-9.933s9.933 4.448 9.933 9.933-4.448 9.947-9.933 9.947z"/></svg>
            {t.whatsapp}
          </a>
        )}
        {vendor.instagram && (
          <a href={igLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all bg-emerald-100 border border-emerald-300 text-emerald-700 hover:bg-emerald-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            {t.instagram}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = TR[lang];

  const [view, setView] = useState<View>("search");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Search state
  const [searchMode, setSearchMode] = useState<SearchMode>("date");
  const [searchDate, setSearchDate] = useState("");
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [vendorQuery, setVendorQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [dateResults, setDateResults] = useState<SearchResult[]>([]);
  const [vendorResults, setVendorResults] = useState<GroupedResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dashboard state
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, Availability>>({});
  const [calLoading, setCalLoading] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Onboarding state
  const [obType, setObType] = useState<"dj" | "venue" | "">("");
  const [obName, setObName] = useState("");
  const [obSaving, setObSaving] = useState(false);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  // ─── Auth ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) { setUser(data.session.user); loadProfile(data.session.user.id); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string, goToDashboard = false) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !data || !data.name) {
      // New user or incomplete profile — show onboarding
      setView("onboarding");
      return;
    }
    const p = data as Profile;
    setProfile(p);
    setEditName(p.name ?? "");
    setEditPhone(p.phone ?? "");
    setEditInstagram(p.instagram ?? "");
    if (goToDashboard) setView("dashboard");
  }

  // Load vendor list for search
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from("profiles").select("*").not("name", "is", null).then(({ data }) => {
      if (data) setVendors(data as Profile[]);
    });
  }, []);

  async function loadAvailability(userId: string) {
    setCalLoading(true);
    const { data, error } = await supabase.from("availability").select("*").eq("vendor_id", userId);
    setCalLoading(false);
    if (error) { addToast(t.calError, "error"); return; }
    if (data) {
      const map: Record<string, Availability> = {};
      (data as Availability[]).forEach((a) => { map[a.date] = a; });
      setAvailabilityMap(map);
    }
  }

  useEffect(() => { if (view === "dashboard" && user) loadAvailability(user.id); }, [view, user]);

  // ─── Onboarding ───────────────────────────────────────────────────────────
  async function saveOnboarding() {
    if (!user || !obType || !obName.trim()) { addToast(t.onboardingFillAll, "error"); return; }
    setObSaving(true);
    // Try update — use .select() to detect whether any row was actually updated
    const { data: updated, error: upErr } = await supabase
      .from("profiles")
      .update({ name: obName.trim(), type: obType })
      .eq("id", user.id)
      .select();
    // If update errored OR updated 0 rows → try insert
    if (upErr || !updated?.length) {
      const { error: insErr } = await supabase.from("profiles").insert({
        id: user.id,
        name: obName.trim(),
        type: obType,
        phone: "",
        instagram: "",
      });
      if (insErr) {
        addToast(`${t.savingError}: ${insErr.message}`, "error");
        setObSaving(false);
        return;
      }
    }
    setObSaving(false);
    addToast(t.welcomeBack, "success");
    await loadProfile(user.id, true);
    supabase.from("profiles").select("*").not("name", "is", null).then(({ data }) => { if (data) setVendors(data as Profile[]); });
  }

  // ─── Search ────────────────────────────────────────────────────────────────
  async function searchByDate() {
    if (!searchDate) return addToast(t.selectDate, "error");
    setSearchLoading(true); setDateResults([]);
    const { data: avails, error } = await supabase.from("availability").select("vendor_id, status").eq("date", searchDate).eq("status", "available");
    if (error) { addToast(t.searchError, "error"); setSearchLoading(false); return; }
    if (!avails?.length) { setSearchLoading(false); return; }
    const ids = avails.map((a: { vendor_id: string }) => a.vendor_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
    if (profiles) {
      setDateResults((profiles as Profile[]).map((p) => ({ ...p, status: "available" as const })));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
    setSearchLoading(false);
  }

  async function searchByVendor(vendorId?: string) {
    const id = vendorId ?? selectedVendorId;
    if (!id) return addToast(t.selectVendor, "error");
    setSearchLoading(true); setVendorResults([]);
    const { data: myDates, error } = await supabase.from("availability").select("date").eq("vendor_id", id).eq("status", "available");
    if (error || !myDates?.length) { setSearchLoading(false); return; }
    const dates = myDates.map((d: { date: string }) => d.date);
    const { data: otherAvails } = await supabase.from("availability").select("vendor_id, date, status").in("date", dates).eq("status", "available").neq("vendor_id", id);
    if (!otherAvails?.length) { setSearchLoading(false); return; }
    const uniqueIds = [...new Set((otherAvails as { vendor_id: string }[]).map((a) => a.vendor_id))];
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", uniqueIds);
    if (!profiles) { setSearchLoading(false); return; }
    const profMap: Record<string, Profile> = {};
    (profiles as Profile[]).forEach((p) => { profMap[p.id] = p; });
    const byDate: Record<string, SearchResult[]> = {};
    (otherAvails as { vendor_id: string; date: string; status: "available" | "booked" }[]).forEach((a) => {
      if (!byDate[a.date]) byDate[a.date] = [];
      const prof = profMap[a.vendor_id];
      if (prof) byDate[a.date].push({ ...prof, status: a.status });
    });
    const grouped: GroupedResult[] = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, vs]) => ({ date, vendors: vs }));
    setVendorResults(grouped);
    setSearchLoading(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  // ─── Auth actions ─────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoginError("");
    if (!email || !password) { setLoginError(t.fillAll); return; }
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) setLoginError(t.wrongPassword);
      else if (error.message.includes("Invalid email")) setLoginError(t.invalidEmail);
      else setLoginError(t.networkError);
      return;
    }
    // profile load + routing handled by onAuthStateChange
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setView("search");
    addToast(t.loggedOut, "info");
  }

  // ─── Profile save ─────────────────────────────────────────────────────────
  async function saveProfile() {
    if (!user) return;
    setProfileSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: editName,
      phone: editPhone,
      instagram: editInstagram,
    }).eq("id", user.id);
    setProfileSaving(false);
    if (error) addToast(t.savingError, "error");
    else { addToast(t.saved, "success"); loadProfile(user.id); }
  }

  // ─── Photo upload ─────────────────────────────────────────────────────────
  async function uploadAvatar(file: File) {
    if (!user) return;
    setPhotoUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${user.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
    if (upErr) { addToast(t.photoError, "error"); setPhotoUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = urlData.publicUrl + `?t=${Date.now()}`;
    const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    setPhotoUploading(false);
    if (error) addToast(t.photoError, "error");
    else { addToast(t.photoUploaded, "success"); loadProfile(user.id); }
  }

  // ─── Calendar ─────────────────────────────────────────────────────────────
  async function handleDayClick(dateStr: string, current: Availability | undefined) {
    if (!user) return;
    setCalLoading(true);
    let error;
    if (!current) {
      ({ error } = await supabase.from("availability").insert({ vendor_id: user.id, date: dateStr, status: "available" }));
      if (!error) addToast(t.daySetAvailable, "success");
    } else if (current.status === "available") {
      ({ error } = await supabase.from("availability").update({ status: "booked" }).eq("id", current.id));
      if (!error) addToast(t.daySetBooked, "info");
    } else {
      ({ error } = await supabase.from("availability").delete().eq("id", current.id));
      if (!error) addToast(t.dayRemoved, "info");
    }
    if (error) addToast(`${t.calError}: ${error.message}`, "error");
    await loadAvailability(user.id);
    setCalLoading(false);
  }

  // ─── Setup guard ──────────────────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
        <div className="glass-strong rounded-3xl p-10 w-full max-w-lg text-center space-y-6 neon-border animate-slide-up">
          <div className="text-6xl animate-pulse-glow">⚙️</div>
          <h1 className="text-3xl font-black neon-text-indigo">حفلة</h1>
          <div className="glass rounded-2xl p-6 text-right space-y-4">
            <p className="text-sm font-bold text-foreground">{t.setupDesc}</p>
            <div className="space-y-2 font-mono text-xs" dir="ltr">
              <div className="glass px-4 py-2.5 rounded-xl text-green-700 text-left">VITE_SUPABASE_URL=https://…supabase.co</div>
              <div className="glass px-4 py-2.5 rounded-xl text-emerald-700 text-left">VITE_SUPABASE_ANON_KEY=…</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" dir="rtl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 glass-strong border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button onClick={() => setView("search")} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl neon-border flex items-center justify-center bg-green-100">
              <span className="text-lg">🎵</span>
            </div>
            <span className="font-black text-xl neon-text-indigo tracking-wide hidden sm:block">{t.appName}</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setView("search")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === "search" ? "bg-green-100 text-green-700 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-green-50"}`}>{t.search}</button>
            {user && profile && (
              <button onClick={() => setView("dashboard")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === "dashboard" ? "bg-green-100 text-green-700 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-green-50"}`}>{t.dashboard}</button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "ar" ? "he" : "ar")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-green-200 hover:border-green-400 transition-all text-sm font-bold">
              <span className="text-base">{lang === "ar" ? "🇮🇱" : "🇵🇸"}</span>
              <span className="text-muted-foreground hidden sm:block">{lang === "ar" ? "עב" : "عر"}</span>
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover border-2 border-green-300" alt="" />
                  : <span className="text-xl">{profile?.type === "dj" ? "🎧" : "🏛"}</span>
                }
                <span className="text-xs text-muted-foreground truncate max-w-[120px] font-semibold">{profile?.name || user.email}</span>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all">{t.logout}</button>
              </div>
            ) : (
              <button onClick={() => setView("login")} className="btn-neon px-4 py-2 rounded-xl text-sm text-white font-bold">{t.login}</button>
            )}
            <button className="md:hidden w-9 h-9 glass rounded-lg flex items-center justify-center" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="space-y-1"><div className="w-4 h-0.5 bg-foreground/70" /><div className="w-4 h-0.5 bg-foreground/70" /><div className="w-4 h-0.5 bg-foreground/70" /></div>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 px-4 py-3 space-y-1 animate-slide-up">
            <button onClick={() => { setView("search"); setMobileMenuOpen(false); }} className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-green-50 transition-all">🔍 {t.search}</button>
            {user && profile && <button onClick={() => { setView("dashboard"); setMobileMenuOpen(false); }} className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-green-50 transition-all">🎛 {t.dashboard}</button>}
            {user ? <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all">← {t.logout}</button>
              : <button onClick={() => { setView("login"); setMobileMenuOpen(false); }} className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold text-green-700 hover:bg-green-50 transition-all">→ {t.login}</button>}
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ═══ Onboarding ═══ */}
        {view === "onboarding" && (
          <div className="flex justify-center items-center min-h-[75vh] animate-slide-up">
            <div className="glass-strong rounded-3xl p-8 w-full max-w-lg space-y-8 neon-border">
              <div className="text-center space-y-2">
                <div className="text-6xl mb-2">🎉</div>
                <h2 className="text-2xl font-black text-foreground">{t.onboardingTitle}</h2>
                <p className="text-muted-foreground">{t.onboardingSubtitle}</p>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-foreground text-center">{t.onboardingTypeQ}</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setObType("dj")} className={`py-6 rounded-2xl text-center transition-all duration-200 border-2 space-y-2 ${obType === "dj" ? "border-green-500 bg-green-100 shadow-lg scale-105" : "border-border hover:border-green-300 bg-white hover:bg-green-50"}`}>
                    <div className="text-5xl">🎧</div>
                    <div className="font-black text-lg text-foreground">{t.onboardingDj}</div>
                  </button>
                  <button onClick={() => setObType("venue")} className={`py-6 rounded-2xl text-center transition-all duration-200 border-2 space-y-2 ${obType === "venue" ? "border-green-500 bg-green-100 shadow-lg scale-105" : "border-border hover:border-green-300 bg-white hover:bg-green-50"}`}>
                    <div className="text-5xl">🏛</div>
                    <div className="font-black text-lg text-foreground">{t.onboardingVenue}</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground">{t.onboardingNameLabel}</label>
                <input
                  type="text"
                  value={obName}
                  onChange={(e) => setObName(e.target.value)}
                  placeholder={t.onboardingNamePlaceholder}
                  className="input-dark text-lg py-4"
                  onKeyDown={(e) => e.key === "Enter" && saveOnboarding()}
                />
              </div>

              <button onClick={saveOnboarding} disabled={obSaving || !obType || !obName.trim()} className="btn-neon w-full py-4 rounded-2xl text-white font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed">
                {obSaving ? <span className="flex items-center justify-center gap-2"><span className="spinner" />{t.saving}</span> : t.onboardingContinue}
              </button>
            </div>
          </div>
        )}

        {/* ═══ Search ═══ */}
        {view === "search" && (
          <div className="space-y-8 animate-slide-up">
            <div className="text-center space-y-3 py-8">
              <h1 className="text-5xl md:text-6xl font-black neon-text-indigo">{t.appName}</h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">{t.tagline}</p>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={() => setSearchMode("date")} className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${searchMode === "date" ? "btn-neon text-white" : "glass text-muted-foreground hover:text-foreground border border-border"}`}>{t.searchByDate}</button>
              <button onClick={() => setSearchMode("vendor")} className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${searchMode === "vendor" ? "btn-neon text-white" : "glass text-muted-foreground hover:text-foreground border border-border"}`}>{t.searchByVendor}</button>
            </div>

            {/* Date search */}
            {searchMode === "date" && (
              <div className="glass-strong rounded-2xl p-6 max-w-lg mx-auto space-y-4">
                <h2 className="font-bold text-lg text-foreground">{t.searchDateTitle}</h2>
                <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="input-dark" min={new Date().toISOString().split("T")[0]} />
                <button onClick={searchByDate} disabled={searchLoading || !searchDate} className="btn-neon w-full py-3 rounded-xl text-white font-bold disabled:opacity-40">
                  {searchLoading ? <span className="spinner mx-auto" /> : t.searchNow}
                </button>
              </div>
            )}

            {/* Vendor search */}
            {searchMode === "vendor" && (() => {
              const filtered = vendors.filter((v) => !vendorQuery || v.name?.toLowerCase().includes(vendorQuery.toLowerCase()));
              const selected = vendors.find((v) => v.id === selectedVendorId);
              return (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="glass-strong rounded-2xl p-6 space-y-4">
                    <h2 className="font-bold text-lg text-foreground">{t.searchVendorTitle}</h2>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">🔍</span>
                      <input type="text" value={vendorQuery} onChange={(e) => { setVendorQuery(e.target.value); setSelectedVendorId(""); setVendorResults([]); }} placeholder={t.typeVendorName} className="input-dark pr-12" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-hidden">
                      {filtered.length === 0 && <p className="col-span-2 text-center py-6 text-muted-foreground text-sm">{t.noVendors}</p>}
                      {filtered.map((v) => {
                        const isSel = selectedVendorId === v.id;
                        return (
                          <button key={v.id} onClick={() => { setSelectedVendorId(v.id); setVendorResults([]); searchByVendor(v.id); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-200 ${isSel ? "neon-border bg-green-50 text-foreground" : "border border-border text-muted-foreground hover:text-foreground hover:bg-green-50"}`}>
                            <Avatar url={v.avatar_url} name={v.name} type={v.type} size="sm" />
                            <div className="flex-1 min-w-0 text-right">
                              <div className="font-bold truncate text-sm">{v.name}</div>
                              <div className={`text-xs mt-0.5 ${isSel ? "text-green-700" : "text-muted-foreground"}`}>{v.type === "dj" ? t.dj : t.venue}</div>
                            </div>
                            {isSel && <span className="text-green-600 text-lg">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {selected && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-300">
                        <Avatar url={selected.avatar_url} name={selected.name} type={selected.type} size="sm" />
                        <div className="flex-1"><span className="text-sm text-muted-foreground">{t.selected}: </span><span className="font-bold text-green-700">{selected.name}</span></div>
                        {searchLoading && <span className="spinner flex-shrink-0" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Date results */}
            {searchMode === "date" && (
              <div ref={resultsRef} className="scroll-mt-24 space-y-4">
                {searchLoading && <div className="flex justify-center py-16"><div className="text-center space-y-3"><span className="spinner" style={{ width: 36, height: 36 }} /><p className="text-muted-foreground text-sm">{t.searching}</p></div></div>}
                {!searchLoading && searchDate && dateResults.length === 0 && (
                  <div className="text-center py-16 space-y-3"><div className="text-6xl animate-pulse-glow">🎵</div><p className="text-muted-foreground">{t.noAvailableVendors}</p></div>
                )}
                {!searchLoading && dateResults.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4">{t.results} — <span className="neon-text-indigo">{dateResults.length}</span></h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dateResults.map((v) => <VendorCard key={v.id} vendor={v} lang={lang} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vendor results */}
            {searchMode === "vendor" && (searchLoading || vendorResults.length > 0 || selectedVendorId) && (
              <div ref={resultsRef} className="scroll-mt-24 space-y-6">
                {searchLoading && <div className="flex justify-center py-16"><div className="text-center space-y-3"><span className="spinner" style={{ width: 40, height: 40 }} /><p className="text-muted-foreground text-sm">{t.searching}</p></div></div>}
                {!searchLoading && vendorResults.length > 0 && (
                  <>
                    <div className="flex items-center gap-4">
                      <h3 className="font-black text-2xl text-foreground">{t.vendorsAvailable}</h3>
                      <div className="flex-1 h-px bg-border" />
                      <div className="glass px-4 py-1.5 rounded-full border border-border"><span className="text-sm font-bold neon-text-indigo">{vendorResults.reduce((s, g) => s + g.vendors.length, 0)} {t.results}</span></div>
                    </div>
                    {vendorResults.map((group) => (
                      <div key={group.date} className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="neon-border bg-green-50 px-6 py-2 rounded-2xl"><span className="font-black neon-text-indigo">📅 {group.date}</span></div>
                          <div className="flex-1 h-px bg-border/50" />
                          <span className="text-xs text-muted-foreground">{group.vendors.length} {t.vendor}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                          {group.vendors.map((v) => <VendorCardLarge key={`${group.date}-${v.id}`} vendor={v} lang={lang} />)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {!searchLoading && selectedVendorId && vendorResults.length === 0 && (
                  <div className="text-center py-16 space-y-3"><div className="text-6xl animate-pulse-glow">🔎</div><p className="text-muted-foreground">{t.noMatch}</p><p className="text-xs text-muted-foreground/60">{t.tryAnother}</p></div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ Login ═══ */}
        {view === "login" && (
          <div className="flex justify-center items-center min-h-[70vh] animate-slide-up">
            <div className="glass-strong rounded-3xl p-8 w-full max-w-md space-y-6 neon-border">
              <div className="text-center space-y-2">
                <div className="text-5xl mb-4">🎛</div>
                <h2 className="text-2xl font-black text-foreground">{t.vendorPortal}</h2>
              </div>
              {loginError && <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-300 text-red-700 text-sm">{loginError}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t.email}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-dark" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t.password}</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-dark pl-12" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm">{showPass ? "🙈" : "👁"}</button>
                  </div>
                </div>
                <button type="submit" disabled={loginLoading} className="btn-neon w-full py-3 rounded-xl text-white font-bold text-base disabled:opacity-50">
                  {loginLoading ? <span className="flex items-center justify-center gap-2"><span className="spinner" />{t.loggingIn}</span> : t.loginBtn}
                </button>
              </form>
              <button onClick={() => setView("search")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-bold transition-colors">{t.backToSearch}</button>
            </div>
          </div>
        )}

        {/* ═══ Dashboard ═══ */}
        {view === "dashboard" && user && profile && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black neon-text-indigo">{t.controlPanel}</h1>
                <p className="text-muted-foreground text-sm mt-1">{t.welcomeUser} {profile.name}</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all">{t.logout}</button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Profile card */}
              <div className="glass-strong rounded-2xl p-6 space-y-5">
                {/* Avatar section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar url={profile.avatar_url} name={profile.name} type={profile.type} size="lg" />
                    <button onClick={() => photoInputRef.current?.click()} className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shadow-lg hover:bg-green-700 transition-colors" title={t.changePhoto}>
                      {photoUploading ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> : "📷"}
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-foreground">{profile.name}</h2>
                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${profile.type === "dj" ? "badge-dj" : "badge-venue"}`}>{profile.type === "dj" ? t.dj : t.venue}</span>
                    <p className="text-xs text-muted-foreground mt-1">{t.changePhoto}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{t.nameLabel}</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-dark" placeholder={t.namePlaceholder} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{t.phoneLabel}</label>
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="input-dark" placeholder="+972..." dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground">{t.instagramLabel}</label>
                      {editInstagram && (
                        <a
                          href={`https://instagram.com/${editInstagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {lang === "ar" ? "فتح" : "פתח"}
                        </a>
                      )}
                    </div>
                    <input type="text" value={editInstagram} onChange={(e) => setEditInstagram(e.target.value)} className="input-dark" placeholder="@username" dir="ltr" />
                  </div>
                  <button onClick={saveProfile} disabled={profileSaving} className="btn-neon w-full py-3 rounded-xl text-white font-bold disabled:opacity-50">
                    {profileSaving ? <span className="flex items-center justify-center gap-2"><span className="spinner" />{t.saving}</span> : t.save}
                  </button>
                </div>
              </div>

              {/* Calendar */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl neon-border bg-green-100 flex items-center justify-center text-xl">📅</div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">{t.availabilityCalendar}</h2>
                    <p className="text-xs text-muted-foreground">{t.calendarInstructions}</p>
                  </div>
                </div>
                <Calendar availabilityMap={availabilityMap} onDayClick={handleDayClick} loading={calLoading} lang={lang} />
                <div className="glass rounded-xl p-4 text-xs text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground">{t.howToUse}</p>
                  <p>{t.clickCycle}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "dashboard" && !user && (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-4 animate-slide-up">
              <div className="text-6xl animate-pulse-glow">🔐</div>
              <p className="text-muted-foreground">{t.loginFirst}</p>
              <button onClick={() => setView("login")} className="btn-neon px-6 py-3 rounded-xl text-white font-bold">{t.login} →</button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-border/40 py-8 text-center">
        <p className="text-muted-foreground/50 text-sm">{t.appName} — {t.footer}</p>
      </footer>
    </div>
  );
}
