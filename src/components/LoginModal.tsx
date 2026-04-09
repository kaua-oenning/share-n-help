import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "./AuthContext";

export const LoginModal = () => {
  const { isLoginModalOpen, setLoginModalOpen, signIn, signUp } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let success = false;
    if (isRegistering) {
      success = await signUp(name, email, password);
    } else {
      success = await signIn(email, password);
    }

    setLoading(false);
    if (success) {
      setLoginModalOpen(false);
      setEmail("");
      setPassword("");
      setName("");
      setError("");
    } else {
      setError(
        isRegistering
          ? "Erro ao criar conta. Verifique os dados e tente novamente."
          : "E-mail ou senha incorretos."
      );
    }
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={setLoginModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRegistering ? "Criar conta" : "Entrar"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : (isRegistering ? "Cadastrar" : "Entrar")}
          </Button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
            >
              {isRegistering
                ? "Já tem uma conta? Entre aqui."
                : "Não tem uma conta? Cadastre-se."}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
