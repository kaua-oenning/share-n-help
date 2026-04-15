
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { Category } from "@/lib/data";

interface CategoriesSectionProps {
  categories: Category[];
  isLoaded: boolean;
  counts?: Record<string, number>;
}

export const CategoriesSection = ({ categories, isLoaded, counts }: CategoriesSectionProps) => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Categorias de doação</h2>
            <p className="text-muted-foreground mt-2">
              Navegue pelas categorias ou encontre itens específicos
            </p>
          </div>
          
          <Button asChild variant="ghost" className="gap-1 md:self-end">
            <Link to="/browse">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={counts?.[category.id]}
              className={isLoaded ? "animate-slide-up" : "opacity-0"}
              style={{
                animationDelay: `${categories.indexOf(category) * 100}ms`,
                opacity: isLoaded ? 1 : 0
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
