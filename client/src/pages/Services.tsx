import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BarChart3, Cpu, Code2, Eye, BrainCircuit, Database } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Services = () => {
  const { t } = useLanguage();
  const services = [
    {
      icon: <Code2 className="w-8 h-8 text-white" />,
      title: "AI-автоматизация процессов",
      description: "Автоматизация рутинных задач с помощью ИИ",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: <Bot className="w-8 h-8 text-white" />,
      title: "AI-ассистенты и чат-боты",
      description: "Интеллектуальные помощники для вашего бизнеса",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Предиктивная аналитика",
      description: "Прогнозирование на основе данных",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-white" />,
      title: "Обработка естественного языка",
      description: "Анализ текстов и речи",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Eye className="w-8 h-8 text-white" />,
      title: "Компьютерное зрение",
      description: "Распознавание и анализ изображений",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Database className="w-8 h-8 text-white" />,
      title: "Интеграция и MLOps",
      description: "Внедрение AI в существующую инфраструктуру",
      color: "from-violet-500 to-purple-500"
    }
  ];

  const steps = [
    { step: "01", titleKey: "services.step1", descKey: "services.step1Desc" },
    { step: "02", titleKey: "services.step2", descKey: "services.step2Desc" },
    { step: "03", titleKey: "services.step3", descKey: "services.step3Desc" },
    { step: "04", titleKey: "services.step4", descKey: "services.step4Desc" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("services.titleBefore")}<span className="text-gradient">{t("services.titleHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-muted-foreground mb-6">{service.description}</p>
              <Button variant="link" className="p-0 text-primary hover:text-white group-hover:translate-x-2 transition-transform">
                {t("cases.viewCase")} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-black/20 backdrop-blur-sm z-10 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{t("services.stepsTitle")}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-white/5 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2 text-primary">{t(item.titleKey)}</h3>
                <p className="text-muted-foreground">{t(item.descKey)}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
