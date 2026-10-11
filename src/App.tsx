import { useMemo, useRef, useState, type ReactNode } from "react";
import { FoodPhoto } from "./components/FoodPhoto";
import { FriendPhoto } from "./components/FriendPhoto";
import { MeizhiPhoto, PolaroidStrip } from "./components/MeizhiPhoto";
import { FoodStage, Peek, ScenePeeks } from "./components/Peek";
import { itemLine, shopList, spiceLabel, ticketText } from "./copy";
import { categoriesFor, DISH_MAP, DISHES, todayPicks } from "./data/dishes";
import { KITCHENS, kitchenById } from "./data/kitchens";
import { useKitchenState } from "./state";
import type { CartItem, Dish, KitchenId, Spice, Tab } from "./types";

export default function App() {
  const s = useKitchenState();
  const [tab, setTab] = useState<Tab>("home");
  const [kitchen, setKitchen] = useState<KitchenId | "all">("all");
  const [q, setQ] = useState("");
  const [place, setPlace] = useState<"all" | "home" | "out">("all");
  const [maxSpice, setMaxSpice] = useState<4 | Spice>(4);
  const [detail, setDetail] = useState<Dish | null>(null);
  const [sku, setSku] = useState<Dish | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [zoom, setZoom] = useState<Dish | null>(null);
  const [note, setNote] = useState("");
  const [lastTicket, setLastTicket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const cartBtn = useRef<HTMLDivElement>(null);

  function ping(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 1400);
  }

  const filtered = useMemo(() => {
    return DISHES.filter((d) => {
      if (kitchen !== "all" && d.kitchen !== kitchen) return false;
      if (place !== "all" && d.place !== place && d.place !== "wish") return false;
      if (maxSpice !== 4 && d.spice > maxSpice) return false;
      if (q && !`${d.name}${d.region}${d.blurb}`.includes(q.trim())) return false;
      return true;
    });
  }, [kitchen, place, maxSpice, q]);

  const cats = categoriesFor(filtered);
  const [cat, setCat] = useState<string>("");
  const activeCat = cats.includes(cat) ? cat : cats[0];
  const picks = todayPicks(DISHES);

  function openKitchen(id: KitchenId) {
    s.visit(id);
    setKitchen(id);
    setTab("menu");
  }

  function defaultItem(dish: Dish): Omit<CartItem, "key" | "qty"> {
    return {
      dishId: dish.id,
      spice: Math.min(dish.spice, s.taste.spice) as Spice,
      cilantro: dish.hasCilantro ? s.taste.cilantro : true,
      zheergen: dish.hasZheergen ? s.taste.zheergen : true,
      portion: "one",
      staple: dish.extraStaple ?? "",
    };
  }

  function flyAdd(dish: Dish, from?: HTMLElement | null) {
    const item = { ...defaultItem(dish), qty: 1 };
    s.addCart(item);
    ping(`已点 ${dish.name}`);
    if (!from || !cartBtn.current) return;
    const a = from.getBoundingClientRect();
    const b = cartBtn.current.getBoundingClientRect();
    const img = document.createElement("img");
    img.className = "fly";
    img.src = (from.querySelector("img") as HTMLImageElement | null)?.src ?? "";
    img.style.left = `${a.left}px`;
    img.style.top = `${a.top}px`;
    document.body.appendChild(img);
    requestAnimationFrame(() => {
      img.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(0.3)`;
      img.style.opacity = "0.2";
    });
    setTimeout(() => img.remove(), 560);
  }

  if (!s.seenSplash) {
    return (
      <div className="app">
        <ScenePeeks kitchen="duffy" />
        <div className="splash">
          <div className="splash-hero">
            <Peek id="duffy" pose="hang" talk="美志来吃饭啦" />
            <MeizhiPhoto id="now" className="splash-art" />
            <Peek id="stellalou" pose="sit" talk="贵州也可以点" />
          </div>
          <PolaroidStrip />
          <h1 className="display">美志的达菲厨房</h1>
          <p>
            不在同一个城市也能点。新疆、贵州、全国家常都在里面。点完会变成一张给男朋友下厨的小票。达菲会扒在菜上陪你点。
          </p>
          <button className="primary" onClick={s.dismissSplash}>
            开始点菜
          </button>
          <div className="btn-row" style={{ marginTop: 10 }}>
            <button
              className="ghost"
              style={{ flex: 1 }}
              onClick={() => {
                s.dismissSplash();
                setKitchen("gelatoni");
                setTab("menu");
              }}
            >
              先去新疆
            </button>
            <button
              className="ghost"
              style={{ flex: 1 }}
              onClick={() => {
                s.dismissSplash();
                setKitchen("stellalou");
                setTab("menu");
              }}
            >
              先去贵州
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!detail && !sku && !cartOpen && <ScenePeeks kitchen={kitchen === "all" ? "duffy" : kitchen} />}
      {tab === "home" && (
        <Home
          stamps={s.stamps}
          picks={picks}
          onPick={(d) => setSku(d)}
          onAddAllPicks={() => {
            picks.forEach((d) => s.addCart({ ...defaultItem(d), qty: 1 }));
            ping("今日三道都进购物车啦");
          }}
          onKitchen={openKitchen}
          onMenu={() => setTab("menu")}
          taste={s.taste}
          setTaste={s.setTaste}
        />
      )}
      {tab === "menu" && (
        <Menu
          kitchen={kitchen}
          setKitchen={setKitchen}
          q={q}
          setQ={setQ}
          place={place}
          setPlace={setPlace}
          maxSpice={maxSpice}
          setMaxSpice={setMaxSpice}
          cats={cats}
          activeCat={activeCat}
          setCat={setCat}
          list={filtered}
          cart={s.cart}
          fav={s.fav}
          wish={s.wish}
          onFav={(id) => {
            s.toggleFav(id);
            ping(s.fav.includes(id) ? "取消收藏" : "已收藏");
          }}
          onWish={(id) => {
            s.toggleWish(id);
            ping(s.wish.includes(id) ? "移出心愿" : "已加入心愿");
          }}
          onOpen={setDetail}
          onSku={setSku}
          onAdd={(d, el) => flyAdd(d, el)}
          onQty={s.setQty}
        />
      )}
      {tab === "fav" && (
        <Fav
          fav={s.fav.map((id) => DISH_MAP[id]).filter(Boolean)}
          wish={s.wish.map((id) => DISH_MAP[id]).filter(Boolean)}
          onOpen={setDetail}
          onWish={s.toggleWish}
          onSku={setSku}
          onAdd={(d) => flyAdd(d, null)}
          onUnfav={s.toggleFav}
          onGoMenu={() => setTab("menu")}
          ideas={s.ideas}
          onIdea={s.addIdea}
          onRemoveIdea={s.removeIdea}
        />
      )}
      {tab === "ticket" && (
        <Tickets
          tickets={s.tickets}
          lastId={lastTicket}
          copied={copied}
          onCopy={async (items) => {
            await navigator.clipboard.writeText(ticketText(items, note, s.taste));
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          onReorder={(t) => {
            s.reorder(t);
            setTab("menu");
            setCartOpen(true);
          }}
        />
      )}

      {s.counts.qty > 0 && tab !== "ticket" && (
        <div className="cart-bar" ref={cartBtn}>
          <span>
            已点 {s.counts.qty} · {s.counts.roles.meat}荤 {s.counts.roles.veg}素 {s.counts.roles.soup}汤
          </span>
          <button className="go" onClick={() => setCartOpen(true)}>
            打开购物车
          </button>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {!detail && !sku && !cartOpen && (
        <DuffyMascot kitchen={kitchen === "all" ? "duffy" : kitchen} onTalk={ping} />
      )}

      <nav className="tabs">
        {(
          [
            ["home", "厨房", "⌂"],
            ["menu", "点菜", "☰"],
            ["fav", "收藏", "♡"],
            ["ticket", "小票", "✎"],
          ] as [Tab, string, string][]
        ).map(([id, label, ico]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            <span className="ico">{ico}</span>
            {label}
          </button>
        ))}
      </nav>

      {detail && (
        <Sheet title={detail.name} onClose={() => setDetail(null)}>
          <FoodStage kitchen={detail.kitchen}>
            <FoodPhoto dish={detail} className="hero" onClick={() => setZoom(detail)} />
          </FoodStage>
          <p className="credit">给美志看的菜图 · {detail.region}</p>
          <p>{detail.blurb}</p>
          <div className="meta">
            <span className="tag">{detail.region}</span>
            <span className="tag">{spiceLabel(detail.spice)}</span>
            <span className="tag">{detail.place === "home" ? "能在家做" : detail.place === "out" ? "外出吃" : "心愿"}</span>
          </div>
          <p>采购：{detail.shop.join("、")}</p>
          <div className="actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" }}>
            <button
              className={`act ${s.fav.includes(detail.id) ? "on" : ""}`}
              onClick={() => {
                s.toggleFav(detail.id);
                ping(s.fav.includes(detail.id) ? "取消收藏" : "已收藏");
              }}
            >
              {s.fav.includes(detail.id) ? "取消收藏" : "收藏这道"}
            </button>
            <button
              className={`act ${s.wish.includes(detail.id) ? "on" : ""}`}
              onClick={() => {
                s.toggleWish(detail.id);
                ping(s.wish.includes(detail.id) ? "移出心愿" : "已加入心愿");
              }}
            >
              {s.wish.includes(detail.id) ? "移出心愿" : "以后想吃"}
            </button>
          </div>
          <button
            className="primary"
            onClick={() => {
              setDetail(null);
              setSku(detail);
            }}
          >
            选规格再加入
          </button>
          <button
            className="ghost"
            style={{ width: "100%", marginTop: 8 }}
            onClick={() => {
              flyAdd(detail, null);
              setDetail(null);
            }}
          >
            直接加入购物车
          </button>
        </Sheet>
      )}

      {sku && (
        <SkuSheet
          dish={sku}
          taste={s.taste}
          onClose={() => setSku(null)}
          onAdd={(item) => {
            s.addCart({ ...item, qty: 1 });
            setSku(null);
          }}
        />
      )}

      {cartOpen && (
        <Sheet title="美志的购物车" onClose={() => setCartOpen(false)}>
          <p>
            今晚 {s.counts.roles.meat} 荤 {s.counts.roles.veg} 素 {s.counts.roles.soup} 汤 {s.counts.roles.staple} 主食
          </p>
          {s.cart.length === 0 && <p>{kitchenById(kitchen === "all" ? "duffy" : kitchen).empty}</p>}
          {s.cart.map((item) => {
            const dish = DISH_MAP[item.dishId];
            if (!dish) return null;
            return (
              <div className="row" key={item.key}>
                <FoodStage kitchen={dish.kitchen}>
                  <FoodPhoto dish={dish} className="thumb" />
                </FoodStage>
                <div style={{ flex: 1 }}>
                  <b>{dish.name}</b>
                  <div className="credit">{itemLine(item)}</div>
                </div>
                <div className="qty">
                  <button onClick={() => s.setQty(item.key, item.qty - 1)}>-</button>
                  {item.qty}
                  <button onClick={() => s.setQty(item.key, item.qty + 1)}>+</button>
                </div>
              </div>
            );
          })}
          {s.suggestBalance.length > 0 && (
            <div>
              <p>CookieAnn 检查：这一桌还差点什么</p>
              {s.suggestBalance.map((d) => (
                <button
                  key={d.id}
                  className="chip"
                  onClick={() => s.addCart({ ...defaultItem(d), qty: 1 })}
                >
                  补上{d.name}
                </button>
              ))}
            </div>
          )}
          <textarea className="note" placeholder="给男朋友的话，比如少油、不要葱" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="btn-row" style={{ margin: "12px 0" }}>
            <button className="danger" style={{ flex: 1 }} onClick={s.clearCart}>
              清空购物车
            </button>
            <button className="ghost" style={{ flex: 1 }} onClick={() => setCartOpen(false)}>
              继续点菜
            </button>
          </div>
          <button
            className="primary"
            disabled={s.cart.length === 0}
            onClick={() => {
              const t = s.checkout(note);
              setLastTicket(t.id);
              setCartOpen(false);
              setTab("ticket");
              ping("小票已生成");
            }}
          >
            下单给达菲厨房
          </button>
        </Sheet>
      )}

      {zoom && (
        <div className="lightbox" onClick={() => setZoom(null)}>
          <FoodPhoto dish={zoom} />
        </div>
      )}
    </div>
  );
}

function Sheet({ children, onClose, title }: { children: ReactNode; onClose: () => void; title?: string }) {
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="handle" aria-label="关闭" onClick={onClose} />
        <div className="sheet-head">
          <h2 className="display" style={{ margin: 0, fontSize: 22 }}>
            {title ?? " "}
          </h2>
          <button className="close" onClick={onClose} aria-label="关闭面板">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SkuSheet({
  dish,
  taste,
  onClose,
  onAdd,
}: {
  dish: Dish;
  taste: { spice: Spice; cilantro: boolean; zheergen: boolean };
  onClose: () => void;
  onAdd: (item: Omit<CartItem, "qty" | "key">) => void;
}) {
  const [spice, setSpice] = useState<Spice>(Math.min(dish.spice, taste.spice) as Spice);
  const [cilantro, setCilantro] = useState(dish.hasCilantro ? taste.cilantro : true);
  const [zheergen, setZheergen] = useState(dish.hasZheergen ? taste.zheergen : true);
  const [portion, setPortion] = useState<"one" | "two">("one");
  const [staple, setStaple] = useState(dish.extraStaple ?? "");
  return (
    <Sheet title={dish.name} onClose={onClose}>
      <FoodStage kitchen={dish.kitchen}>
        <FoodPhoto dish={dish} className="hero" />
      </FoodStage>
      <p>辣度</p>
      <div className="opts">
        {([0, 1, 2, 3] as Spice[]).map((n) => (
          <button key={n} className={`chip ${spice === n ? "on" : ""}`} onClick={() => setSpice(n)}>
            {spiceLabel(n)}
          </button>
        ))}
      </div>
      {dish.hasCilantro && (
        <div className="opts">
          <button className={`chip ${cilantro ? "on" : ""}`} onClick={() => setCilantro(true)}>
            要香菜
          </button>
          <button className={`chip ${!cilantro ? "on" : ""}`} onClick={() => setCilantro(false)}>
            不要香菜
          </button>
        </div>
      )}
      {dish.hasZheergen && (
        <div className="opts">
          <button className={`chip ${zheergen ? "on" : ""}`} onClick={() => setZheergen(true)}>
            要折耳根
          </button>
          <button className={`chip ${!zheergen ? "on" : ""}`} onClick={() => setZheergen(false)}>
            关掉折耳根
          </button>
        </div>
      )}
      <div className="opts">
        <button className={`chip ${portion === "one" ? "on" : ""}`} onClick={() => setPortion("one")}>
          美志一份
        </button>
        <button className={`chip ${portion === "two" ? "on" : ""}`} onClick={() => setPortion("two")}>
          两人份
        </button>
      </div>
      {(dish.extraStaple || dish.role === "meat") && (
        <div className="opts">
          {["", dish.extraStaple ?? "米饭", "米饭", "皮带面"].filter((x, i, a) => a.indexOf(x) === i).map((x) => (
            <button key={x || "none"} className={`chip ${staple === x ? "on" : ""}`} onClick={() => setStaple(x)}>
              {x ? `加${x}` : "不加主食"}
            </button>
          ))}
        </div>
      )}
      <button className="primary" onClick={() => onAdd({ dishId: dish.id, spice, cilantro, zheergen, portion, staple })}>
        确认加入购物车
      </button>
      <button className="ghost" style={{ width: "100%", marginTop: 8 }} onClick={onClose}>
        先不点
      </button>
    </Sheet>
  );
}

function Home({
  stamps,
  picks,
  onPick,
  onAddAllPicks,
  onKitchen,
  onMenu,
  taste,
  setTaste,
}: {
  stamps: { kitchens: number; xj: number; gz: number; xjBadge: boolean; gzBadge: boolean };
  picks: Dish[];
  onPick: (d: Dish) => void;
  onAddAllPicks: () => void;
  onKitchen: (id: KitchenId) => void;
  onMenu: () => void;
  taste: { spice: Spice; cilantro: boolean; zheergen: boolean };
  setTaste: (t: { spice: Spice; cilantro: boolean; zheergen: boolean }) => void;
}) {
  return (
    <div className="page">
      <div className="top">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <MeizhiPhoto id="glasses" className="avatar" />
          <div>
            <small>Duffy & Friends · 专属厨房</small>
            <h2 className="display">美志，来吃饭啦</h2>
          </div>
        </div>
        <small>集邮 {stamps.kitchens}/7</small>
      </div>
      <div className="album-card glass">
        <div className="sec-title">美志相册</div>
        <PolaroidStrip compact />
      </div>
      <div className="quick">
        <button className="xj" onClick={() => onKitchen("gelatoni")}>
          <FriendPhoto id="gelatoni" />
          <div>
            <b>进新疆厨房</b>
            <span>Gelatoni · 大盘鸡抓饭</span>
          </div>
        </button>
        <button className="gz" onClick={() => onKitchen("stellalou")}>
          <FriendPhoto id="stellalou" />
          <div>
            <b>进贵州厨房</b>
            <span>StellaLou · 酸汤丝娃娃</span>
          </div>
        </button>
      </div>
      <div className="picks">
        <div className="sec-title">
          LinaBell 今日三道
          <button className="chip on" onClick={onAddAllPicks}>
            一键全加
          </button>
        </div>
        <div className="pick-row">
          {picks.map((d) => (
            <div key={d.id} className="pick">
              <FoodStage kitchen={d.kitchen}>
                <FoodPhoto dish={d} />
              </FoodStage>
              <div className="body">
                <b>{d.name}</b>
                <button className="mini" onClick={() => onPick(d)}>
                  选规格
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="ghost" style={{ width: "100%" }} onClick={onMenu}>
          打开全部菜单
        </button>
      </div>
      <div className="stamp-row">
        <div className="stamp">新疆已点 {stamps.xj}{stamps.xjBadge ? " 贴纸" : ""}</div>
        <div className="stamp">贵州已点 {stamps.gz}{stamps.gzBadge ? " 贴纸" : ""}</div>
      </div>
      <div className="picks">
        <p>美志口味档案</p>
        <div className="opts">
          {([0, 1, 2, 3] as Spice[]).map((n) => (
            <button key={n} className={`chip ${taste.spice === n ? "on" : ""}`} onClick={() => setTaste({ ...taste, spice: n })}>
              默认{spiceLabel(n)}
            </button>
          ))}
          <button className={`chip ${!taste.cilantro ? "on" : ""}`} onClick={() => setTaste({ ...taste, cilantro: !taste.cilantro })}>
            {taste.cilantro ? "香菜开" : "香菜关"}
          </button>
          <button className={`chip ${!taste.zheergen ? "on" : ""}`} onClick={() => setTaste({ ...taste, zheergen: !taste.zheergen })}>
            {taste.zheergen ? "折耳根开" : "折耳根关"}
          </button>
        </div>
      </div>
      <div className="kitchen-grid">
        {KITCHENS.map((k) => (
          <article key={k.id} className={`kitchen-card friend-${k.id}`}>
            <div className="cover-wrap">
              <Peek id="duffy" pose="hang" talk={k.line} />
              <FriendPhoto id={k.id} className="cover" />
              <Peek id={k.id} pose="sit" talk="进来坐" />
            </div>
            <div className="body">
              <b>{k.name}</b>
              <span>{k.job}</span>
              <button className="enter" onClick={() => onKitchen(k.id)}>
                进入厨房
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DuffyMascot({ kitchen, onTalk }: { kitchen: KitchenId; onTalk: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const lines: Record<KitchenId, string> = {
    duffy: "美志点什么，小熊都记下～",
    gelatoni: "新疆画廊开啦，大盘鸡要少辣吗？",
    stellalou: "贵州可以关折耳根哦",
    shelliemay: "红烧肉炖好了叫美志",
    cookieann: "要不要来杯拉丝奶茶",
    olumel: "米线还是汤？我弹琴等你",
    linabell: "今日线索：收藏夹还空着",
  };
  return (
    <button
      className="mascot"
      onClick={() => {
        setOpen(true);
        onTalk(lines[kitchen]);
        window.setTimeout(() => setOpen(false), 2200);
      }}
    >
      {open && <span className="bubble">{lines[kitchen]}</span>}
      <FriendPhoto id={kitchen} />
    </button>
  );
}

function Menu(props: {
  kitchen: KitchenId | "all";
  setKitchen: (k: KitchenId | "all") => void;
  q: string;
  setQ: (v: string) => void;
  place: "all" | "home" | "out";
  setPlace: (v: "all" | "home" | "out") => void;
  maxSpice: 4 | Spice;
  setMaxSpice: (v: 4 | Spice) => void;
  cats: string[];
  activeCat: string;
  setCat: (c: string) => void;
  list: Dish[];
  cart: CartItem[];
  fav: string[];
  wish: string[];
  onFav: (id: string) => void;
  onWish: (id: string) => void;
  onOpen: (d: Dish) => void;
  onSku: (d: Dish) => void;
  onAdd: (d: Dish, el: HTMLElement | null) => void;
  onQty: (key: string, qty: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const grouped = props.cats.map((c) => ({ c, items: props.list.filter((d) => d.category === c) }));

  function jump(c: string) {
    props.setCat(c);
    const el = listRef.current?.querySelector(`[data-cat="${c}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onScroll() {
    const root = listRef.current;
    if (!root) return;
    const tops = grouped
      .map((g) => {
        const el = root.querySelector(`[data-cat="${g.c}"]`) as HTMLElement | null;
        return { c: g.c, top: el ? el.getBoundingClientRect().top : 9999 };
      })
      .filter((x) => x.top < 180);
    const current = tops[tops.length - 1];
    if (current && current.c !== props.activeCat) props.setCat(current.c);
  }

  return (
    <div className="menu-page">
      <div className="search-bar">
        <input value={props.q} placeholder="搜大盘鸡、酸汤、拉皮子、牛肋条" onChange={(e) => props.setQ(e.target.value)} />
        <button className="search-go" onClick={() => props.setQ(props.q.trim())}>
          搜索
        </button>
        {props.q && (
          <button className="ghost" style={{ minHeight: 40, padding: "0 12px" }} onClick={() => props.setQ("")}>
            清空
          </button>
        )}
      </div>
      <div className="filters">
        <button className={`chip ${props.kitchen === "all" ? "on" : ""}`} onClick={() => props.setKitchen("all")}>
          全部厨房
        </button>
        {KITCHENS.map((k) => (
          <button key={k.id} className={`chip ${props.kitchen === k.id ? "on" : ""}`} onClick={() => props.setKitchen(k.id)}>
            {k.friend}
          </button>
        ))}
        <button className={`chip ${props.place === "home" ? "on" : ""}`} onClick={() => props.setPlace(props.place === "home" ? "all" : "home")}>
          能在家做
        </button>
        <button className={`chip ${props.place === "out" ? "on" : ""}`} onClick={() => props.setPlace(props.place === "out" ? "all" : "out")}>
          外出吃
        </button>
        <button className={`chip ${props.maxSpice === 1 ? "on" : ""}`} onClick={() => props.setMaxSpice(props.maxSpice === 1 ? 4 : 1)}>
          少辣及以下
        </button>
      </div>
      <div className="menu-body">
        <div className="cats">
          {props.cats.map((c) => (
            <button key={c} className={props.activeCat === c ? "on" : ""} onClick={() => jump(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="list" ref={listRef} onScroll={onScroll}>
          {grouped.map((g) => (
            <div key={g.c} data-cat={g.c}>
              <h3 style={{ fontSize: 14, margin: "8px 4px" }}>{g.c}</h3>
              {g.items.map((d) => {
                const inCart = props.cart.filter((c) => c.dishId === d.id);
                const qty = inCart.reduce((n, c) => n + c.qty, 0);
                return (
                  <article className="dish" key={d.id}>
                    <FoodStage kitchen={d.kitchen}>
                      <FoodPhoto dish={d} onClick={() => props.onOpen(d)} />
                    </FoodStage>
                    <div>
                      <h3>{d.name}</h3>
                      <p>{d.blurb}</p>
                      <div className="meta">
                        <span className="tag">{d.region}</span>
                        <span className="tag">{spiceLabel(d.spice)}</span>
                        {qty > 0 && <span className="tag">已点 {qty}</span>}
                      </div>
                    </div>
                    <div className="actions">
                      <button className={`act ${props.fav.includes(d.id) ? "on" : ""}`} onClick={() => props.onFav(d.id)}>
                        {props.fav.includes(d.id) ? "已收藏" : "收藏"}
                      </button>
                      <button className={`act ${props.wish.includes(d.id) ? "on" : ""}`} onClick={() => props.onWish(d.id)}>
                        {props.wish.includes(d.id) ? "已想吃" : "以后想吃"}
                      </button>
                      <button className="act" onClick={() => props.onSku(d)}>
                        选规格
                      </button>
                      {qty === 0 ? (
                        <button className="act add" onClick={(e) => props.onAdd(d, e.currentTarget)}>
                          加入
                        </button>
                      ) : (
                        <div className="qty">
                          <button onClick={() => props.onQty(inCart[0].key, inCart[0].qty - 1)}>-</button>
                          {qty}
                          <button onClick={() => props.onAdd(d, null)}>+</button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Fav({
  fav,
  wish,
  onOpen,
  onWish,
  onSku,
  onAdd,
  onUnfav,
  onGoMenu,
  ideas,
  onIdea,
  onRemoveIdea,
}: {
  fav: Dish[];
  wish: Dish[];
  onOpen: (d: Dish) => void;
  onWish: (id: string) => void;
  onSku: (d: Dish) => void;
  onAdd: (d: Dish) => void;
  onUnfav: (id: string) => void;
  onGoMenu: () => void;
  ideas: { id: string; text: string; at: number }[];
  onIdea: (text: string) => void;
  onRemoveIdea: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="page">
      <div className="top">
        <h2 className="display">收藏夹</h2>
        <button className="chip on" onClick={onGoMenu}>
          去点菜
        </button>
      </div>
      {fav.length === 0 && (
        <div className="empty">
          <FriendPhoto id="duffy" />
          <p>还没有收藏。点菜单里的「收藏」就好。</p>
          <button className="primary" onClick={onGoMenu}>
            去菜单收藏
          </button>
        </div>
      )}
      {fav.map((d) => (
        <article className="dish" key={d.id} style={{ padding: "10px 16px" }}>
          <FoodStage kitchen={d.kitchen}>
            <FoodPhoto dish={d} onClick={() => onOpen(d)} />
          </FoodStage>
          <div>
            <h3>{d.name}</h3>
            <p>{d.blurb}</p>
          </div>
          <div className="actions">
            <button className="act" onClick={() => onOpen(d)}>
              详情
            </button>
            <button className="act" onClick={() => onSku(d)}>
              选规格
            </button>
            <button className="act add" onClick={() => onAdd(d)}>
              加入
            </button>
            <button className="act" onClick={() => onUnfav(d.id)}>
              取消收藏
            </button>
          </div>
        </article>
      ))}
      <div className="top">
        <h2 className="display">以后想吃</h2>
      </div>
      {wish.length === 0 && <p style={{ padding: "0 16px", color: "var(--muted)" }}>心愿还是空的，点「以后想吃」记给男朋友。</p>}
      {wish.map((d) => (
        <article className="dish" key={d.id} style={{ padding: "10px 16px" }}>
          <FoodStage kitchen={d.kitchen}>
            <FoodPhoto dish={d} onClick={() => onOpen(d)} />
          </FoodStage>
          <div>
            <h3>{d.name}</h3>
            <p>心愿菜，不一定今晚做</p>
          </div>
          <div className="actions">
            <button className="act add" onClick={() => onAdd(d)}>
              今晚就做
            </button>
            <button className="act" onClick={() => onWish(d.id)}>
              移出心愿
            </button>
          </div>
        </article>
      ))}
      <div className="top">
        <h2 className="display">美志想加的菜</h2>
      </div>
      <div className="idea-card">
        <p style={{ marginTop: 0 }}>没有的菜、拉皮子口味、牛肋条做法，都可以写给男朋友。</p>
        <textarea className="note" value={draft} placeholder="例如：想吃新疆拉皮子少辣，再来一根孜然牛肋条" onChange={(e) => setDraft(e.target.value)} />
        <button
          className="primary"
          style={{ marginTop: 8 }}
          onClick={() => {
            onIdea(draft);
            setDraft("");
          }}
        >
          提交意见
        </button>
      </div>
      {ideas.map((idea) => (
        <div className="idea-card" key={idea.id}>
          <small>{new Date(idea.at).toLocaleString()}</small>
          <p>{idea.text}</p>
          <button className="act" onClick={() => onRemoveIdea(idea.id)}>
            删掉这条
          </button>
        </div>
      ))}
    </div>
  );
}

function Tickets({
  tickets,
  lastId,
  copied,
  onCopy,
  onReorder,
}: {
  tickets: { id: string; at: number; note: string; items: CartItem[] }[];
  lastId: string | null;
  copied: boolean;
  onCopy: (items: CartItem[]) => void;
  onReorder: (t: { id: string; at: number; note: string; items: CartItem[] }) => void;
}) {
  if (tickets.length === 0) {
    return (
      <div className="empty">
        <FriendPhoto id="cookieann" />
        <p>还没有小票。点一桌，CookieAnn 会记下来。</p>
      </div>
    );
  }
  return (
    <div className="page">
      {tickets.map((t) => (
        <div className="ticket" key={t.id} style={t.id === lastId ? { outline: "2px solid #e89a7a" } : undefined}>
          <div className="stickers" aria-hidden="true">
            <span className="sticker s1">想你</span>
            <span className="sticker s2">Duffy</span>
            <span className="sticker s3">好吃</span>
            <span className="sticker s4">美志专属</span>
          </div>
          <Peek id="cookieann" pose="hang" talk="小票记好啦" />
          <div className="ticket-head">
            <MeizhiPhoto id="little" className="stamp-face" />
            <div>
              <b className="display">达菲厨房小票</b>
              <div className="credit">{new Date(t.at).toLocaleString()}</div>
            </div>
            <MeizhiPhoto id="train" className="stamp-face" />
          </div>
          {t.items.map((item) => {
            const dish = DISH_MAP[item.dishId];
            if (!dish) return null;
            return (
              <div className="row" key={item.key}>
                <FoodStage kitchen={dish.kitchen}>
                  <FoodPhoto dish={dish} />
                </FoodStage>
                <div>
                  {itemLine(item)}
                  <div className="credit">给美志看的菜</div>
                </div>
              </div>
            );
          })}
          {t.note && <p>美志说：{t.note}</p>}
          <p>采购清单</p>
          {shopList(t.items).map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div className="btn-row">
            <button className="primary" style={{ flex: 1 }} onClick={() => onCopy(t.items)}>
              {copied ? "已复制" : "复制给男朋友"}
            </button>
            <button className="ghost" style={{ flex: 1 }} onClick={() => onReorder(t)}>
              再来一单
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
