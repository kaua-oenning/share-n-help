import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { NeedRequest, categories } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Layout } from "./Layout";
import { DonationItemSkeleton } from "./DonationItemSkeleton";

export const RequestsPage = () => {
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiClient.get<NeedRequest[]>("/api/requests");
        setRequests(data);
      } catch {
        // handled by empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Solicitações</h1>
        <p className="text-muted-foreground mb-8">
          Pessoas que estão precisando de doações
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
                  <span className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                  </span>
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhuma solicitação no momento.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
