import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

const Contacts = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Заполните обязательные поля");
      return;
    }
    setLoading(true);
    try {
      await api.contactRequests.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      toast.success("Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.");
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("contacts.titleBefore")}<span className="text-gradient">{t("contacts.titleHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("contacts.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="glass-card p-8 rounded-3xl animate-slide-in-right">
            <h2 className="text-2xl font-bold mb-8">{t("contacts.formTitle")}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("contacts.name")} *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("contacts.namePlaceholder")}
                    className="bg-white/5 border-white/10 h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("contacts.company")}</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t("contacts.companyPlaceholder")}
                    className="bg-white/5 border-white/10 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("contacts.email")} *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("contacts.emailPlaceholder")}
                    className="bg-white/5 border-white/10 h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("contacts.phone")}</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("contacts.phonePlaceholder")}
                    className="bg-white/5 border-white/10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("contacts.message")} *</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contacts.messagePlaceholder")}
                  className="bg-white/5 border-white/10 min-h-[150px]"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-primary text-white border-0 h-12 text-lg"
                disabled={loading}
              >
                {loading ? t("common.loading") : t("contacts.submit")} <Send className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </div>

          <div className="space-y-8 animate-fade-in">
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6">{t("contacts.infoTitle")}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <a href="mailto:info@neural.ai" className="text-lg hover:text-primary transition-colors">info@neural.ai</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("contacts.phone")}</div>
                    <a href="tel:+74951234567" className="text-lg hover:text-primary transition-colors">+7 (495) 123-45-67</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("contacts.address")}</div>
                    <div className="text-lg">Москва, Пресненская наб. 12</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-4">{t("contacts.quickTitle")}</h3>
              <p className="text-muted-foreground mb-6">{t("contacts.quickDesc")}</p>
              <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/5 h-12">
                {t("contacts.telegram")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contacts;
