import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      const messages: Record<string, string> = {
        no_code: "Вход отменён",
        google_not_configured: "Вход через Google не настроен",
        token_failed: "Ошибка авторизации Google",
        no_email: "Google не передал email",
        blocked: "Аккаунт заблокирован",
      };
      toast.error(messages[error] ?? "Ошибка входа");
      navigate("/auth", { replace: true });
      return;
    }

    if (token) {
      login(token);
      toast.success("Вход выполнен");
      navigate("/profile", { replace: true });
    } else {
      navigate("/auth", { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};

export default AuthCallback;
