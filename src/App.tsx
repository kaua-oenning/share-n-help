import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { DonationForm } from "./components/DonationForm";
import { RequestForm } from "./components/RequestForm";
import { ItemDetail } from "./components/ItemDetail";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { DonationItem } from "./components/DonationItem";
import { X } from "lucide-react";
import { LoginModal } from "./components/LoginModal";
import { categories, DonationItem as DonationItemType } from "@/lib/data";
import { apiClient } from "@/lib/apiClient";

const RegistersPage = () => {
  const [activeItems, setActiveItems] = useState<DonationItemType[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchDonationItems = async () => {
      try {
        const data = await apiClient.get<DonationItemType[]>("/api/bens/meus");
        setActiveItems(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDonationItems();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              Suas doações cadastradas
            </h1>

            {activeItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeItems.map((item) => (
                  <DonationItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Nenhum item cadastrado para doação ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const BrowsePage = () => {
  const [activeItems, setActiveItems] = useState<DonationItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category) setSelectedCategory(category);

    const fetchDonationItems = async () => {
      try {
        const data = await apiClient.get<DonationItemType[]>("/api/bens?status=available");
        setActiveItems(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDonationItems();
  }, []);

  const filteredItems = selectedCategory
    ? activeItems.filter((item) => item.categoryId === selectedCategory)
    : activeItems;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Categorias</h3>
              <div className="space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${!selectedCategory
                    ? "bg-accent text-foreground font-medium"
                    : "hover:bg-accent/50 text-muted-foreground"
                    }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas as categorias
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedCategory === category.id
                      ? "bg-accent text-foreground font-medium"
                      : "hover:bg-accent/50 text-muted-foreground"
                      }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {selectedCategory
                ? `${categories.find((c) => c.id === selectedCategory)?.name ||
                "Itens"
                } disponíveis`
                : "Todos os itens disponíveis"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {filteredItems.length}{" "}
              {filteredItems.length === 1
                ? "item encontrado"
                : "itens encontrados"}
            </p>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <DonationItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Nenhum item disponível nesta categoria no momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ItemDetailPage = () => {
  const [item, setItem] = useState<DonationItemType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) {
      setError("Item não encontrado.");
      setIsLoading(false);
      return;
    }
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<DonationItemType>(`/api/bens/${id}`);
        setItem(data);
      } catch {
        setError("Item não encontrado.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando item...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !item) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <X className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ops!</h2>
              <p className="text-muted-foreground">
                {error || "Item não encontrado"}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <ItemDetail item={item} />
      </div>
    </Layout>
  );
};

const DonatePage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Cadastrar doação</h1>
        <p className="text-muted-foreground mb-8">
          Preencha o formulário abaixo com os detalhes do item que você deseja
          doar.
        </p>

        <DonationForm />
      </div>
    </Layout>
  );
};

const RequestPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Cadastrar solicitação</h1>
        <p className="text-muted-foreground mb-8">
          Preencha o formulário abaixo para cadastrar suas necessidades.
        </p>

        <RequestForm />
      </div>
    </Layout>
  );
};

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LoginModal />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/requests/new" element={<RequestPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/registers" element={<RegistersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
