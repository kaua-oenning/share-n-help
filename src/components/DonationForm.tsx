import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, MapPin, Clock, Calendar, Check } from "lucide-react";
import { categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "./AuthContext";
import { apiClient } from "@/lib/apiClient";

export const DonationForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();

  async function salvarBem(bem: typeof formData): Promise<string> {
    const data = await apiClient.post<{ success: boolean; id: string; message?: string }>(
      "/api/bens/salvar",
      bem
    );
    if (!data.success) throw new Error(data.message ?? "Erro ao salvar");
    return data.id;
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    condition: "good",
    location: "",
    pickupDates: "",
    pickupTimes: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    status: "available",
    imageUrl: "",
    interestsNumber: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData((prev) => ({ ...prev, imageUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Por favor, adicione um título para o item");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Por favor, selecione uma categoria");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Por favor, informe o local de retirada");
      return;
    }
    if (!formData.contactEmail.trim() && !formData.contactPhone.trim()) {
      toast.error("Por favor, informe ou um telefone ou um email para contato");
      return;
    }

    setIsSubmitting(true);
    try {
      await salvarBem(formData);
      toast.success("Bem cadastrado com sucesso!");
      navigate("/browse");
    } catch {
      toast.error("Erro ao cadastrar doação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título do item <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Sofá de 3 lugares em bom estado"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o item em detalhes, incluindo medidas, cor, marca, etc."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("categoryId", value)
                }
                value={formData.categoryId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Estado do item <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.condition}
                onValueChange={(value) =>
                  handleSelectChange("condition", value)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="excellent" />
                  <Label htmlFor="excellent" className="cursor-pointer">
                    Ótimo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good" />
                  <Label htmlFor="good" className="cursor-pointer">
                    Bom
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="fair" />
                  <Label htmlFor="fair" className="cursor-pointer">
                    Regular
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagem do item</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-lg p-6 hover:border-primary/30 transition-colors">
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto max-h-[200px] rounded-md object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 mx-auto"
                    onClick={() => setImagePreview(null)}
                  >
                    Remover imagem
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <div className="text-sm font-medium">
                    Arraste uma imagem ou clique para fazer upload
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG ou JPEG (máx. 5MB)
                  </p>
                  <Input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    Selecionar imagem
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="location">
                Local de retirada <span className="text-destructive">*</span>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="pickupDates">
                  Dias disponíveis <span className="text-destructive">*</span>
                </Label>
              </div>
              <Input
                id="pickupDates"
                name="pickupDates"
                value={formData.pickupDates}
                onChange={handleChange}
                placeholder="Ex: Segunda a Sexta"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="pickupTimes">
                  Horários <span className="text-destructive">*</span>
                </Label>
              </div>
              <Input
                id="pickupTimes"
                name="pickupTimes"
                value={formData.pickupTimes}
                onChange={handleChange}
                placeholder="Ex: 18h às 20h"
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Informações de contato</h3>
            <p className="text-sm text-muted-foreground">
              Pelo menos um método de contato é necessário para que os
              interessados possam falar com você.
            </p>

            <div className="space-y-2">
              <Label htmlFor="contactName">Nome para contato</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Seu nome ou de quem está disponibilizando o item"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefone para contato</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">E-mail para contato</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 space-x-4 flex justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Cadastrar doação"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DonationForm;
