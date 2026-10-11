export type KitchenId =
  | "duffy"
  | "gelatoni"
  | "stellalou"
  | "shelliemay"
  | "cookieann"
  | "olumel"
  | "linabell";

export type Place = "home" | "out" | "wish";
export type Role = "meat" | "veg" | "soup" | "staple" | "snack" | "drink" | "sweet";
export type Spice = 0 | 1 | 2 | 3;

export interface Dish {
  id: string;
  name: string;
  blurb: string;
  kitchen: KitchenId;
  region: string;
  category: string;
  spice: Spice;
  place: Place;
  role: Role;
  wiki: string;
  query: string;
  shop: string[];
  hasCilantro?: boolean;
  hasZheergen?: boolean;
  extraStaple?: string;
}

export interface Taste {
  spice: Spice;
  cilantro: boolean;
  zheergen: boolean;
}

export interface CartItem {
  key: string;
  dishId: string;
  qty: number;
  spice: Spice;
  cilantro: boolean;
  zheergen: boolean;
  portion: "one" | "two";
  staple: string;
}

export interface Ticket {
  id: string;
  at: number;
  note: string;
  items: CartItem[];
}

export type Tab = "home" | "menu" | "fav" | "ticket";

export interface Idea {
  id: string;
  text: string;
  at: number;
}
