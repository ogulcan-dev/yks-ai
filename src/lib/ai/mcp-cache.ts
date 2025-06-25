import crypto from 'crypto'

interface CacheEntry {
  key: string
  solution: string
  model: string
  timestamp: number
  hits: number
}

export class MCPCache {
  private cache: Map<string, CacheEntry>
  private maxSize: number
  private ttl: number 

  constructor(maxSize = 1000, ttlHours = 24) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttlHours * 60 * 60 * 1000
  }

  generateKey(image: string, subject: string, examType: string): string {
    const data = `${subject}-${examType}-${image.substring(0, 100)}`
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  get(key: string): string | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    entry.hits++
    
    return entry.solution
  }

  set(key: string, solution: string, model: string): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey()
      if (oldestKey) this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      key,
      solution,
      model,
      timestamp: Date.now(),
      hits: 0
    })
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  getStats() {
    const entries = Array.from(this.cache.values())
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlHours: this.ttl / (60 * 60 * 1000),
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      avgHits: entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.hits, 0) / entries.length 
        : 0,
      models: entries.reduce((acc, e) => {
        acc[e.model] = (acc[e.model] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  clear(): void {
    this.cache.clear()
  }

  cleanExpired(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }
} 