import { useState, useEffect, useCallback } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

// ─── הגדרות Supabase ── إعدادات Supabase ───────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "YOUR_SUPABASE_ANON_KEY";

const isConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_URL.startsWith("http") &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

const supabase: SupabaseClient = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (null as unknown as SupabaseClient);

// ─── טיפוסים ── الأنواع ────────────────────────────────────────────────────
interface Profile {
  id: string;
  name: string;
  type: "dj" | "venue";
  phone: string;
  instagram: string;
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

type View = "search" | "login" | "dashboard";
type SearchMode = "date" | "vendor";

// ─── Toast ─────────────────────────────────────────────────────────────────
interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-strong rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-3 pointer-events-auto animate-slide-up shadow-xl ${
            t.type === "success" ? "border-green-500/30 text-green-300" :
            t.type === "error" ? "border-red-500/30 text-red-300" :
            "border-indigo-500/30 text-indigo-300"
          }`}
          style={{ borderWidth: "1px" }}
        >
          <span className="text-base">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── أسماء الأشهر ─────────────────────────────────────────────────────────
const MONTHS_AR = ["يناير","فبراير","مارس","إبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const DAYS_AR = ["أحد","إثن","ثلاث","أربع","خمس","جمعة","سبت"];
const DAYS_HE = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ─── مكون التقويم ── רכיב לוח השנה ───────────────────────────────────────
function Calendar({
  availabilityMap,
  onDayClick,
  loading,
}: {
  availabilityMap: Record<string, Availability>;
  onDayClick: (dateStr: string, current: Availability | undefined) => void;
  loading: boolean;
}) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = formatDate(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrent(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-bold text-foreground">
            {MONTHS_AR[month]} {year}
          </div>
          <div className="text-xs text-muted-foreground">
            {MONTHS_HE[month]} {year}
          </div>
        </div>
        <button
          onClick={() => setCurrent(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS_AR.map((d, i) => (
          <div key={i} className="text-center py-1">
            <div className="text-xs font-semibold text-indigo-400">{d}</div>
            <div className="text-[10px] text-muted-foreground">{DAYS_HE[i]}</div>
          </div>
        ))}
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
            <button
              key={i}
              onClick={() => !isPast && !loading && onDayClick(dateStr, avail)}
              disabled={isPast || loading}
              className={`relative aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${cls} ${
                isToday ? "day-today ring-2 ring-indigo-500/60" : ""
              } ${isPast ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500/50" />
          <span className="text-muted-foreground">متاح / זמין</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500/50" />
          <span className="text-muted-foreground">محجوز / תפוס</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
          <span className="text-muted-foreground">فارغ / ריק</span>
        </div>
      </div>
    </div>
  );
}

// ─── بطاقة بائع ── כרטיס ספק ──────────────────────────────────────────────
function VendorCard({ vendor }: { vendor: SearchResult }) {
  const waLink = `https://wa.me/${vendor.phone?.replace(/\D/g, "")}`;
  const igLink = `https://instagram.com/${vendor.instagram?.replace("@", "")}`;

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up hover:neon-glow transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-foreground">{vendor.name}</h3>
          <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
            vendor.type === "dj" ? "badge-dj" : "badge-venue"
          }`}>
            {vendor.type === "dj" ? "ديجي / DJ" : "مكان / אולם"}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          vendor.status === "available"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {vendor.status === "available" ? "✓ متاح / זמין" : "✕ محجوز / תפוס"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {vendor.phone && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.98 0C5.363 0 0 5.363 0 11.98c0 2.107.553 4.082 1.52 5.8L0 24l6.387-1.494A11.932 11.932 0 0011.98 23.96C18.596 23.96 24 18.596 24 11.98 24 5.363 18.596 0 11.98 0zm0 21.927a9.913 9.913 0 01-5.047-1.377l-.362-.215-3.792.886.932-3.699-.236-.38A9.888 9.888 0 012.047 11.98c0-5.485 4.463-9.933 9.933-9.933s9.933 4.448 9.933 9.933-4.448 9.947-9.933 9.947z"/>
            </svg>
            واتساپ / וואטסאפ
          </a>
        )}
        {vendor.instagram && (
          <a
            href={igLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            إنستغرام / אינסטגרם
          </a>
        )}
      </div>
    </div>
  );
}

// ─── التطبيق الرئيسي ── האפליקציה הראשית ──────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("search");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Search state
  const [searchMode, setSearchMode] = useState<SearchMode>("date");
  const [searchDate, setSearchDate] = useState("");
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [dateResults, setDateResults] = useState<SearchResult[]>([]);
  const [vendorResults, setVendorResults] = useState<GroupedResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── تحقق من الجلسة عند التحميل ──────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        loadProfile(data.session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── تحميل الملف الشخصي ──────────────────────────────────────────────────
  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) {
      setProfile(data as Profile);
      setEditName(data.name ?? "");
      setEditPhone(data.phone ?? "");
      setEditInstagram(data.instagram ?? "");
    }
  }

  // ── تحميل البائعين ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from("profiles").select("*").then(({ data }) => {
      if (data) setVendors(data as Profile[]);
    });
  }, []);

  // ── تحميل التوفر (لوحة التحكم) ─────────────────────────────────────────
  async function loadAvailability(userId: string) {
    setCalLoading(true);
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("vendor_id", userId);
    setCalLoading(false);
    if (!error && data) {
      const map: Record<string, Availability> = {};
      (data as Availability[]).forEach((a) => { map[a.date] = a; });
      setAvailabilityMap(map);
    }
  }

  useEffect(() => {
    if (view === "dashboard" && user) loadAvailability(user.id);
  }, [view, user]);

  // ── البحث بالتاريخ ───────────────────────────────────────────────────────
  async function searchByDate() {
    if (!searchDate) return addToast("اختر تاريخاً / בחר תאריך", "error");
    setSearchLoading(true);
    setDateResults([]);
    const { data: avails, error } = await supabase
      .from("availability")
      .select("vendor_id, status")
      .eq("date", searchDate)
      .eq("status", "available");
    if (error) { addToast("خطأ في البحث / שגיאה בחיפוש", "error"); setSearchLoading(false); return; }
    if (!avails?.length) { setSearchLoading(false); return; }
    const ids = avails.map((a: { vendor_id: string }) => a.vendor_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
    if (profiles) {
      const results: SearchResult[] = (profiles as Profile[]).map((p) => ({
        ...p,
        status: "available" as const,
      }));
      setDateResults(results);
    }
    setSearchLoading(false);
  }

  // ── البحث بالبائع ────────────────────────────────────────────────────────
  async function searchByVendor() {
    if (!selectedVendorId) return addToast("اختر بائعاً / בחר ספק", "error");
    setSearchLoading(true);
    setVendorResults([]);
    const { data: myDates, error } = await supabase
      .from("availability")
      .select("date")
      .eq("vendor_id", selectedVendorId)
      .eq("status", "available");
    if (error || !myDates?.length) { setSearchLoading(false); return; }
    const dates = myDates.map((d: { date: string }) => d.date);
    const { data: otherAvails } = await supabase
      .from("availability")
      .select("vendor_id, date, status")
      .in("date", dates)
      .eq("status", "available")
      .neq("vendor_id", selectedVendorId);
    if (!otherAvails?.length) { setSearchLoading(false); return; }
    const uniqueIds = [...new Set((otherAvails as { vendor_id: string; date: string; status: string }[]).map((a) => a.vendor_id))];
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
    const grouped: GroupedResult[] = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vendors]) => ({ date, vendors }));
    setVendorResults(grouped);
    setSearchLoading(false);
  }

  // ── تسجيل الدخول ─────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    if (!email || !password) { setLoginError("يرجى ملء جميع الحقول / מלא את כל השדות"); return; }
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) setLoginError("كلمة المرور خاطئة / סיסמה שגויה");
      else if (error.message.includes("Invalid email")) setLoginError("البريد غير صالح / אימייל לא תקין");
      else setLoginError("خطأ في الاتصال / שגיאת רשת");
      return;
    }
    addToast("مرحباً! / ברוך הבא! 🎉", "success");
    setView("dashboard");
  }

  // ── تسجيل الخروج ─────────────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    setView("search");
    addToast("تم تسجيل الخروج / התנתקת", "info");
  }

  // ── حفظ الملف الشخصي ─────────────────────────────────────────────────────
  async function saveProfile() {
    if (!user) return;
    setProfileSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: editName, phone: editPhone, instagram: editInstagram })
      .eq("id", user.id);
    setProfileSaving(false);
    if (error) addToast("خطأ في الحفظ / שגיאה בשמירה", "error");
    else {
      addToast("تم الحفظ / נשמר! ✓", "success");
      loadProfile(user.id);
    }
  }

  // ── النقر على يوم في التقويم ───────────────────────────────────────────
  async function handleDayClick(dateStr: string, current: Availability | undefined) {
    if (!user) return;
    setCalLoading(true);
    if (!current) {
      const { error } = await supabase
        .from("availability")
        .insert({ vendor_id: user.id, date: dateStr, status: "available" });
      if (!error) addToast("تم ضبط اليوم كمتاح / נקבע כזמין ✓", "success");
    } else if (current.status === "available") {
      const { error } = await supabase
        .from("availability")
        .update({ status: "booked" })
        .eq("id", current.id);
      if (!error) addToast("تم ضبطه كمحجوز / נקבע כתפוס", "info");
    } else {
      const { error } = await supabase
        .from("availability")
        .delete()
        .eq("id", current.id);
      if (!error) addToast("تمت إزالة اليوم / היום הוסר", "info");
    }
    await loadAvailability(user.id);
    setCalLoading(false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
        <div className="glass-strong rounded-3xl p-10 w-full max-w-lg text-center space-y-6 neon-border animate-slide-up">
          <div className="text-6xl animate-pulse-glow">⚙️</div>
          <h1 className="text-3xl font-black neon-text-indigo">سوا پارتي</h1>
          <p className="text-muted-foreground">الإعداد مطلوب / נדרשת הגדרה</p>
          <div className="glass rounded-2xl p-6 text-right space-y-4">
            <p className="text-sm font-bold text-foreground">لإعداد التطبيق، أضف متغيرات البيئة:</p>
            <p className="text-xs text-muted-foreground">להגדרת האפליקציה, הוסף משתני סביבה:</p>
            <div className="space-y-2 font-mono text-xs" dir="ltr">
              <div className="glass px-4 py-2.5 rounded-xl text-indigo-300 text-left">
                VITE_SUPABASE_URL=https://your-project.supabase.co
              </div>
              <div className="glass px-4 py-2.5 rounded-xl text-purple-300 text-left">
                VITE_SUPABASE_ANON_KEY=your-anon-key
              </div>
            </div>
            <p className="text-xs text-muted-foreground/60">
              أضفها في Secrets ثم أعد تشغيل التطبيق
            </p>
            <p className="text-xs text-muted-foreground/50">
              הוסף ב-Secrets ואז הפעל מחדש
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── ناف بار ── ניווט ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* لوگو */}
          <button
            onClick={() => setView("search")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl neon-border flex items-center justify-center bg-indigo-500/10">
              <span className="text-lg">🎵</span>
            </div>
            <span className="font-black text-xl neon-text-indigo tracking-wide hidden sm:block">
              سوا پارتي
            </span>
          </button>

          {/* روابط سطح المكتب */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setView("search")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                view === "search" ? "bg-indigo-500/20 text-indigo-300 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              بحث / חיפוש
            </button>
            {user ? (
              <button
                onClick={() => setView("dashboard")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  view === "dashboard" ? "bg-indigo-500/20 text-indigo-300 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                لوحة التحكم / לוח בקרה
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">{profile?.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                >
                  خروج / יציאה
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView("login")}
                className={`btn-neon px-4 py-2 rounded-xl text-sm text-white ${view === "login" ? "opacity-70" : ""}`}
              >
                دخول / כניסה
              </button>
            )}
            {/* Mobile menu */}
            <button
              className="md:hidden w-9 h-9 glass rounded-lg flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="space-y-1">
                <div className="w-4 h-0.5 bg-foreground/70" />
                <div className="w-4 h-0.5 bg-foreground/70" />
                <div className="w-4 h-0.5 bg-foreground/70" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 px-4 py-3 space-y-1 animate-slide-up">
            <button
              onClick={() => { setView("search"); setMobileMenuOpen(false); }}
              className="w-full text-right px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              🔍 بحث / חיפוש
            </button>
            {user && (
              <button
                onClick={() => { setView("dashboard"); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                🎛 لوحة التحكم / לוח בקרה
              </button>
            )}
            {user ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
              >
                ← خروج / יציאה
              </button>
            ) : (
              <button
                onClick={() => { setView("login"); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-sm text-indigo-300 hover:bg-indigo-500/10 transition-all"
              >
                → دخول / כניסה
              </button>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ═══════════════════ شاشة البحث ═══════════════════ */}
        {view === "search" && (
          <div className="space-y-8 animate-slide-up">
            {/* هيدر */}
            <div className="text-center space-y-3 py-8">
              <h1 className="text-5xl md:text-6xl font-black neon-text-indigo">
                سوا پارتي
              </h1>
              <p className="text-xl font-bold neon-text-purple">SawaParty</p>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                ابحث عن ديجي أو مكان متاح في يومك المفضل
              </p>
              <p className="text-muted-foreground/70 text-sm">
                מצא דיג׳יי או מקום פנוי לאירוע שלך
              </p>
            </div>

            {/* أزرار وضع البحث */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setSearchMode("date")}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  searchMode === "date"
                    ? "btn-neon text-white"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                📅 بحث بالتاريخ / לפי תאריך
              </button>
              <button
                onClick={() => setSearchMode("vendor")}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  searchMode === "vendor"
                    ? "btn-neon text-white"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                🎤 بحث بالبائع / לפי ספק
              </button>
            </div>

            {/* البحث بالتاريخ */}
            {searchMode === "date" && (
              <div className="glass-strong rounded-2xl p-6 max-w-lg mx-auto space-y-4">
                <h2 className="font-bold text-lg text-foreground">
                  ابحث بتاريخ / חפש לפי תאריך
                </h2>
                <div className="space-y-3">
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="input-dark"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <button
                    onClick={searchByDate}
                    disabled={searchLoading || !searchDate}
                    className="btn-neon w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? <span className="spinner mx-auto" /> : "🔍 ابحث الآن / חפש"}
                  </button>
                </div>
              </div>
            )}

            {/* البحث بالبائع */}
            {searchMode === "vendor" && (
              <div className="glass-strong rounded-2xl p-6 max-w-lg mx-auto space-y-4">
                <h2 className="font-bold text-lg text-foreground">
                  ابحث بالبائع / חפש לפי ספק
                </h2>
                <div className="space-y-3">
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="input-dark appearance-none"
                  >
                    <option value="">اختر بائعاً / בחר ספק...</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.type === "dj" ? "ديجي / DJ" : "مكان / אולם"}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={searchByVendor}
                    disabled={searchLoading || !selectedVendorId}
                    className="btn-neon w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? <span className="spinner mx-auto" /> : "🔍 ابحث الآن / חפש"}
                  </button>
                </div>
              </div>
            )}

            {/* نتائج البحث بالتاريخ */}
            {searchMode === "date" && (
              <div className="space-y-4">
                {searchLoading && (
                  <div className="flex justify-center py-16">
                    <div className="text-center space-y-3">
                      <span className="spinner" style={{ width: 36, height: 36 }} />
                      <p className="text-muted-foreground text-sm">جارٍ البحث... / מחפש...</p>
                    </div>
                  </div>
                )}
                {!searchLoading && searchDate && dateResults.length === 0 && (
                  <div className="text-center py-16 space-y-3">
                    <div className="text-6xl animate-pulse-glow">🎵</div>
                    <p className="text-muted-foreground">لا يوجد بائعون متاحون في هذا التاريخ</p>
                    <p className="text-muted-foreground/60 text-sm">אין ספקים זמינים בתאריך זה</p>
                  </div>
                )}
                {!searchLoading && dateResults.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-foreground">
                      النتائج / תוצאות —{" "}
                      <span className="neon-text-indigo">{dateResults.length}</span>
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dateResults.map((v) => <VendorCard key={v.id} vendor={v} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* نتائج البحث بالبائع */}
            {searchMode === "vendor" && !searchLoading && vendorResults.length > 0 && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-foreground">
                  البائعون المتاحون / ספקים זמינים
                </h3>
                {vendorResults.map((group) => (
                  <div key={group.date} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="glass px-4 py-1.5 rounded-full">
                        <span className="text-sm font-semibold neon-text-indigo">{group.date}</span>
                      </div>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.vendors.map((v) => <VendorCard key={`${group.date}-${v.id}`} vendor={v} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchMode === "vendor" && !searchLoading && selectedVendorId && vendorResults.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <div className="text-6xl animate-pulse-glow">🔎</div>
                <p className="text-muted-foreground">لا يوجد تطابق / אין התאמות</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ شاشة الدخول ═══════════════════ */}
        {view === "login" && (
          <div className="flex justify-center items-center min-h-[70vh] animate-slide-up">
            <div className="glass-strong rounded-3xl p-8 w-full max-w-md space-y-6 neon-border">
              <div className="text-center space-y-2">
                <div className="text-5xl mb-4">🎛</div>
                <h2 className="text-2xl font-black text-foreground">بوابة البائع</h2>
                <p className="text-muted-foreground text-sm">פורטל הספקים</p>
              </div>

              {loginError && (
                <div className="glass px-4 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm animate-slide-up">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    البريد الإلكتروني / אימייל
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-dark"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    كلمة المرور / סיסמה
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-dark pl-12"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-neon w-full py-3 rounded-xl text-white font-bold text-base disabled:opacity-50"
                >
                  {loginLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner" />
                      جارٍ الدخول...
                    </span>
                  ) : "دخول / כניסה →"}
                </button>
              </form>

              <button
                onClick={() => setView("search")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← العودة للبحث / חזרה לחיפוש
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ لوحة التحكم ═══════════════════ */}
        {view === "dashboard" && user && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-foreground">
                  لوحة التحكم <span className="neon-text-indigo">/ לוח בקרה</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  مرحباً {profile?.name || user.email} / ברוך הבא
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
              >
                خروج / יציאה
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* الملف الشخصي */}
              <div className="glass-strong rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl neon-border bg-indigo-500/10 flex items-center justify-center text-xl">
                    {profile?.type === "dj" ? "🎧" : "🏛"}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">الملف الشخصي</h2>
                    <p className="text-xs text-muted-foreground">פרופיל / {profile?.type === "dj" ? "ديجي" : "مكان"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">الاسم / שם</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-dark"
                      placeholder="اسمك / השם שלך"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">الهاتف / טלפון</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="input-dark"
                      placeholder="+972..."
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">إنستغرام / אינסטגרם</label>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      className="input-dark"
                      placeholder="@username"
                      dir="ltr"
                    />
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="btn-neon w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="spinner" />
                        جارٍ الحفظ...
                      </span>
                    ) : "💾 حفظ / שמור"}
                  </button>
                </div>
              </div>

              {/* تقويم التوفر */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl neon-border bg-purple-500/10 flex items-center justify-center text-xl">
                    📅
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">جدول التوفر</h2>
                    <p className="text-xs text-muted-foreground">לוח זמינות — انقر على يوم للتغيير / לחץ ליום לשינוי</p>
                  </div>
                </div>
                <Calendar
                  availabilityMap={availabilityMap}
                  onDayClick={handleDayClick}
                  loading={calLoading}
                />
                {calLoading && (
                  <div className="flex justify-center py-2">
                    <span className="spinner" />
                  </div>
                )}
                <div className="glass rounded-xl p-4 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">طريقة الاستخدام / איך להשתמש:</p>
                  <p>⬜ فارغ → 🟢 متاح → 🔴 محجوز → ⬜ حذف</p>
                  <p className="text-[10px] opacity-70">ריק ← מחוק ← תפוס ← זמין ← ריק</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* لوحة التحكم بدون تسجيل دخول */}
        {view === "dashboard" && !user && (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-4 animate-slide-up">
              <div className="text-6xl animate-pulse-glow">🔐</div>
              <p className="text-muted-foreground">يجب تسجيل الدخول أولاً / יש להתחבר קודם</p>
              <button
                onClick={() => setView("login")}
                className="btn-neon px-6 py-3 rounded-xl text-white font-semibold"
              >
                دخول / כניסה →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* فوتر */}
      <footer className="mt-16 border-t border-border/30 py-8 text-center">
        <p className="text-muted-foreground/50 text-sm">
          سوا پارتي — معاً نصنع الحفلات / ביחד עושים מסיבות
        </p>
      </footer>
    </div>
  );
}
