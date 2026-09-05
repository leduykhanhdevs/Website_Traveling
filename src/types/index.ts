export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  bestTime: string;
  rating: number;
  tag: string;
  image: string;
  description: string;
  highlights: string[];
  lat: number;
  lng: number;
  avgBudgetPerDay: string;
  currency: string;
}

export interface FeaturePillar {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  icon: string;
  capabilities: string[];
  stat: string;
  statLabel: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted: boolean;
  features: {
    title: string;
    included: boolean;
    pill?: string;
  }[];
  cta: string;
}

export interface TravelerStory {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  location: string;
  rating: number;
  comment: string;
  trip: string;
  badge: string;
}

export interface CityCoordinate {
  name: string;
  lat: number;
  lng: number;
  country: string;
}
