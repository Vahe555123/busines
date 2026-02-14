import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const socketUrl = API_BASE.replace(/^http/, "ws");
const POLL_INTERVAL = 2500;

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const paymentId = searchParams.get("paymentId");
  const [status, setStatus] = useState<"waiting" | "succeeded" | "error">("waiting");
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!paymentId) {
      navigate("/profile", { replace: true });
      return;
    }

    let socket: Socket | null = null;
    const token = localStorage.getItem("auth_token");
    if (token) {
      socket = io(socketUrl, {
        path: "/socket.io",
        auth: { userId: user.id, token },
      });
      socket.on("payment_succeeded", () => {
        setStatus("succeeded");
        setTitle("");
      });
    }

    const poll = async () => {
      try {
        const data = await api.purchases.checkPayment(paymentId);
        setTitle(data.title || "");
        if (data.status === "succeeded") {
          setStatus("succeeded");
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    };

    const id = setInterval(async () => {
      const done = await poll();
      if (done) clearInterval(id);
    }, POLL_INTERVAL);
    poll();

    return () => {
      clearInterval(id);
      socket?.disconnect();
    };
  }, [paymentId, user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ParticleBackground />
        <Loader2 className="h-10 w-10 animate-spin text-primary z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 container mx-auto px-4 z-10 relative flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          {status === "waiting" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t("payment.waiting")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("payment.waitingDesc")}
              </p>
            </>
          )}
          {status === "succeeded" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t("payment.success")}</h1>
              {title && <p className="text-muted-foreground mb-6">{title}</p>}
              <Link to="/profile">
                <Button className="bg-gradient-primary text-white gap-2">
                  {t("payment.toProfile")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PaymentReturn;
