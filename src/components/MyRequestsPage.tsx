import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { NeedRequest, categories } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2 } from "lucide-react";
import { Layout } from "./Layout";
import { DonationItemSkeleton } from "./DonationItemSkeleton";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export const MyRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      try {
        const data = await apiClient.get<NeedRequest[]>("/api/requests/minhas");
        setRequests(data);
      } catch {
        // handled by empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const deleteRequest = async (id: string) => {
    try {
      await apiClient.delete("/api/requests/" + id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Solicitação excluída.");
    } catch {
      toast.error("Erro ao excluir solicitação.");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Minhas Solicitações</h1>
        <p className="text-muted-foreground mb-8">
          Gerencie suas solicitações de doação
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <DonationItemSkeleton key={i} />
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-lg border border-border/30 bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{req.name}</h3>
                  <Badge variant={req.status === "active" ? "default" : "secondary"}>
                    {req.status === "active" ? "Ativa" : req.status === "fulfilled" ? "Atendida" : "Expirada"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {req.location}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {req.reason}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {req.items.map((catId) => {
                    const cat = categories.find((c) => c.id === catId);
                    return cat ? (
                      <Badge key={catId} variant="secondary" className="text-xs">
                        {cat.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  Criada em {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteRequest(req.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">Você ainda não fez nenhuma solicitação.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
