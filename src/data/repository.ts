import Dexie, { type EntityTable } from 'dexie'
import { reactive } from 'vue'
import { seedData } from './seed'
import type { AppData, Customer, Order, Product, Promotion } from '../types'

type StateRow = { key: string; value: AppData }
const db = new Dexie('commerce-os-demo') as Dexie & { state: EntityTable<StateRow, 'key'> }
db.version(1).stores({ state: 'key' })

const delay = Number(import.meta.env.VITE_API_DELAY || 160)
const wait = () => new Promise(resolve => setTimeout(resolve, delay))
export const appState = reactive<AppData>(seedData())

async function persist() { await db.state.put({ key: 'workspace', value: JSON.parse(JSON.stringify(appState)) }) }
export async function initializeData() {
  const row = await db.state.get('workspace')
  Object.assign(appState, row?.value ?? seedData())
  if (!row) await persist()
}
export async function resetData() { await wait(); Object.assign(appState, seedData()); await persist() }

export const productRepository = {
  async list() { await wait(); return appState.products },
  async get(id: string) { await wait(); return appState.products.find(item => item.id === id) },
  async save(product: Product) { await wait(); const index = appState.products.findIndex(item => item.id === product.id); if (index >= 0) appState.products[index] = product; else appState.products.unshift(product); await persist(); return product },
  async setStatus(id: string, status: Product['status']) { const product = appState.products.find(item => item.id === id); if (!product) throw new Error('找不到商品'); product.status = status; product.updatedAt = new Date().toISOString(); await persist() },
}
export const orderRepository = {
  async list() { await wait(); return appState.orders },
  async get(id: string) { await wait(); return appState.orders.find(item => item.id === id) },
  async save(order: Order) { await wait(); const index = appState.orders.findIndex(item => item.id === order.id); if (index < 0) throw new Error('找不到訂單'); appState.orders[index] = order; await persist(); return order },
}
export const customerRepository = { async list(): Promise<Customer[]> { await wait(); return appState.customers } }
export const promotionRepository = { async list(): Promise<Promotion[]> { await wait(); return appState.promotions }, async save(item: Promotion) { const index = appState.promotions.findIndex(row => row.id === item.id); if (index >= 0) appState.promotions[index] = item; else appState.promotions.unshift(item); await persist() } }
