import { Layout } from "@/components/Layout";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { CTASection } from "@/components/sections/CTASection";
import { FeaturedItemsSection } from "@/components/sections/FeaturedItemsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { categories, DonationItem } from "@/lib/data";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<DonationItem[]>([]);
  useEffect(() => {
    setIsLoaded(true);
    const fetchFeaturedItems = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/bens?status=available");
        if (!res.ok) throw new Error("Erro");
        const items = await res.json();

        setFeaturedItems(items.slice(0, 3));
      } catch (_err) {
        toast("Erro ao carregar os itens.");
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <Layout>
      <HeroSection />
      <CategoriesSection categories={categories} isLoaded={isLoaded} />
      <FeaturedItemsSection items={featuredItems} isLoaded={isLoaded} />
      <HowItWorksSection isLoaded={isLoaded} />
      <CTASection />
    </Layout>
  );
};

export default Index;
