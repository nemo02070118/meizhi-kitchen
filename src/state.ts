import { useCallback, useEffect, useMemo, useState } from "react";
import { DISH_MAP, DISHES, SOUP_FALLBACK, STAPLE_FALLBACK, VEG_FALLBACK } from "./data/dishes";
import type { CartItem, Idea, KitchenId, Taste, Ticket } from "./types";

const KEY = "meizhi-duffy-kitchen-v1";

const defaultTaste: Taste = { spice: 1, cilantro: false, zheergen: false };

interface Persist {
  taste: Taste;
  cart: CartItem[];
  fav: string[];
  wish: string[];
  tickets: Ticket[];
  kitchens: KitchenId[];
  seenSplash: boolean;
  ideas: Idea[];
}

function load(): Persist {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Persist>;
      return { ...empty(), ...parsed, ideas: parsed.ideas ?? [] };
    }
  } catch {
    /* ignore */
  }
  return empty();
}

function empty(): Persist {
  return {
    taste: defaultTaste,
    cart: [],
    fav: [],
    wish: [],
    tickets: [],
    kitchens: [],
    seenSplash: false,
    ideas: [],
  };
}

export function cartKey(item: Omit<CartItem, "qty" | "key"> & { key?: string }) {
  return [item.dishId, item.spice, item.cilantro, item.zheergen, item.portion, item.staple].join("|");
}

export function useKitchenState() {
  const [data, setData] = useState<Persist>(() => load());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  const visit = useCallback((id: KitchenId) => {
    setData((s) => (s.kitchens.includes(id) ? s : { ...s, kitchens: [...s.kitchens, id] }));
  }, []);

  const addCart = useCallback((item: Omit<CartItem, "key">) => {
    setData((s) => {
      const key = cartKey(item);
      const found = s.cart.find((c) => c.key === key);
      const cart = found
        ? s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + item.qty } : c))
        : [...s.cart, { ...item, key }];
      return { ...s, cart };
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setData((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((c) => c.key !== key) : s.cart.map((c) => (c.key === key ? { ...c, qty } : c)),
    }));
  }, []);

  const clearCart = useCallback(() => setData((s) => ({ ...s, cart: [] })), []);

  const toggleFav = useCallback((id: string) => {
    setData((s) => ({
      ...s,
      fav: s.fav.includes(id) ? s.fav.filter((x) => x !== id) : [...s.fav, id],
    }));
  }, []);

  const toggleWish = useCallback((id: string) => {
    setData((s) => ({
      ...s,
      wish: s.wish.includes(id) ? s.wish.filter((x) => x !== id) : [...s.wish, id],
    }));
  }, []);

  const setTaste = useCallback((taste: Taste) => setData((s) => ({ ...s, taste })), []);

  const checkout = useCallback((note: string) => {
    const ticket: Ticket = {
      id: `t-${Date.now()}`,
      at: Date.now(),
      note,
      items: data.cart,
    };
    setData((s) => ({ ...s, tickets: [ticket, ...s.tickets].slice(0, 20), cart: [] }));
    return ticket;
  }, [data.cart]);

  const reorder = useCallback((ticket: Ticket) => {
    setData((s) => ({ ...s, cart: ticket.items.map((i) => ({ ...i })) }));
  }, []);

  const dismissSplash = useCallback(() => setData((s) => ({ ...s, seenSplash: true })), []);

  const addIdea = useCallback((text: string) => {
    const idea: Idea = { id: `i-${Date.now()}`, text: text.trim(), at: Date.now() };
    if (!idea.text) return;
    setData((s) => ({ ...s, ideas: [idea, ...s.ideas].slice(0, 40) }));
  }, []);

  const removeIdea = useCallback((id: string) => {
    setData((s) => ({ ...s, ideas: s.ideas.filter((x) => x.id !== id) }));
  }, []);

  const counts = useMemo(() => {
    const roles = { meat: 0, veg: 0, soup: 0, staple: 0, other: 0 };
    let qty = 0;
    for (const item of data.cart) {
      qty += item.qty;
      const dish = DISH_MAP[item.dishId];
      if (!dish) continue;
      if (dish.role === "meat") roles.meat += item.qty;
      else if (dish.role === "veg") roles.veg += item.qty;
      else if (dish.role === "soup") roles.soup += item.qty;
      else if (dish.role === "staple") roles.staple += item.qty;
      else roles.other += item.qty;
    }
    return { qty, roles };
  }, [data.cart]);

  const suggestBalance = useMemo(() => {
    const add: typeof DISHES = [];
    if (data.cart.length === 0) return add;
    if (counts.roles.veg === 0) add.push(VEG_FALLBACK[0]);
    if (counts.roles.soup === 0) add.push(SOUP_FALLBACK[0]);
    if (counts.roles.staple === 0) add.push(STAPLE_FALLBACK.find((x) => x.id === "home-mifan") ?? STAPLE_FALLBACK[0]);
    return add.filter(Boolean).slice(0, 2);
  }, [counts.roles, data.cart.length]);

  const stamps = useMemo(() => {
    const ordered = new Set(data.tickets.flatMap((t) => t.items.map((i) => i.dishId)));
    const xj = DISHES.filter((d) => d.kitchen === "gelatoni" && ordered.has(d.id)).length;
    const gz = DISHES.filter((d) => d.kitchen === "stellalou" && ordered.has(d.id)).length;
    return {
      kitchens: data.kitchens.length,
      xj,
      gz,
      xjBadge: xj >= 5,
      gzBadge: gz >= 5,
    };
  }, [data.kitchens, data.tickets]);

  return {
    ...data,
    counts,
    suggestBalance,
    stamps,
    visit,
    addCart,
    setQty,
    clearCart,
    toggleFav,
    toggleWish,
    setTaste,
    checkout,
    reorder,
    dismissSplash,
    addIdea,
    removeIdea,
  };
}

export type KitchenState = ReturnType<typeof useKitchenState>;
