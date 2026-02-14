import { useState } from "react";
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
