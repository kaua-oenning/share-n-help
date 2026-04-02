import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  token: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiClient.post<{
        token?: string;
        user?: { id: string; name: string; email: string };
        message?: string;
      }>("/api/auth/login", { email, password });

      if (!data.token) {
        toast.error(data.message ?? "Erro no login");
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      toast.success("Login efetuado com sucesso!");
      return true;
    } catch {
      toast.error("Erro de conexão");
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiClient.post<{
        token?: string;
        user?: { id: string; name: string; email: string };
        message?: string;
      }>("/api/auth/register", { name, email, password });

      if (!data.token) {
        toast.error(data.message ?? "Erro no cadastro");
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      toast.success("Cadastro efetuado com sucesso!");
      return true;
    } catch {
      toast.error("Erro de conexão");
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.info("Você saiu da conta.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, setUser, token, signIn, signUp, signOut, 
      isLoginModalOpen, setLoginModalOpen 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
