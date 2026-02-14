import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BarChart3, Shield, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />

      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm text-gray-300">{t("index.hero.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            {t("index.hero.titlePrefix")}
            <span className="text-gradient">{t("index.hero.titleHighlight")}</span>
            {t("index.hero.titleSuffix")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("index.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/contacts">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white border-0 h-12 px-8 text-lg w-full sm:w-auto">
                {t("index.hero.cta")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/cases">
              <Button size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 h-12 px-8 text-lg w-full sm:w-auto">
                {t("index.hero.cases")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm z-10 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "150+", labelKey: "index.stats.projects" },
              { value: "98%", labelKey: "index.stats.clients" },
              { value: "40%", labelKey: "index.stats.savings" },
              { value: "24/7", labelKey: "index.stats.support" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 z-10 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("index.solutions.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("index.solutions.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Cpu className="w-8 h-8 text-white" />, titleKey: "index.solutions.aiAuto", descKey: "index.solutions.aiAutoDesc" },
              { icon: <Bot className="w-8 h-8 text-white" />, titleKey: "index.solutions.bots", descKey: "index.solutions.botsDesc" },
              { icon: <BarChart3 className="w-8 h-8 text-white" />, titleKey: "index.solutions.analytics", descKey: "index.solutions.analyticsDesc" },
              { icon: <Shield className="w-8 h-8 text-white" />, titleKey: "index.solutions.integration", descKey: "index.solutions.integrationDesc" },
            ].map((service, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{t(service.titleKey)}</h3>
                <p className="text-muted-foreground">{t(service.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 z-10 relative">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 pointer-events-none" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("index.cta.title")}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("index.cta.subtitle")}
            </p>
            <Link to="/contacts">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white border-0 h-12 px-8">
                {t("index.cta.button")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
