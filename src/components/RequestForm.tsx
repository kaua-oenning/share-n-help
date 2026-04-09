import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, User, Phone, Mail, FileText } from "lucide-react";
import { categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/apiClient";
import { formatPhone, isValidPhone } from "@/lib/utils";

export const RequestForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    reason: "",
    items: [] as string[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemCheck = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      items: checked
        ? [...prev.items, id]
        : prev.items.filter((item) => item !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Por favor, informe um telefone para contato");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      toast.error("Telefone inválido. Use o formato (00) 00000-0000");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Por favor, informe sua localização");
      return;
    }
    if (formData.items.length === 0) {
      toast.error("Por favor, selecione pelo menos um tipo de item necessário");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiClient.post<{ success: boolean; message?: string }>(
        "/api/requests",
        formData
      );
      if (!data.success) throw new Error(data.message ?? "Erro ao cadastrar");
      toast.success("Solicitação cadastrada com sucesso!");
      navigate("/browse");
    } catch {
      toast.error("Erro ao cadastrar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="name">
                Nome completo <span className="text-destructive">*</span>
              </Label>
            </div>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite seu nome completo ou da instituição"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="phone">
                  Telefone <span className="text-destructive">*</span>
                </Label>
              </div>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))
                }
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="email">E-mail</Label>
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="location">
                Localização <span className="text-destructive">*</span>
              </Label>
            </div>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Porto Alegre, RS"
              required
            />
            <p className="text-xs text-muted-foreground">
              Informe sua cidade e estado para que doadores próximos possam te
              encontrar.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="reason">
                Motivo da solicitação{" "}
                <span className="text-destructive">*</span>
              </Label>
            </div>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explique brevemente o motivo da sua necessidade"
              className="min-h-[120px]"
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">
              Itens necessários <span className="text-destructive">*</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione os tipos de itens que você está precisando. Você pode
              selecionar mais de um.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={formData.items.includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleItemCheck(category.id, checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={category.id}
                      className="cursor-pointer font-medium"
                    >
                      {category.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4 bg-muted/30 p-4 rounded-lg border border-border/30">
            <h4 className="font-medium">Como funciona?</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary w-5 h-5 text-xs font-medium">
                  1
                </span>
                <span>
                  Cadastre sua solicitação com todos os detalhes necessários.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary w-5 h-5 text-xs font-medium">
                  2
                </span>
                <span>
                  Sua solicitação ficará visível para possíveis doadores.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary w-5 h-5 text-xs font-medium">
                  3
                </span>
                <span>
                  Os doadores entrarão em contato diretamente com você.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary w-5 h-5 text-xs font-medium">
                  4
                </span>
                <span>
                  Você poderá atualizar sua solicitação à medida que receber
                  itens.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-x-4 flex justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Cadastrar solicitação"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RequestForm;
