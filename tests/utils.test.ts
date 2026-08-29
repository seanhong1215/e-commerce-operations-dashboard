import { describe, expect, it, vi } from 'vitest'
import { allowedOrderTransitions, canTransition, currency, generateSkus } from '../src/utils'
import type { Sku } from '../src/types'

describe('generateSkus', () => {
  it('creates the cartesian product for product options', () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'generated-id') })
    const skus = generateSkus([
      { name: 'Color', values: ['Black', 'White'] },
      { name: 'Size', values: ['S', 'M'] },
    ], [], 880)
    expect(skus).toHaveLength(4)
    expect(skus.map(sku => sku.combination)).toEqual([
      { Color: 'Black', Size: 'S' },
      { Color: 'Black', Size: 'M' },
      { Color: 'White', Size: 'S' },
      { Color: 'White', Size: 'M' },
    ])
    expect(skus.every(sku => sku.price === 880 && sku.stock === 20)).toBe(true)
  })

  it('preserves an existing SKU when its combination still exists', () => {
    const existing: Sku = {
      id: 'sku-black-m',
      code: 'TEE-BLK-M',
      combination: { Color: 'Black', Size: 'M' },
      price: 980,
      stock: 7,
      safetyStock: 2,
      enabled: false,
    }
    const skus = generateSkus([
      { name: 'Color', values: ['Black'] },
      { name: 'Size', values: ['M'] },
    ], [existing], 880)
    expect(skus).toEqual([existing])
  })

  it('ignores incomplete options and returns no rows without valid values', () => {
    expect(generateSkus([{ name: '', values: ['S'] }, { name: 'Color', values: [] }])).toEqual([])
  })
})

describe('order transitions', () => {
  it('allows only the configured next states', () => {
    expect(canTransition('pending', 'processing')).toBe(true)
    expect(canTransition('pending', 'completed')).toBe(false)
    expect(canTransition('completed', 'returned')).toBe(false)
    expect(allowedOrderTransitions.shipped).toEqual(['completed', 'returned'])
  })
})

describe('currency', () => {
  it('formats whole New Taiwan dollar amounts', () => {
    expect(currency(1280)).toContain('1,280')
  })
})
