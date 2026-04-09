import { Link } from "react-router-dom";
import { cn, categoryIconMap } from "@/lib/utils";
import { DonationItem as DonationItemType, categories } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface DonationItemProps {
  item: DonationItemType;
  className?: string;
  style?: React.CSSProperties;
}

export function getConditionLabel(condition: string) {
  if (condition == "excellent") return "Ótimo";
  if (condition == "good") return "Bom";
  if (condition == "fair") return "Regular";
}

export const DonationItem = ({ item, className, style }: DonationItemProps) => {
  const isDonated = item.status === "donated";
  const IconComponent = categoryIconMap[item.categoryId] ?? Package;
  const category = categories.find((c) => c.id === item.categoryId);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/30 bg-card",
        "transition-all duration-300 ease-in-out",
        "hover:border-primary/20 hover:shadow-md",
        className
      )}
      style={style}
    >
      <Link to={`/items/${item.id}`}>
        <div className="aspect-w-4 aspect-h-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="relative aspect-square bg-muted flex flex-col items-center justify-center gap-2">
              <IconComponent className="h-12 w-12 text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground/50">
                {category?.name ?? "Sem imagem"}
              </span>
            </div>
          )}{" "}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-lg line-clamp-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="space-x-1">
              <Badge variant="secondary">
                {getConditionLabel(item.condition)}
              </Badge>
              {isDonated && <Badge variant="default">Doado</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">{item.location}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};
