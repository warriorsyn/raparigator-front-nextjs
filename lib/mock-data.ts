import type { Conversation, Message, ProfessionalAd, Review } from "./types";

export const states = ["SP", "RJ", "MG", "PR", "SC", "RS"];
export const cities = ["Sao Paulo", "Campinas", "Santos", "Rio de Janeiro", "Belo Horizonte", "Curitiba"];
export const categories = ["Feminino", "Masculino", "Trans", "Casais"];

export const ads: ProfessionalAd[] = [
  {
    id: "1",
    slug: "luna-velvet-sao-paulo",
    displayName: "Luna",
    artisticName: "Luna Velvet",
    city: "Sao Paulo",
    state: "SP",
    neighborhood: "Itaim Bibi",
    category: "Feminino",
    shortDescription: "Atendimento discreto com experiencia premium e ambiente reservado.",
    description: "Perfil verificado, atendimento com foco em elegancia, pontualidade e seguranca.",
    startingPrice: 450,
    heightCm: 170,
    ethnicity: "Branca",
    hairColor: "Castanho",
    services: ["Jantar", "Companhia", "Evento social", "Atendimento em hotel"],
    pricingTable: [
      { label: "1 hora", price: 450 },
      { label: "2 horas", price: 800 },
      { label: "Pernoite", price: 1900 },
    ],
    status: "livre",
    adTier: "premium",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.9,
    reviewsCount: 128,
  },
  {
    id: "2",
    slug: "valentina-noir-campinas",
    displayName: "Valentina",
    artisticName: "Valentina Noir",
    city: "Campinas",
    state: "SP",
    neighborhood: "Cambui",
    category: "Feminino",
    shortDescription: "Conversas inteligentes e experiencia acolhedora com alto nivel de discricao.",
    description: "Atendimento personalizado, local elegante e total respeito a privacidade.",
    startingPrice: 380,
    heightCm: 165,
    ethnicity: "Parda",
    hairColor: "Preto",
    services: ["Companhia", "Jantar", "Viagens curtas"],
    pricingTable: [
      { label: "1 hora", price: 380 },
      { label: "2 horas", price: 690 },
      { label: "4 horas", price: 1250 },
    ],
    status: "em_atendimento",
    adTier: "normal",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.8,
    reviewsCount: 92,
  },
  {
    id: "3",
    slug: "alex-rivera-rio",
    displayName: "Alex",
    artisticName: "Alex Rivera",
    city: "Rio de Janeiro",
    state: "RJ",
    neighborhood: "Ipanema",
    category: "Masculino",
    shortDescription: "Perfil verificado para eventos e companhia com postura profissional.",
    description: "Atendimento discreto com foco em conforto, conversa e presenca marcante.",
    startingPrice: 420,
    heightCm: 182,
    ethnicity: "Latino",
    hairColor: "Castanho",
    services: ["Eventos", "Companhia", "Acompanhamento corporativo"],
    pricingTable: [
      { label: "1 hora", price: 420 },
      { label: "2 horas", price: 760 },
      { label: "Pernoite", price: 1800 },
    ],
    status: "indisponivel",
    adTier: "premium",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.7,
    reviewsCount: 57,
  },
];

export const reviews: Review[] = [
  { id: "r1", adId: "1", author: "Cliente verificado", score: 5, comment: "Pontual, educada e super discreta.", createdAt: "2026-02-27" },
  { id: "r2", adId: "1", author: "Cliente premium", score: 5, comment: "Experiencia impecavel do inicio ao fim.", createdAt: "2026-02-21" },
  { id: "r3", adId: "2", author: "Cliente verificado", score: 4, comment: "Excelente conversa e atendimento cordial.", createdAt: "2026-02-25" },
];

export const conversations: Conversation[] = [
  { id: "c1", contactName: "Luna Velvet", contactStatus: "Online", lastMessage: "Posso te receber as 21h.", lastMessageAt: "16:20", unread: 1 },
  { id: "c2", contactName: "Valentina Noir", contactStatus: "Visto ha 5 min", lastMessage: "Confirmei seu agendamento.", lastMessageAt: "15:02", unread: 0 },
  { id: "c3", contactName: "Suporte Sigillus", contactStatus: "Online", lastMessage: "Seu pagamento esta em custodia.", lastMessageAt: "13:11", unread: 0 },
];

export const messages: Message[] = [
  { id: "m1", conversationId: "c1", from: "other", content: "Oi, vi seu pedido para hoje.", sentAt: "16:00" },
  { id: "m2", conversationId: "c1", from: "me", content: "Perfeito, consegue as 21h?", sentAt: "16:05" },
  { id: "m3", conversationId: "c1", from: "other", content: "Consigo sim. Local discreto e seguro.", sentAt: "16:08" },
  { id: "m4", conversationId: "c1", from: "me", content: "Fechado. Vou finalizar no app.", sentAt: "16:11" },
  { id: "m5", conversationId: "c1", from: "other", content: "Posso te receber as 21h.", sentAt: "16:20" },
];

export const serviceTracking = {
  status: "Em deslocamento",
  estimatedArrival: "18 min",
  checkInCode: "SIG-9412",
  elapsed: "00:42:18",
};

export const dashboardSummary = {
  monthRevenue: 28450,
  completedServices: 46,
  activeAd: true,
  profileViews: 1290,
  conversionRate: 18.2,
};
