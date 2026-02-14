import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { api, type CaseListItem } from "@/lib/api";
import { getLocalized, type Lang } from "@/lib/localize";
import { toast } from "sonner";

const Cases = () => {
  const { t, lang } = useLanguage();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cases
      .list()
      .then(setCases)
      .catch(() => toast.error("Не удалось загрузить кейсы"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("cases.titleBefore")}<span className="text-gradient">{t("cases.titleHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("cases.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((project) => {
              const title = getLocalized(
                project.title as string | { ru?: string; en?: string; hy?: string },
                lang as Lang
              );
              const shortDescription = getLocalized(
                project.shortDescription as string | { ru?: string; en?: string; hy?: string },
                lang as Lang
              );
              const category = getLocalized(
                project.category as string | { ru?: string; en?: string; hy?: string },
                lang as Lang
              );
              const imageUrl = project.imageUrl ?? "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80";
              return (
                <Link
                  key={project._id}
                  to={`/cases/${project._id}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 animate-fade-in block"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80" />
                    <Badge className="absolute top-4 left-4 bg-primary/20 hover:bg-primary/30 text-primary border-none backdrop-blur-md">
                      {category}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 flex items-center justify-between group-hover:text-primary transition-colors">
                      {title}
                      <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-2">{shortDescription}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Cases;
