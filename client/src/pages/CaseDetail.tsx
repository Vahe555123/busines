import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { api, type CaseDetail as CaseDetailType } from "@/lib/api";
import { getLocalized, type Lang } from "@/lib/localize";
import { toast } from "sonner";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [caseItem, setCaseItem] = useState<CaseDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.cases
      .get(id)
      .then(setCaseItem)
      .catch(() => toast.error("Кейс не найден"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !caseItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ParticleBackground />
        <Loader2 className="h-10 w-10 animate-spin text-primary z-10" />
      </div>
    );
  }

  const title = getLocalized(
    caseItem.title as string | { ru?: string; en?: string; hy?: string },
    lang as Lang
  );
  const content = getLocalized(
    caseItem.content as string | { ru?: string; en?: string; hy?: string },
    lang as Lang
  );
  const shortDescription = getLocalized(
    caseItem.shortDescription as string | { ru?: string; en?: string; hy?: string },
    lang as Lang
  );
  const category = getLocalized(
    caseItem.category as string | { ru?: string; en?: string; hy?: string },
    lang as Lang
  );
  const imageUrl = caseItem.imageUrl ?? "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <article className="pt-28 pb-20 container mx-auto px-4 z-10 relative">
        <Link
          to="/cases"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Назад к кейсам
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-sm text-primary font-medium">{category}</span>
              <h1 className="text-3xl md:text-4xl font-bold mt-2">{title}</h1>
              <p className="text-muted-foreground mt-2">{shortDescription}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 md:p-10 prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{content}</div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default CaseDetail;
