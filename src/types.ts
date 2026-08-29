export type ProductStatus = 'draft' | 'active' | 'inactive'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'returned'

export interface ProductOption { name: string; values: string[] }
export interface Sku { id: string; code: string; combination: Record<string, string>; price: number; stock: number; safetyStock: number; enabled: boolean }
export interface Product {
  id: string; name: string; category: string; description: string; status: ProductStatus; price: number;
  options: ProductOption[]; skus: Sku[]; image: string; weight: number; seoTitle: string; updatedAt: string
}
export interface OrderItem { productId: string; name: string; sku: string; quantity: number; price: number }
export interface OrderLog { at: string; label: string }
export interface Order {
  id: string; customerId: string; customerName: string; createdAt: string; status: OrderStatus; total: number;
  items: OrderItem[]; carrier?: string; trackingNumber?: string; returnReason?: string; logs: OrderLog[]
}
export interface Customer { id: string; name: string; email: string; segment: '一般' | '活躍' | '高價值' | '沉睡'; spent: number; orders: number; status: 'active' | 'inactive'; joinedAt: string }
export interface Promotion { id: string; name: string; type: '優惠券' | '滿額活動' | '折扣活動'; code: string; discount: string; startAt: string; endAt: string; enabled: boolean }
export interface AppData { products: Product[]; orders: Order[]; customers: Customer[]; promotions: Promotion[]; seededAt: string }
