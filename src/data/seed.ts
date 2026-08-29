import type { AppData } from '../types'

const svg = (label: string, color: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="38" fill="white">${label}</text></svg>`)}`

export function seedData(): AppData {
  const now = new Date('2026-08-28T10:00:00+08:00')
  return {
    seededAt: now.toISOString(),
    products: [
      { id: 'p-tee', name: '城市輪廓純棉 T-Shirt', category: '服飾', description: '260g 重磅純棉，俐落版型。', status: 'active', price: 980, image: svg('T-Shirt', '#446b55'), weight: 260, seoTitle: '城市輪廓純棉 T-Shirt', updatedAt: now.toISOString(), options: [{ name: 'Color', values: ['Black', 'White'] }, { name: 'Size', values: ['S', 'M', 'L'] }], skus: ['Black-S','Black-M','Black-L','White-S','White-M','White-L'].map((x, i) => ({ id: `sku-${i}`, code: `TS-${x.toUpperCase()}`, combination: { Color: x.split('-')[0], Size: x.split('-')[1] }, price: 980, stock: [8, 24, 16, 5, 18, 11][i], safetyStock: 5, enabled: true })) },
      { id: 'p-bag', name: '通勤防潑水托特包', category: '包袋', description: '輕量大容量日常托特包。', status: 'active', price: 1280, image: svg('Tote Bag', '#c97954'), weight: 420, seoTitle: '通勤防潑水托特包', updatedAt: now.toISOString(), options: [{ name: 'Color', values: ['Khaki', 'Navy'] }], skus: ['Khaki','Navy'].map((x, i) => ({ id: `bag-${i}`, code: `BAG-${x.toUpperCase()}`, combination: { Color: x }, price: 1280, stock: i ? 34 : 12, safetyStock: 8, enabled: true })) },
      { id: 'p-mug', name: '山系陶瓷馬克杯', category: '生活', description: '手感釉面與溫潤杯型。', status: 'inactive', price: 680, image: svg('Mug', '#58758f'), weight: 350, seoTitle: '山系陶瓷馬克杯', updatedAt: now.toISOString(), options: [], skus: [] },
    ],
    customers: [
      { id: 'c-01', name: '林宥辰', email: 'yuchen@example.demo', segment: '高價值', spent: 28640, orders: 12, status: 'active', joinedAt: '2025-11-12' },
      { id: 'c-02', name: '陳思妤', email: 'siyu@example.demo', segment: '活躍', spent: 12820, orders: 7, status: 'active', joinedAt: '2026-02-08' },
      { id: 'c-03', name: '張雅雯', email: 'yawen@example.demo', segment: '一般', spent: 3960, orders: 2, status: 'active', joinedAt: '2026-06-19' },
      { id: 'c-04', name: '黃子維', email: 'ziwei@example.demo', segment: '沉睡', spent: 2180, orders: 2, status: 'inactive', joinedAt: '2025-08-03' },
    ],
    orders: [
      { id: 'ORD-20260828-1042', customerId: 'c-01', customerName: '林宥辰', createdAt: '2026-08-28T09:42:00+08:00', status: 'processing', total: 3240, items: [{ productId: 'p-tee', name: '城市輪廓純棉 T-Shirt', sku: 'TS-BLACK-M', quantity: 2, price: 980 }, { productId: 'p-bag', name: '通勤防潑水托特包', sku: 'BAG-KHAKI', quantity: 1, price: 1280 }], logs: [{ at: '2026-08-28T09:42:00+08:00', label: '訂單成立' }, { at: '2026-08-28T09:44:00+08:00', label: '付款完成，等待出貨' }] },
      { id: 'ORD-20260827-0988', customerId: 'c-02', customerName: '陳思妤', createdAt: '2026-08-27T16:18:00+08:00', status: 'shipped', total: 1960, carrier: '黑貓宅急便', trackingNumber: '9062814021', items: [{ productId: 'p-tee', name: '城市輪廓純棉 T-Shirt', sku: 'TS-WHITE-S', quantity: 2, price: 980 }], logs: [{ at: '2026-08-27T16:18:00+08:00', label: '訂單成立' }, { at: '2026-08-28T08:20:00+08:00', label: '商品已出貨' }] },
      { id: 'ORD-20260826-0921', customerId: 'c-03', customerName: '張雅雯', createdAt: '2026-08-26T12:10:00+08:00', status: 'completed', total: 1280, items: [{ productId: 'p-bag', name: '通勤防潑水托特包', sku: 'BAG-NAVY', quantity: 1, price: 1280 }], logs: [{ at: '2026-08-26T12:10:00+08:00', label: '訂單成立' }, { at: '2026-08-27T15:10:00+08:00', label: '訂單完成' }] },
      { id: 'ORD-20260825-0876', customerId: 'c-02', customerName: '陳思妤', createdAt: '2026-08-25T14:22:00+08:00', status: 'pending', total: 680, items: [{ productId: 'p-mug', name: '山系陶瓷馬克杯', sku: 'MUG-DEFAULT', quantity: 1, price: 680 }], logs: [{ at: '2026-08-25T14:22:00+08:00', label: '等待付款' }] },
    ],
    promotions: [
      { id: 'promo-1', name: '新會員首購禮', type: '優惠券', code: 'HELLO100', discount: '現折 NT$100', startAt: '2026-08-01', endAt: '2026-12-31', enabled: true },
      { id: 'promo-2', name: '夏末滿額回饋', type: '滿額活動', code: 'AUG2000', discount: '滿 NT$2,000 折 NT$200', startAt: '2026-08-20', endAt: '2026-09-10', enabled: true },
      { id: 'promo-3', name: '生活選品九折', type: '折扣活動', code: 'LIFE90', discount: '指定商品 9 折', startAt: '2026-09-01', endAt: '2026-09-30', enabled: false },
    ],
  }
}
