import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { DonationForm } from "./components/DonationForm";
import { RequestForm } from "./components/RequestForm";
import { ItemDetail } from "./components/ItemDetail";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { DonationItem } from "./components/DonationItem";
import { DonationItemSkeleton } from "./components/DonationItemSkeleton";
import { X } from "lucide-react";
import { LoginModal } from "./components/LoginModal";
import { ProfilePage } from "./components/ProfilePage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, DonationItem as DonationItemType } from "@/lib/data";
import { apiClient } from "@/lib/apiClient";

const RegistersPage = () => {
  const [activeItems, setActiveItems] = useState<DonationItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchDonationItems = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<DonationItemType[]>("/api/bens/meus");
        setActiveItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonationItems();
  }, [user]);

  const available = activeItems.filter((i) => i.status !== "donated");
  const donated = activeItems.filter((i) => i.status === "donated");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Suas doações cadastradas</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <DonationItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="available">
            <TabsList>
              <TabsTrigger value="available">
                Disponíveis ({available.length})
              </TabsTrigger>
              <TabsTrigger value="donated">
                Doados ({donated.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="available" className="mt-6">
              {available.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {available.map((item) => (
                    <DonationItem key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">Nenhum item disponível.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="donated" className="mt-6">
              {donated.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donated.map((item) => (
                    <DonationItem key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">Nenhum item doado ainda.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

const BrowsePage = () => {
  const [activeItems, setActiveItems] = useState<DonationItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const data = await apiClient.get<{
        items: DonationItemType[];
        hasMore: boolean;
      }>(`/api/bens?status=available&page=${pageNum}&limit=12`);

      setActiveItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore);
    } catch (_err) {
      console.error(_err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
    fetchPage(1, true);
  }, []);

  useEffect(() => {
    if (!observerRef.current || !hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, page]);

  const filteredItems = selectedCategory
    ? activeItems.filter((item) => item.categoryId === selectedCategory)
    : activeItems;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Mobile chips */}
        <div className="md:hidden mb-6 overflow-x-auto">
          <div className="flex gap-2 flex-nowrap pb-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
                !selectedCategory
                  ? "bg-accent text-foreground font-medium border-accent"
                  : "border-border text-muted-foreground hover:bg-accent/50"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? "bg-accent text-foreground font-medium border-accent"
                    : "border-border text-muted-foreground hover:bg-accent/50"
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-64 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Categorias</h3>
              <div className="space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    !selectedCategory
                      ? "bg-accent text-foreground font-medium"
                      : "hover:bg-accent/50 text-muted-foreground"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas as categorias
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === cat.id
                        ? "bg-accent text-foreground font-medium"
                        : "hover:bg-accent/50 text-muted-foreground"
                    }`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {selectedCategory
                ? `${categories.find((c) => c.id === selectedCategory)?.name ?? "Itens"} disponíveis`
                : "Todos os itens disponíveis"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item encontrado" : "itens encontrados"}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DonationItemSkeleton key={i} />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <DonationItem key={item.id} item={item} />
                  ))}
                </div>
                {hasMore && (
                  <div ref={observerRef} className="flex justify-center py-8">
                    {isLoadingMore && (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    )}
                  </div>
                )}
              </>
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

const EditDonatePage = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<DonationItemType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const data = await apiClient.get<DonationItemType>(`/api/bens/${id}`);
        setItem(data);
      } catch {
        // handled by loading state
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-10 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <p className="text-muted-foreground">Item não encontrado.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Editar doação</h1>
        <p className="text-muted-foreground mb-8">
          Atualize os detalhes do item.
        </p>
        <DonationForm editingId={id} initialData={item} />
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
          <Route path="/donate/:id" element={<EditDonatePage />} />
          <Route path="/requests/new" element={<RequestPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/registers" element={<RegistersPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
