import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-card border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-white">NeuralAI</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">{t("footer.services")}</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.aiAuto")}</Link></li>
              <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.chatbots")}</Link></li>
              <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.analytics")}</Link></li>
              <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.mlops")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.about")}</Link></li>
              <li><Link to="/cases" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.cases")}</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.pricing")}</Link></li>
              <li><Link to="/contacts" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.contacts")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">{t("footer.contacts")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Москва, Пресненская наб. 12</li>
              <li>info@neural.ai</li>
              <li>+7 (495) 123-45-67</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 NeuralAI. {t("footer.copyright")}</p>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.privacy")}</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
