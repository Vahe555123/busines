import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api, type PricingItem } from "@/lib/api";
import { getLocalized, getLocalizedArray, type Lang } from "@/lib/localize";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [plans, setPlans] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    api.pricing
      .list(lang)
      .then(setPlans)
      .catch(() => toast.error("Не удалось загрузить тарифы"))
      .finally(() => setLoading(false));
  }, [lang]);

  const handleBuy = async (pricingId: string) => {
    if (!user) {
      toast.info("Войдите, чтобы оформить покупку");
      navigate("/auth");
      return;
    }
    setBuyingId(pricingId);
    try {
      const { confirmationUrl } = await api.purchases.createPayment(pricingId);
      if (confirmationUrl) {
        window.location.href = confirmationUrl;
        return;
      }
      toast.error("Не удалось перейти к оплате");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка оплаты");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("pricing.titleBefore")}<span className="text-gradient">{t("pricing.titleHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const title = getLocalized(plan.title as string | { ru?: string; en?: string; hy?: string }, lang as Lang);
              const description = getLocalized(plan.description as string | { ru?: string; en?: string; hy?: string }, lang as Lang);
              const features = getLocalizedArray(plan.features as string[] | { ru?: string[]; en?: string[]; hy?: string[] } | undefined, lang as Lang);
              return (
                <div
                  key={plan._id}
                  className={`glass-card p-8 rounded-2xl relative transition-all duration-300 hover:transform hover:-translate-y-2 ${
                    plan.isPopular ? "border-primary/50 bg-primary/5" : "hover:bg-white/5"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-white text-sm font-bold px-4 py-1 rounded-full">
                      {t("pricing.popular")}
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground mb-6 text-sm">{description}</p>

                  <div className="mb-8">
                    <span className="text-4xl font-bold">₽{Number(plan.price).toLocaleString("ru-RU")}</span>
                    <span className="text-muted-foreground">{t("pricing.perProject")}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-12 ${
                      plan.isPopular ? "bg-gradient-primary text-white border-0" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    onClick={() => handleBuy(plan._id)}
                    disabled={buyingId !== null}
                  >
                    {buyingId === plan._id ? <Loader2 className="h-5 w-5 animate-spin" /> : t("pricing.choosePlan")}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 glass-card p-8 rounded-2xl max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">{t("pricing.custom")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("pricing.customDesc")}
          </p>
          <Link to="/contacts">
            <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5">
              {t("pricing.contactUs")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
