import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Users, Globe, Trophy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("about.titleBefore")}<span className="text-gradient">{t("about.titleHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("about.subtitle")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Users, value: "50+", label: "Экспертов в команде" },
            { icon: Trophy, value: "150+", label: "Успешных проектов" },
            { icon: Globe, value: "10+", label: "Стран присутствия" },
          ].map((stat, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl text-center hover:bg-white/5 transition-colors">
              <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 rounded-3xl mb-20">
          <h2 className="text-3xl font-bold mb-6 text-center">Наша история</h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              NeuralAI была основана в 2019 году командой энтузиастов, объединённых одной идеей — сделать искусственный интеллект доступным для бизнеса любого масштаба.
            </p>
            <p>
              За это время мы реализовали более 150 проектов для компаний из разных отраслей: от стартапов до корпораций из списка Fortune 500.
            </p>
            <p>
              Сегодня NeuralAI — это команда из 50+ экспертов в области ML, NLP, компьютерного зрения и data science, работающих над созданием интеллектуальных решений будущего.
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-3xl font-bold mb-12 text-center">Наши ценности</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Результат", desc: "Фокус на измеримых результатах для бизнеса" },
            { title: "Партнёрство", desc: "Строим долгосрочные отношения с клиентами" },
            { title: "Инновации", desc: "Используем передовые технологии и подходы" },
          ].map((value, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl border-l-4 border-l-primary hover:translate-x-2 transition-transform">
              <h3 className="text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-muted-foreground">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
