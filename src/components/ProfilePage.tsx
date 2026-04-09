import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { DonationItem as DonationItemType } from "@/lib/data";
import { DonationItem } from "./DonationItem";
import { Badge } from "@/components/ui/badge";
import { Award, Heart, Star, Trophy } from "lucide-react";
import { format } from "date-fns";
import { Layout } from "./Layout";

interface ProfileData {
  id: string;
  name: string;
  createdAt: string;
  totalDonations: number;
  totalCompleted: number;
  badges: string[];
  donations: DonationItemType[];
}

const badgeConfig: Record<string, { label: string; icon: typeof Award; color: string }> = {
  first_donation: { label: "Primeira doação", icon: Heart, color: "bg-pink-100 text-pink-700" },
  active_donor: { label: "Doador ativo", icon: Star, color: "bg-yellow-100 text-yellow-700" },
  frequent_donor: { label: "Doador frequente", icon: Award, color: "bg-blue-100 text-blue-700" },
  veteran: { label: "Veterano", icon: Trophy, color: "bg-purple-100 text-purple-700" },
};

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const data = await apiClient.get<ProfileData>(`/api/users/${id}/profile`);
        setProfile(data);
      } catch {
        // handled by null state
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
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

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <p className="text-muted-foreground">Perfil não encontrado.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center mb-10">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=96`}
            alt={profile.name}
            className="h-24 w-24 rounded-full border-2 border-border mb-4"
          />
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground text-sm">
            Membro desde {format(new Date(profile.createdAt), "dd/MM/yyyy")}
          </p>

          <div className="flex gap-6 mt-4 text-center">
            <div>
              <div className="text-2xl font-bold">{profile.totalDonations}</div>
              <div className="text-xs text-muted-foreground">Doações</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{profile.totalCompleted}</div>
              <div className="text-xs text-muted-foreground">Concluídas</div>
            </div>
          </div>

          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {profile.badges.map((badge) => {
                const config = badgeConfig[badge];
                if (!config) return null;
                const IconComp = config.icon;
                return (
                  <Badge key={badge} variant="outline" className={`${config.color} px-3 py-1 gap-1`}>
                    <IconComp className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {profile.donations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Doações concluídas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.donations.map((item) => (
                <DonationItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
