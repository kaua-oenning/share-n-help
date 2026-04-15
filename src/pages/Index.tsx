import { Layout } from "@/components/Layout";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { CTASection } from "@/components/sections/CTASection";
import { FeaturedItemsSection } from "@/components/sections/FeaturedItemsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { categories, DonationItem } from "@/lib/data";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<DonationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setIsLoaded(true);
    const fetchFeaturedItems = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<{ items: DonationItem[] }>(
          "/api/bens?status=available&limit=3"
        );
        setFeaturedItems(data.items);
      } catch (_err) {
        toast("Erro ao carregar os itens.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const data = await apiClient.get<Record<string, number>>("/api/bens/count-by-category");
        setCategoryCounts(data);
      } catch {
        // silent fail
      }
    };

    fetchFeaturedItems();
    fetchCounts();
  }, []);

  return (
    <Layout>
      <HeroSection />
      <CategoriesSection categories={categories} isLoaded={isLoaded} counts={categoryCounts} />
      <FeaturedItemsSection items={featuredItems} isLoaded={isLoaded} isLoading={isLoading} />
      <HowItWorksSection isLoaded={isLoaded} />
      <CTASection />
    </Layout>
  );
};

export default Index;
