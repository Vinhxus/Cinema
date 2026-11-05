import { useEffect, useMemo, useState } from "react";
import Header from "../components/common/Header";
import {
  ArrowRight, Armchair, Check, CheckCircle2, Clock, ConciergeBell, CupSoda,
  GlassWater, Minus, Plus, Sandwich, ShieldCheck, ShoppingBag, Sparkles, Star,
  Store, Tag, Utensils, X,
} from "lucide-react";
import { useBooking } from "../context/useBooking";
import { SeatType } from "../components/seatComponents/Seat";
import { Price } from "../data/Price";
import { Navigate, useNavigate } from "react-router-dom";

const IMG = {
  logo: "/assets/logo.svg",
  profile: "/assets/profile.png",
  poster: "/assets/poster-dune.png",
};

type Category = "popcorn" | "signature" | "snacks" | "beverages";
type Combo = {
  id: string;
  name: string;
  price: number;
  image: string;
  imgClass?: string;
  desc: string;
  summary: string;
  tags: string[];
  category: Category;
  badges: { label: string; className: string }[];
  priceClass?: string;
};

const COMBOS: Combo[] = [
  {
    id: "super-star",
    name: "Super Star Combo",
    price: 115000,
    image: "/assets/combo-1.png",
    desc: "1x Large Sweet Caramel Popcorn (85oz) + 2x Large Soft Drinks (32oz Coke/Sprite) + 1x Pack Crispy M&Ms Chocolate.",
    summary: "85oz Caramel + 2 Large Cokes",
    tags: ["Caramel", "For 2 People", "Free Refill"],
    category: "popcorn",
    badges: [
      { label: "BEST SELLER", className: "bg-red-600 text-white uppercase tracking-[0.5px]" },
      { label: "Save 20%", className: "bg-amber-500 text-[#451a03]" },
    ],
  },
  {
    id: "solo",
    priceClass: "text-gray-900",
    name: "Solo Moviegoer Combo",
    price: 85000,
    image: "/assets/combo-2.png",
    desc: "1x Medium Salted & Cheese Mixed Popcorn (60oz) + 1x Medium Chilled Drink (22oz Coke, Sprite, or Fanta).",
    summary: "60oz Mixed Popcorn + Medium Drink",
    tags: ["Cheese & Salt", "Single Serving"],
    category: "popcorn",
    badges: [{ label: "Solo Pick", className: "bg-gray-800 text-white font-semibold" }],
  },
  {
    id: "golden-vip",
    name: "CineVerse Golden VIP Combo",
    price: 185000,
    image: "/assets/combo-3.png",
    priceClass: "text-amber-600",
    desc: "1x Truffle & Sea Salt Gourmet Popcorn Tub + 2x Premium Bottled Mocktails / Juices + Gourmet Nachos with warm cheddar cheese dip.",
    summary: "Truffle Popcorn + 2 Mocktails + Nachos",
    tags: ["Black Truffle", "Artisan Drinks", "VIP Lounges"],
    category: "signature",
    badges: [
      { label: "Premium Gold", className: "bg-amber-500 text-[#451a03]" },
      { label: "Chef Curated", className: "bg-amber-100 text-[#451a03] font-semibold" },
    ],
  },
  {
    id: "dune-tub",
    name: "Dune: Spice Planet Exclusive Tub",
    price: 210000,
    image: "/assets/combo-4.png",
    imgClass: "left-[1.28%] top-[-8.53%]",
    desc: "Limited Edition Sandworm Souvenir Popcorn Tin + 2x Collectible Character Tumblers with reusable stainless straws.",
    summary: "Sandworm Tin + 2 Tumblers",
    tags: ["Spiced Caramel", "Metal Tin", "Last 14 Sets"],
    category: "signature",
    badges: [
      { label: "Limited Edition", className: "bg-red-600 text-white" },
      { label: "Collectible", className: "bg-amber-500 text-[#451a03] font-semibold" },
    ],
  },
  {
    id: "nachos",
    priceClass: "text-gray-900",
    name: "Crispy Nachos & Cheese Platter",
    price: 75000,
    image: "/assets/combo-5.png",
    desc: "Warm corn tortilla chips, spicy sliced jalapeño peppers, double-portion hot cheddar fondue & zesty salsa dip.",
    summary: "Nachos + Cheddar Fondue + Salsa",
    tags: ["Cheddar Fondue", "Salsa Fresca", "Served Hot"],
    category: "snacks",
    badges: [{ label: "Hot & Crisp", className: "bg-orange-600 text-white" }],
  },
  {
    id: "sausage",
    priceClass: "text-gray-900",
    name: "Sausage Duo & Soda",
    price: 95000,
    image: "/assets/combo-6.png",
    desc: "2x Char-grilled German Bratwurst pork sausages with whole-grain honey mustard + 1x Large Fountain Beverage (32oz).",
    summary: "2 Bratwurst + Large Beverage",
    tags: ["Grilled", "High Protein"],
    category: "snacks",
    badges: [{ label: "Savory Snack", className: "bg-amber-700 text-white font-semibold" }],
  },
];

const CATEGORIES: { key: "all" | Category; label: string; icon: typeof ShoppingBag }[] = [
  { key: "all", label: "All Combos (8)", icon: ShoppingBag },
  { key: "popcorn", label: "Popcorn & Drinks (4)", icon: CupSoda },
  { key: "signature", label: "Signature Combos (2)", icon: Sparkles },
  { key: "snacks", label: "Snacks & Hot Bites (3)", icon: Sandwich },
  { key: "beverages", label: "Beverages Only (3)", icon: GlassWater },
];

const STEPS = [
  { label: "Finish", title: "Select seat(s)" },
  { label: "Step2", title: "Food" },
  { label: "Step3", title: "Checkout" },
  { label: "Step4", title: "Pay" },
  { label: "Step5", title: "Detail" },
];

const VIP_DISCOUNT_RATE = 0.1;
const HOLD_SECONDS = 4 * 60 + 54;

const vnd = (n: number) => `${n.toLocaleString("en-US")} ₫`;

/* ------------------------------ Steps ------------------------------ */
function Stepper() {
  const current = 1; // index của bước đang active (Food)
  return (
    <div className="flex justify-center px-8 pb-4 pt-6">
      <div className="relative flex w-[760px] items-center justify-between">
        <div className="absolute left-8 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" />
        <div className="absolute left-8 top-1/2 h-0.5 w-[320px] -translate-y-1/2 bg-red-600" />
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={s.label} className="relative flex items-center gap-2.5 rounded-lg px-2">
              {done ? (
                <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 shadow-sm">
                  <Check size={16} className="text-white" />
                </span>
              ) : active ? (
                <span className="flex size-9 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white ring-4 ring-red-100 shadow-md">
                  {i + 1}
                </span>
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-400">
                  {i + 1}
                </span>
              )}
              <div className="flex flex-col">
                <span
                  className={`text-xs leading-4 ${
                    active ? "font-bold tracking-[-0.3px] text-red-600" : done ? "font-medium text-slate-500" : "font-medium text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`text-sm leading-[17.5px] ${
                    active ? "font-bold text-slate-900" : done ? "font-semibold text-slate-800" : "font-medium text-slate-400"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Combo card ------------------------------ */
function ComboCard({ combo, qty, onChange }: { combo: Combo; qty: number; onChange: (q: number) => void }) {
  return (
    <div className="relative flex min-h-[363px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-[17px]">
      <div className="flex flex-col gap-1">
        <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={combo.image}
            alt={combo.name}
            className={`absolute left-0 top-[-12.33%] h-[124.65%] w-full max-w-none object-cover ${combo.imgClass ?? ""}`}
          />
        </div>
        <div className="flex items-start justify-between pt-[7.75px] text-sm">
          <h3 className="font-bold text-gray-900">{combo.name}</h3>
          <span className={`font-extrabold leading-5 ${combo.priceClass ?? "text-red-600"}`}>
            {vnd(combo.price)}
          </span>
        </div>
        <p className="text-xs leading-[19.5px] text-gray-500">{combo.desc}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {combo.tags.map((t) => (
            <span key={t} className="rounded bg-[#eff4ff] px-2 py-0.5 text-[10px] font-medium leading-[15px] text-gray-600">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between border-t border-slate-100 pt-[13px]">
          <span className="text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-gray-400">Order Quantity</span>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-[#f8f9ff] p-[5px]">
            <button
              type="button"
              aria-label={`Decrease ${combo.name}`}
              disabled={qty === 0}
              onClick={() => onChange(Math.max(0, qty - 1))}
              className="flex size-7 items-center justify-center rounded bg-white text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300 cursor-pointer"
            >
              <Minus size={10} />
            </button>
            <span className={`w-6 text-center text-sm font-bold ${qty > 0 ? "text-gray-900" : "text-gray-400"}`}>{qty}</span>
            <button
              type="button"
              aria-label={`Increase ${combo.name}`}
              onClick={() => onChange(qty + 1)}
              className={`flex size-7 items-center justify-center rounded ${qty > 0 ? "bg-amber-500 text-[#451a03]" : "bg-white text-gray-900"} cursor-pointer`}
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute left-3 top-3 flex gap-1.5">
        {combo.badges.map((b) => (
          <span key={b.label} className={`rounded px-2 py-0.5 text-[10px] font-bold leading-[15px] ${b.className}`}>
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Page ------------------------------ */
export default function FoodPage() {
  const { selectedSeats, seatsTotal } = useBooking();
  const [category, setCategory] = useState<"all" | Category>("all");
  const [qty, setQty] = useState<Record<string, number>>({ "super-star": 1 });
  const [seconds, setSeconds] = useState(HOLD_SECONDS);
  const navigate = useNavigate();
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const visible = category === "all" ? COMBOS : COMBOS.filter((c) => c.category === category);
  const selected = COMBOS.filter((c) => (qty[c.id] ?? 0) > 0);
  // Gom ghế theo loại để hiển thị: "G11, G12 (standard)  110.000 × 2"
  const seatGroups = useMemo(() => {
    const map = new Map<SeatType, string[]>();
    selectedSeats.forEach((s) => map.set(s.type, [...(map.get(s.type) ?? []), s.label]));
    return Array.from(map, ([type, labels]) => ({ type, labels }));
  }, [selectedSeats]);

  const totals = useMemo(() => {
    const fb = selected.reduce((sum, c) => sum + c.price * (qty[c.id] ?? 0), 0);
    const discount = Math.round(fb * VIP_DISCOUNT_RATE);
    const total = seatsTotal + fb - discount;
    return { seats: seatsTotal, fb, discount, total, points: Math.floor(total / 10000) };
  }, [selected, qty, seatsTotal]);

  const setQuantity = (id: string, q: number) => setQty((prev) => ({ ...prev, [id]: q }));
  const itemCount = selected.reduce((n, c) => n + (qty[c.id] ?? 0), 0);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  if (selectedSeats.length === 0) {
    window.alert("Please select at least one seat before continuing.");
    return <Navigate to="/select-seat" replace />;
  }
  return (
    <div className="font-['Outfit',sans-serif]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col bg-[#f8f9ff]">
        <Header />
        <Stepper />

        {/* Category filter */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-[7px]">
            {CATEGORIES.map(({ key, label, icon: Icon }) => {
              const active = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`cursor-pointer flex items-center gap-2 rounded-lg px-4 py-2 text-xs leading-4 ${
                    active ? "bg-amber-500 font-bold text-[#451a03] shadow-sm" : "font-semibold text-gray-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex items-start gap-8 px-8 pb-8">
          {/* LEFT */}
          <section className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold leading-7 text-gray-900">Popular Cinema Combos &amp; Snacks</h2>
                <p className="text-xs leading-4 text-gray-500">
                  Pair your movie with freshly popped corn, savory appetizers, and chilled beverages.
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#eff4ff] px-[13px] py-[7px]">
                <Store size={13} className="text-amber-600" />
                <span className="text-xs font-medium leading-4 text-gray-700">Pickup at Counter #3 (VIP Lane)</span>
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-gray-500">
                No items in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {visible.map((c) => (
                  <ComboCard key={c.id} combo={c} qty={qty[c.id] ?? 0} onChange={(q) => setQuantity(c.id, q)} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#eff4ff] p-[17px]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
                <ConciergeBell size={17} className="text-white" />
              </span>
              <div>
                <h4 className="text-xs font-bold leading-4 text-gray-900">Express Self-Pickup Guarantee</h4>
                <p className="pt-0.5 text-[11px] leading-[16.5px] text-gray-600">
                  Skip the snack queue! Scan your QR confirmation code directly at the CineVerse Fast-Track Counter 10
                  minutes prior to movie screening.
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT (sticky) */}
          <aside className="sticky top-4 flex w-[360px] shrink-0 flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-[21px] drop-shadow-sm">
              {/* Timer */}
              <div className="flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50 p-[17px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-red-600" />
                    </span>
                    <span className="text-xs font-extrabold uppercase leading-4 tracking-[0.3px] text-red-700">Seats held for</span>
                  </div>
                  <span className="font-mono text-xl font-bold tracking-[1px] text-red-600">
                    {mm}:{ss}
                  </span>
                </div>
                <p className="text-[11px] leading-[13.75px] text-red-700">
                  Your sweet spot seats will be automatically released if checkout is not completed in time.
                </p>
              </div>

              {/* Movie mini card */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#eff4ff] p-[13px]">
                <img src={IMG.poster} alt="" className="aspect-[3/4] h-[75px] shrink-0 rounded-lg bg-gray-200 object-cover" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 pb-0.5">
                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold leading-[13.5px] text-white">T18</span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold leading-[13.5px] text-blue-800">
                      IMAX Laser 2D
                    </span>
                  </div>
                  <h4 className="text-sm font-bold leading-5 text-gray-900">Dune: Part Two</h4>
                  <p className="text-[11px] leading-[16.5px] text-gray-500">CGV Landmark 81 • Hall 01</p>
                  <p className="text-[11px] font-semibold leading-[16.5px] text-amber-600">Today, 20:15 – 23:01</p>
                </div>
              </div>

              {/* Seats */}
              <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-[13px]">
                <div className="flex items-center justify-between text-xs font-bold leading-4 text-gray-900">
                  <span className="flex items-center gap-1.5">
                    <Armchair size={14} className="text-amber-600" /> Seats ({selectedSeats.length} Selected)
                  </span>
                  <span>{vnd(totals.seats)}</span>
                </div>
                {seatGroups.map((g) => (
                  <div key={g.type} className="flex items-center justify-between pl-5 text-[11px] leading-[16.5px] text-gray-500">
                    <span>
                      {g.labels.join(", ")} ({g.type})
                    </span>
                    <span>
                      {vnd(Price[g.type])} × {g.labels.length}
                    </span>
                  </div>
                ))}
              </div>

              {/* F&B */}
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-[13px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold leading-4 text-gray-900">
                    <Utensils size={13} className="text-amber-600" /> Selected F&amp;B Combos
                  </span>
                  <span className="text-[11px] font-bold leading-4 text-amber-600">
                    {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </span>
                </div>
                {selected.length === 0 ? (
                  <p className="rounded-lg bg-[#eff4ff] p-2 text-[11px] text-gray-500">No combos added yet.</p>
                ) : (
                  selected.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-[#eff4ff] p-2">
                      <div>
                        <p className="text-xs font-bold leading-4 text-gray-900">
                          {qty[c.id]}× {c.name}
                        </p>
                        <p className="text-[10px] leading-4 text-gray-500">{c.summary}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold leading-4 text-gray-900">{vnd(c.price * (qty[c.id] ?? 0))}</span>
                        <button type="button" aria-label={`Remove ${c.name}`} onClick={() => setQuantity(c.id, 0)} className="pb-1 text-gray-400 hover:text-red-600">
                          <X size={9} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-1.5 text-xs leading-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats Subtotal</span>
                  <span className="font-semibold text-gray-900">{vnd(totals.seats)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">F&amp;B Combos Subtotal</span>
                  <span className="font-semibold text-gray-900">{vnd(totals.fb)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="flex items-center gap-1">
                    <Tag size={11} /> CineClub VIP Discount (-10%)
                  </span>
                  <span className="font-bold">-{vnd(totals.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Convenience &amp; Booking Fee</span>
                  <span className="font-semibold text-emerald-600">0 ₫ (FREE)</span>
                </div>
                <div className="py-1">
                  <div className="h-px bg-slate-200" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.5px] text-gray-500">Estimated Total</p>
                    <p className="text-[10px] leading-4 text-gray-400">Includes VAT &amp; Service Charges</p>
                  </div>
                  <span className="text-2xl font-extrabold leading-8 tracking-[-0.6px] text-red-600">{vnd(totals.total)}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  className="cursor-pointer flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                  onClick={() => navigate('/payment', { replace: true })}
                >
                  CONTINUE TO CHECKOUT <ArrowRight size={11} />
                </button>
                <button type="button" className="cursor-pointer py-1 text-center text-xs font-medium text-gray-500 underline decoration-dotted underline-offset-2">
                  Skip F&amp;B &amp; Continue with Seats Only
                </button>
              </div>

              {/* Trust */}
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-[9px]">
                <div className="flex items-center gap-1.5 text-xs leading-4 text-amber-600">
                  <Star size={13} />
                  <span>
                    Earn <b className="font-bold text-amber-700">+{totals.points} CinePoints</b> with this booking
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] leading-[16.5px] text-gray-500">
                  <CheckCircle2 size={12} className="text-emerald-600" /> Order guaranteed fresh &amp; warm at pickup
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-[13px]">
              <span className="flex items-center gap-2 text-xs font-medium leading-4 text-gray-600">
                <ShieldCheck size={13} className="text-gray-700" /> Instant booking guarantee
              </span>
              <a href="#" className="text-xs font-semibold leading-4 text-amber-600">Change Hall</a>
            </div>
          </aside>
        </main>

        <footer className="mt-auto flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5 text-xs leading-4 text-gray-500">
          <span className="flex items-center gap-1.5"><Clock size={13} /> Ticket reservation holds active for 10 minutes</span>
          <span>© 2025 CineVerse Entertainment Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#">Assistance</a>
            <a href="#">Cinema Policies</a>
            <a href="#">Refund Terms</a>
          </div>
        </footer>
      </div>
    </div>
  );
}