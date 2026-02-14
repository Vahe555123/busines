import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api, type PurchaseItem } from "@/lib/api";
import { Loader2, ShoppingBag, CheckCircle2, Calendar, Sparkles } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!user) return;
    api.purchases
      .getMy()
      .then(setPurchases)
      .finally(() => setLoading(false));
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ParticleBackground />
        <Loader2 className="h-10 w-10 animate-spin text-primary z-10" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-28 pb-20 container mx-auto px-4 z-10 relative">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">{t("profile.title")}</span>
          </h1>
          <p className="text-muted-foreground mb-8">{user.email}</p>

          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("profile.data")}</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("profile.name")}</dt>
                <dd>{user.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("profile.role")}</dt>
                <dd>{user.role}</dd>
              </div>
            </dl>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </span>
              {t("profile.history")}
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-white/5 border border-white/10">
                <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-70" />
                <p className="text-muted-foreground mb-4">{t("profile.noPurchases")}</p>
                <Link to="/pricing">
                  <span className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                    {t("profile.toPricing")}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((p) => {
                  const isCompleted = p.status === "completed";
                  const isCancelled = p.status === "cancelled";
                  const dateStr = new Date(p.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={p._id}
                      className="group relative rounded-xl p-5 bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-300"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-4 min-w-0">
                          <div
                            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                              isCompleted
                                ? "bg-green-500/20 text-green-400"
                                : isCancelled
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                            <p className="text-2xl font-bold text-primary mt-0.5">
                              ₽{p.price.toLocaleString("ru-RU")}
                            </p>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3.5 w-3.5" />
                              {dateStr}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-green-500/20 text-green-400"
                              : isCancelled
                                ? "bg-muted text-muted-foreground"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {isCompleted ? t("profile.statusPaid") : isCancelled ? t("profile.statusCancelled") : t("profile.statusPending")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;
