import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Globe, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { Lang } from "@/lib/translations";

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "hy", label: "Հայերեն" },
];

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const links: { nameKey: string; path: string }[] = [
    { nameKey: "nav.home", path: "/" },
    { nameKey: "nav.services", path: "/services" },
    { nameKey: "nav.pricing", path: "/pricing" },
    { nameKey: "nav.cases", path: "/cases" },
    { nameKey: "nav.about", path: "/about" },
    { nameKey: "nav.faq", path: "/faq" },
    { nameKey: "nav.contacts", path: "/contacts" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            NeuralAI
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.path) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t(link.nameKey)}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 border border-white/10 rounded-xl px-3 py-2 h-9"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {LANG_OPTIONS.find((o) => o.value === lang)?.label ?? lang.toUpperCase()}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border-white/10 bg-background/95 backdrop-blur-xl shadow-xl p-1"
            >
              {LANG_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setLang(option.value)}
                  className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer focus:bg-white/10 focus:text-foreground"
                >
                  {lang === option.value ? (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <span className={lang === option.value ? "font-medium text-primary" : "text-muted-foreground"}>
                    {option.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  {t("nav.profile")}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-foreground">
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {t("nav.login")}
              </Button>
            </Link>
          )}
          <Link to="/contacts">
            <Button className="bg-gradient-primary hover:opacity-90 text-white border-0">
              {t("nav.consultation")}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-white/10">
              <div className="flex flex-col gap-8 mt-8">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      isActive(link.path) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t(link.nameKey)}
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-muted-foreground mb-2 px-1">{t("nav.language")}</p>
                  <div className="flex flex-col gap-1">
                    {LANG_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => { setLang(option.value); setIsOpen(false); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                          lang === option.value
                            ? "bg-primary/20 text-primary font-medium"
                            : "text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        {lang === option.value ? <Check className="h-4 w-4 shrink-0" /> : <span className="w-4 shrink-0" />}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full border-white/20">
                        {t("nav.profile")}
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full" onClick={() => { logout(); setIsOpen(false); }}>
                      {t("nav.logout")}
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20">
                      {t("nav.login")}
                    </Button>
                  </Link>
                )}
                <Link to="/contacts" onClick={() => setIsOpen(false)}>
                  <Button className="bg-gradient-primary w-full text-white border-0">
                    {t("nav.consultation")}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
