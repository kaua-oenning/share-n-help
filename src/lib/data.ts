export type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type ItemStatus = "available" | "reserved" | "pending_confirmation" | "donated";

export type DonationItem = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  condition: string;
  imageUrl: string;
  location: string;
  pickupDates: string;
  pickupTimes: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  interests?: DonationItemInterest[];
  donatedToInterestId?: string;
  donorConfirmedAt?: string;
  recipientConfirmedAt?: string;
  user?: { id: string; name: string };
};

export type DonationItemInterest = {
  id?: string;
  name: string;
  phone: string;
  email: string
};

export type NeedRequest = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  items: string[];
  reason: string;
  createdAt: string;
  status: "active" | "fulfilled" | "expired";
};

export type Notification = {
  id: string;
  userId: string;
  type: "new_interest" | "donation_confirmed" | "recipient_confirm_request";
  message: string;
  relatedItemId?: string;
  read: boolean;
  createdAt: string;
};

export const categories: Category[] = [
  {
    id: "beds",
    name: "Camas",
    icon: "bed",
    description: "Camas, colchões e itens relacionados ao sono",
  },
  {
    id: "clothing",
    name: "Roupas",
    icon: "shirt",
    description: "Roupas, calçados e acessórios para todas as idades",
  },
  {
    id: "furniture",
    name: "Móveis",
    icon: "sofa",
    description: "Móveis para casa como sofás, mesas, cadeiras",
  },
  {
    id: "kitchen",
    name: "Cozinha",
    icon: "utensils",
    description: "Utensílios, eletrodomésticos e itens para cozinha",
  },
  {
    id: "appliances",
    name: "Eletrodomésticos",
    icon: "tv",
    description: "Eletrodomésticos grandes e pequenos",
  },
  {
    id: "baby",
    name: "Bebê",
    icon: "baby",
    description: "Itens para bebês e crianças pequenas",
  },
  {
    id: "hygiene",
    name: "Higiene",
    icon: "droplets",
    description: "Produtos de higiene pessoal e limpeza",
  },
  {
    id: "food",
    name: "Alimentos",
    icon: "utensils",
    description: "Alimentos não perecíveis",
  },
  {
    id: "other",
    name: "Outros",
    icon: "other",
    description: "Objetos diversificados...",
  },
];

export const mockNeedRequests: NeedRequest[] = [
  {
    id: "1",
    name: "Família Rodrigues",
    phone: "(51) 93333-3333",
    email: "rodrigues@example.com",
    location: "Alvorada, RS",
    items: ["beds", "kitchen", "furniture"],
    reason:
      "Perdemos nossa casa nas enchentes recentes e estamos recomeçando do zero.",
    createdAt: "2023-05-10T09:15:00Z",
    status: "active",
  },
  {
    id: "2",
    name: "Abrigo Esperança",
    phone: "(51) 92222-2222",
    location: "Viamão, RS",
    items: ["clothing", "hygiene", "food"],
    reason: "Abrigo com 30 pessoas desalojadas pelas chuvas.",
    createdAt: "2023-05-12T16:40:00Z",
    status: "active",
  },
];
