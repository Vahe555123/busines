import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";

const FAQ = () => {
  const { t } = useLanguage();
  const faqs = [
    {
      category: "Общие вопросы",
      items: [
        { q: "Что такое AI-автоматизация?", a: "Это использование технологий искусственного интеллекта для выполнения повторяющихся задач без участия человека." },
        { q: "Какие задачи можно автоматизировать?", a: "Обработка заявок, ответы на частые вопросы, анализ документов, генерация контента и многое другое." },
        { q: "Как быстро окупаются инвестиции?", a: "В среднем окупаемость проектов составляет от 3 до 6 месяцев за счет сокращения затрат и роста эффективности." }
      ]
    },
    {
      category: "Процесс работы",
      items: [
        { q: "Как проходит процесс внедрения?", a: "Мы начинаем с аудита, затем проектируем решение, разрабатываем, внедряем и проводим обучение сотрудников." },
        { q: "Сколько времени занимает разработка?", a: "От 2 недель для простых ботов до 3-4 месяцев для комплексных систем автоматизации." }
      ]
    },
    {
      category: "Технические вопросы",
      items: [
        { q: "Насколько безопасны решения?", a: "Мы используем современные протоколы шифрования и следуем стандартам безопасности данных." },
        { q: "С какими системами есть интеграция?", a: "Мы интегрируемся с большинством популярных CRM, ERP и мессенджеров через API." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("faq.titleBefore")}<span className="text-gradient">{t("faq.titleHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map((section, idx) => (
            <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <h2 className="text-2xl font-bold mb-6 pl-4 border-l-4 border-primary text-white">
                {section.category}
              </h2>
              <div className="glass-card rounded-2xl p-2 md:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, itemIdx) => (
                    <AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`} className="border-b-white/10 px-4">
                      <AccordionTrigger className="text-left hover:text-primary transition-colors text-lg py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
