import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Heart, Home, Menu, NotebookText, Plus, Search, X } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ThemeToggle from "./ThemeComponent";

let navLinks = [
  { path: "/", label: "Início", icon: Home },
  { path: "/browse", label: "Explorar", icon: Search },

  // { path: "/requests/new", label: "Solicitações", icon: Heart },
];

const Cadastros = {
  path: "/registers",
  label: "Meus Cadastros",
  icon: NotebookText,
};

const Donate = { path: "/donate", label: "Doar", icon: Plus };

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setLoginModalOpen, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      console.log(user);
      if (!navLinks.find((nav) => nav.label === Cadastros.label)) {
        navLinks.push(Cadastros);
      }
      if (!navLinks.find((nav) => nav.label === Donate.label)) {
        navLinks.push(Donate);
      }
      forceUpdate();
    } else {
      if (navLinks.find((nav) => nav.label === Cadastros.label)) {
        navLinks = [...navLinks.filter((nav) => nav.label !== Cadastros.label)];
      }
      if (navLinks.find((nav) => nav.label === Donate.label)) {
        navLinks = [...navLinks.filter((nav) => nav.label !== Donate.label)];
      }
      forceUpdate();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
          isScrolled ? "glass-effect shadow-sm" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart
              className="h-6 w-6 text-primary animate-fade-in"
              fill="currentColor"
            />
            <span className="font-semibold text-lg text-foreground">
              Share<span className="text-primary">&</span>Help
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-md flex items-center gap-2 transition-all",
                  location.pathname === link.path
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}

            {user ? (
              <Popover>
                <PopoverTrigger>
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt="Usuário"
                    className="h-9 w-9 rounded-full cursor-pointer border border-gray-300"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 flex flex-col gap-2 items-center">
                  <span className="text-sm text-center font-medium">
                    {user.displayName}
                  </span>
                  <div className="border w-full"></div>
                  <ThemeToggle />
                  <Button
                    variant="destructive"
                    className="w-full"
                    size="sm"
                    onClick={signOut}
                  >
                    Sair
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setLoginModalOpen(true)}
              >
                Entrar
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 pt-20 px-6 md:hidden animate-fade-in flex flex-col items-center">
          <nav className="flex flex-col gap-2 w-full max-w-xs">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-3 rounded-md flex items-center gap-3 transition-all",
                  location.pathname === link.path
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-base">{link.label}</span>
              </Link>
            ))}
            {user ? (
              <div className="flex flex-col items-center mt-4">
                <Popover>
                  <PopoverTrigger>
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`}
                      alt="Usuário"
                      className="h-12 w-12 rounded-full cursor-pointer border border-gray-300"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 flex flex-col gap-2 items-center">
                    <span className="text-sm text-center font-medium">
                      {user.displayName}
                    </span>
                    <div className="border w-full"></div>
                    <ThemeToggle />
                    <Button
                      variant="destructive"
                      className="w-full"
                      size="sm"
                      onClick={signOut}
                    >
                      Sair
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-9 mt-4"
                onClick={() => setLoginModalOpen(true)}
              >
                Entrar
              </Button>
            )}
          </nav>
        </div>
      )}

      <main className="flex-1 pt-20 overflow-x-hidden">{children}</main>
    </div>
  );
};

export default Layout;
