import type { ProductOption, Sku } from './types'

export const currency = (value: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value)
export const shortDate = (value: string) => new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

export function generateSkus(options: ProductOption[], existing: Sku[] = [], basePrice = 0): Sku[] {
  const valid = options.filter(option => option.name.trim() && option.values.length)
  if (!valid.length) return []
  const combinations = valid.reduce<Record<string, string>[]>((rows, option) =>
    rows.flatMap(row => option.values.filter(Boolean).map(value => ({ ...row, [option.name]: value }))), [{}])
  return combinations.map((combination, index) => {
    const signature = JSON.stringify(combination)
    const found = existing.find(sku => JSON.stringify(sku.combination) === signature)
    return found ?? {
      id: crypto.randomUUID(), code: `SKU-${Date.now().toString().slice(-5)}-${String(index + 1).padStart(2, '0')}`,
      combination, price: basePrice, stock: 20, safetyStock: 5, enabled: true,
    }
  })
}

export const allowedOrderTransitions = {
  pending: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['completed', 'returned'],
  completed: [], cancelled: [], returned: [],
} as const

export function canTransition(from: keyof typeof allowedOrderTransitions, to: string) {
  return (allowedOrderTransitions[from] as readonly string[]).includes(to)
}
