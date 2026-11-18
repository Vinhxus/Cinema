// Danh sách combo bắp nước. Trước đây nằm trong FoodPage.tsx,
// giờ tách ra đây vì cả BookingContext (tính tiền) lẫn FoodPage (hiển thị) đều cần.
import food1 from '../assets/food1.jpg'
import food2 from '../assets/food2.jpg'
import food3 from '../assets/food3.jpg'
import food4 from '../assets/food4.jpg'
import food5 from '../assets/food5.jpg'
import food6 from '../assets/food6.jpg'

export type Category = 'popcorn' | 'signature' | 'snacks' | 'beverages'

export type Combo = {
  id: string
  name: string
  price: number
  image: string
  imgClass?: string
  desc: string
  summary: string
  tags: string[]
  category: Category
  badges: { label: string; className: string }[]
  priceClass?: string
}

export const COMBOS: Combo[] = [
  {
    id: 'super-star',
    name: 'Super Star Combo',
    price: 115000,
    image: food1,
    desc: '1x Large Sweet Caramel Popcorn (85oz) + 2x Large Soft Drinks (32oz Coke/Sprite) + 1x Pack Crispy M&Ms Chocolate.',
    summary: '85oz Caramel + 2 Large Cokes',
    tags: ['Caramel', 'For 2 People', 'Free Refill'],
    category: 'popcorn',
    badges: [
      { label: 'BEST SELLER', className: 'bg-red-600 text-white uppercase tracking-[0.5px]' },
      { label: 'Save 20%', className: 'bg-amber-500 text-[#451a03]' },
    ],
  },
  {
    id: 'solo',
    priceClass: 'text-gray-900',
    name: 'Solo Moviegoer Combo',
    price: 85000,
    image: food2,
    desc: '1x Medium Salted & Cheese Mixed Popcorn (60oz) + 1x Medium Chilled Drink (22oz Coke, Sprite, or Fanta).',
    summary: '60oz Mixed Popcorn + Medium Drink',
    tags: ['Cheese & Salt', 'Single Serving'],
    category: 'popcorn',
    badges: [{ label: 'Solo Pick', className: 'bg-gray-800 text-white font-semibold' }],
  },
  {
    id: 'golden-vip',
    name: 'CineVerse Golden VIP Combo',
    price: 185000,
    image: food3,
    priceClass: 'text-amber-600',
    desc: '1x Truffle & Sea Salt Gourmet Popcorn Tub + 2x Premium Bottled Mocktails / Juices + Gourmet Nachos with warm cheddar cheese dip.',
    summary: 'Truffle Popcorn + 2 Mocktails + Nachos',
    tags: ['Black Truffle', 'Artisan Drinks', 'VIP Lounges'],
    category: 'signature',
    badges: [
      { label: 'Premium Gold', className: 'bg-amber-500 text-[#451a03]' },
      { label: 'Chef Curated', className: 'bg-amber-100 text-[#451a03] font-semibold' },
    ],
  },
  {
    id: 'dune-tub',
    name: 'Dune: Spice Planet Exclusive Tub',
    price: 210000,
    image: food4,
    imgClass: 'left-[1.28%] top-[-8.53%]',
    desc: 'Limited Edition Sandworm Souvenir Popcorn Tin + 2x Collectible Character Tumblers with reusable stainless straws.',
    summary: 'Sandworm Tin + 2 Tumblers',
    tags: ['Spiced Caramel', 'Metal Tin', 'Last 14 Sets'],
    category: 'signature',
    badges: [
      { label: 'Limited Edition', className: 'bg-red-600 text-white' },
      { label: 'Collectible', className: 'bg-amber-500 text-[#451a03] font-semibold' },
    ],
  },
  {
    id: 'nachos',
    priceClass: 'text-gray-900',
    name: 'Crispy Nachos & Cheese Platter',
    price: 75000,
    image: food5,
    desc: 'Warm corn tortilla chips, spicy sliced jalapeño peppers, double-portion hot cheddar fondue & zesty salsa dip.',
    summary: 'Nachos + Cheddar Fondue + Salsa',
    tags: ['Cheddar Fondue', 'Salsa Fresca', 'Served Hot'],
    category: 'snacks',
    badges: [{ label: 'Hot & Crisp', className: 'bg-orange-600 text-white' }],
  },
  {
    id: 'sausage',
    priceClass: 'text-gray-900',
    name: 'Sausage Duo & Soda',
    price: 95000,
    image: food6,
    desc: '2x Char-grilled German Bratwurst pork sausages with whole-grain honey mustard + 1x Large Fountain Beverage (32oz).',
    summary: '2 Bratwurst + Large Beverage',
    tags: ['Grilled', 'High Protein'],
    category: 'snacks',
    badges: [{ label: 'Savory Snack', className: 'bg-amber-700 text-white font-semibold' }],
  },
]

/** Giảm giá thành viên VIP áp lên phần bắp nước */
export const VIP_DISCOUNT_RATE = 0.1

/** Mã voucher hợp lệ -> số tiền được giảm (VND). Sau này sẽ lấy từ backend. */
export const VOUCHERS: Record<string, number> = {
  CINEVIP10: 25000,
}

/** Tỉ lệ VAT đã bao gồm trong giá */
export const VAT_RATE = 0.08
