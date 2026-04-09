import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationItem } from "@/components/DonationItem";
import { DonationItemSkeleton } from "@/components/DonationItemSkeleton";
import { DonationItem as DonationItemType } from "@/lib/data";

interface FeaturedItemsSectionProps {
  items: DonationItemType[];
  isLoaded: boolean;
  isLoading: boolean;
}

export const FeaturedItemsSection = ({
  items,
  isLoaded,
  isLoading,
}: FeaturedItemsSectionProps) => {
  if (items.length === 0 && !isLoading) return null;
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Itens disponíveis</h2>
            <p className="text-muted-foreground mt-2">
              Alguns dos itens recentemente disponibilizados para doação
            </p>
          </div>

          <Button asChild variant="ghost" className="gap-1 md:self-end">
            <Link to="/browse">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <DonationItemSkeleton key={i} />
              ))
            : items.map((item) => (
                <DonationItem
                  key={item.id}
                  item={item}
                  className={isLoaded ? "animate-slide-up" : "opacity-0"}
                  style={{
                    animationDelay: `${items.indexOf(item) * 100}ms`,
                    opacity: isLoaded ? 1 : 0,
                  }}
                />
              ))}
        </div>
      </div>
    </section>
  );
};
