import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type Tab = "login" | "register" | "verify";

const Auth = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      const messages: Record<string, string> = {
        no_code: "Вход отменён",
        google_not_configured: "Вход через Google не настроен",
        token_failed: "Ошибка авторизации Google",
        no_email: "Google не передал email",
        blocked: "Аккаунт заблокирован",
      };
      toast.error(messages[err] ?? "Ошибка входа");
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

  if (user) {
    navigate("/profile", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await api.login({ email, password });
      login(token);
      toast.success("Вход выполнен");
      navigate("/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register({ email, password, name: name || undefined });
      toast.success("Проверьте почту — отправлен код подтверждения");
      setTab("verify");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await api.verifyEmail({ email, code });
      login(token);
      toast.success("Почта подтверждена");
      navigate("/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-4 z-10 relative">
        <div className="max-w-md mx-auto glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {tab === "login" && t("auth.login")}
            {tab === "register" && t("auth.register")}
            {tab === "verify" && t("auth.verify")}
          </h1>

          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-white/5 border-white/20"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-white/5 border-white/20"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("auth.enter")}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 bg-white/5 hover:bg-white/10"
                onClick={() => (window.location.href = `${API_BASE}/api/auth/google`)}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("auth.google")}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <button type="button" onClick={() => setTab("register")} className="text-primary hover:underline">
                  {t("auth.signUp")}
                </button>
              </p>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="reg-email">{t("auth.email")}</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-white/5 border-white/20"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="reg-password">{t("auth.password")} (6+)</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-white/5 border-white/20"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("auth.registerButton")}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                {t("auth.hasAccount")}{" "}
                <button type="button" onClick={() => setTab("login")} className="text-primary hover:underline">
                  {t("auth.signIn")}
                </button>
              </p>
            </form>
          )}

          {tab === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("auth.codeSent")} {email}</p>
              <div>
                <Label htmlFor="code">{t("auth.code")}</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 bg-white/5 border-white/20"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("auth.verifyButton")}
              </Button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Auth;
