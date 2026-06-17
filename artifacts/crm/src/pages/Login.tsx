import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { isSupabaseConfigured } from "../lib/supabase";
import { TrendingUp, Eye, EyeOff, Globe } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError(t("auth.requiredField")); return; }
    setLoading(true);
    setError("");
    const { error: err } = await signIn(email, password);
    if (err) setError(t("auth.loginError"));
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative">
      <button
        onClick={() => setLanguage(language === "en" ? "ar" : "en")}
        className="absolute top-4 end-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 text-sm transition-colors"
      >
        <Globe className="w-4 h-4" />
        {language === "en" ? "العربية" : "English"}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t("auth.loginTitle")}</h1>
          <p className="text-blue-300/70 text-sm">{t("auth.loginSubtitle")}</p>
        </div>

        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200 text-sm leading-relaxed">
              ⚠️ {t("errors.noSupabaseConfig")}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="w-full h-11 px-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:bg-white/15 transition-colors text-sm"
                autoComplete="email"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">{t("auth.password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  className="w-full h-11 px-3.5 pe-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:bg-white/15 transition-colors text-sm"
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : t("auth.loginButton")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
