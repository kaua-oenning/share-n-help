import { apiClient } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DonationItem, DonationItemInterest, categories } from "@/lib/data";
import { format, isValid } from "date-fns";
import {
  Calendar,
  Check,
  Clock,
  Info,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { getConditionLabel } from "./DonationItem";

interface ItemDetailProps {
  item: DonationItem;
}

const statusColorMap = {
  available: "bg-green-100 text-green-800 border-green-200",
  reserved: "bg-amber-100 text-amber-800 border-amber-200",
  donated: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusTextMap = {
  available: "Disponível",
  reserved: "Reservado",
  donated: "Doado",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (!isValid(date)) {
    return "Data não disponível";
  }
  return format(date, "dd/MM/yyyy");
};

async function addInterestToItem(itemId: string, interest: DonationItemInterest): Promise<void> {
  const data = await apiClient.post<{ success: boolean; message?: string }>(`/api/bens/${itemId}/interest`, interest);
  if (!data.success) throw new Error(data.message ?? "Erro ao registrar interesse");
}

export const ItemDetail = ({ item }: ItemDetailProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [isDonatedDialogOpen, setIsDonatedDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const category = categories.find((c) => c.id === item.categoryId);
  const navigate = useNavigate();

  const { user } = useAuth();

  const reserveItem = async () => {
    const alreadyExists = item.interests?.some(
      (interest) => interest.email === user?.email || interest.phone === phone || interest.email === email
    );
    if (alreadyExists) {
      toast.error("Já foi demonstrado interesse neste item com este e-mail ou telefone.");
      return;
    }
    const newInterest: DonationItemInterest = { name, phone, email };
    try {
      await addInterestToItem(item.id, newInterest);
      toast.success("Interesse registrado com sucesso!");
      setIsReserveDialogOpen(false);
      navigate("/browse");
    } catch {
      toast.error("Erro ao registrar interesse. Tente novamente.");
    }
  };

  const donateItem = async () => {
    try {
      const data = await apiClient.patch<{ success: boolean; message?: string }>(`/api/bens/${item.id}/status`, { status: "donated" });
      if (!data.success) throw new Error(data.message);
      toast.success("Item marcado como doado!");
      setIsDonatedDialogOpen(false);
      navigate("/browse");
    } catch {
      toast.error("Erro ao marcar item como doado.");
    }
  };

  const isAvailable = item.status === "available";
  const hasInterests = item.interests?.length > 0;
  const isDonated = item.status === "donated";
  const isItemOwner = item.userId && item.userId === user?.id;

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative rounded-lg overflow-hidden border border-border/30">
            {item.imageUrl ? (
              <div
                className={cn(
                  "relative aspect-square",
                  isImageLoaded ? "img-loaded" : "img-loading"
                )}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onLoad={() => setIsImageLoaded(true)}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "relative aspect-square",
                  "font-bold text-center content-center"
                )}
              >
                Sem Imagem
              </div>
            )}

            <div className="absolute top-4 left-4">
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-1 text-sm font-medium",
                  statusColorMap[item.status]
                )}
              >
                {statusTextMap[item.status]}
              </Badge>
            </div>
          </div>

          {!isItemOwner && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações de contato</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.contactName && (
                  <div className="rounded-lg border border-border/50 p-4 bg-card">
                    <div className="font-medium mb-1">Nome</div>
                    <div className="text-muted-foreground">
                      {item.contactName}
                    </div>
                  </div>
                )}

                {item.contactPhone && (
                  <div className="rounded-lg border border-border/50 p-4 bg-card">
                    <div className="font-medium mb-1">Telefone</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{item.contactPhone}</span>
                    </div>
                  </div>
                )}

                {item.contactEmail && (
                  <div className="rounded-lg border border-border/50 p-4 bg-card">
                    <div className="font-medium mb-1">E-mail</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{item.contactEmail}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {category && (
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {category.name}
                </Badge>
              )}
              <Badge variant="outline" className="px-2 py-1 text-xs">
                Estado: {getConditionLabel(item.condition)}
              </Badge>
            </div>

            <h1 className="text-2xl font-semibold">{item.title}</h1>

            <div className="mt-4 space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{item.location}</span>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  {item.pickupDates}, {item.pickupTimes}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Cadastrado em {formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Descrição</h3>
            <div className="text-muted-foreground">{item.description}</div>
          </div>

          {hasInterests && !isItemOwner && (
            <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-teal-800 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-teal-700">
                    {item.interests?.length === 1
                      ? "1 pessoa já demonstrou interesse neste item. "
                      : `${item.interests?.length ?? 0} pessoas já demonstraram interesse neste item. `}
                    Talvez ele fique indisponível em breve.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDonated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Item doado</h4>
                  <p className="text-sm text-blue-700">
                    Este item já foi doado e não está mais disponível.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {isAvailable && (!item.userId || item.userId !== user?.id) && (
              <Button
                className="flex-1"
                onClick={() => setIsReserveDialogOpen(true)}
              >
                Tenho interesse
              </Button>
            )}

            {isItemOwner && !isDonated && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsDonatedDialogOpen(true)}
              >
                Marcar como doado
              </Button>
            )}

            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {isItemOwner && !isDonated && (
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">
            Interessados{" "}
            <span className="bg-teal-100 px-2 py-1 rounded-md text-teal-600">
              {" "}
              {item.interests?.length ?? 0}
            </span>
          </h3>
          {item.interests?.length > 0 &&
            item.interests.map((interest) => (
              <div
                key={interest.email + interest.phone}
                className="mt-6 p-4 bg-card border border-border/50 rounded-lg"
              >
                <h4 className="font-medium">{interest.name}</h4>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {interest.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {interest.email}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Reserve Dialog */}
      <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservar este item</DialogTitle>
            <DialogDescription>
              Preencha seus dados para reservar este item. O doador entrará em
              contato com você.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-mail para contato</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Seu telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsReserveDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={reserveItem}
              disabled={!name.trim() || !phone.trim()}
            >
              Reservar item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Donated Dialog */}
      <Dialog open={isDonatedDialogOpen} onOpenChange={setIsDonatedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como doado</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja marcar este item como doado? Ele não
              aparecerá mais na lista de itens disponíveis.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDonatedDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={donateItem}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default ItemDetail;
