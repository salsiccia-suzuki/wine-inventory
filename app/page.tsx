'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Wine = {
  id: string
  name: string
  producer: string
  region: string
  vintage: number
  variety: string
  wine_type: string
  is_magnum: boolean
  stock: number
  tasting_note: string
  memo: string
  is_important_memo: boolean
  is_so2_free: boolean
  purchase_price: number
  photo_url: string
}

export default function Home() {
  const router = useRouter()
  const [wines, setWines] = useState<Wine[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWines()
  }, [])

  async function fetchWines() {
    const { data, error } = await supabase.from('wines').select('*').order('name')
    if (error) console.error(error)
    else setWines(data || [])
    setLoading(false)
  }

  async function updateStock(id: string, delta: number, current: number) {
    const newStock = Math.max(0, current + delta)
    const { error } = await supabase.from('wines').update({ stock: newStock }).eq('id', id)
    if (!error) setWines(wines.map(w => w.id === id ? { ...w, stock: newStock } : w))
  }

  const filtered = wines.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.variety?.toLowerCase().includes(search.toLowerCase()) ||
    w.region?.toLowerCase().includes(search.toLowerCase()) ||
    w.producer?.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = wines.reduce((sum, w) => sum + (w.purchase_price || 0) * w.stock, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">

        <div className="mb-4">
          <h1 className="text-2xl font-medium text-gray-900">ワイン在庫</h1>
          <p className="text-sm text-gray-500 mt-1">
            棚卸金額：<span className="font-medium text-gray-900">¥{totalValue.toLocaleString()}</span>
          </p>
        </div>

        <input
          type="text"
          placeholder="品種・産地・生産者で検索…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-gray-400"
        />

        {loading && <p className="text-gray-400 text-sm">読み込み中…</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-400 text-sm">ワインが登録されていません。</p>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map(wine => {
            const bottlePrice = wine.purchase_price ? wine.purchase_price * 2 + 1000 : null
            const glassPrice = bottlePrice ? Math.round(bottlePrice / 6) : null

            return (
              <div
                key={wine.id}
                className={`bg-white rounded-2xl border overflow-hidden flex h-24 ${wine.stock <= 2 ? 'border-red-200' : 'border-gray-100'}`}
              >
                <div className="w-20 flex-shrink-0 bg-gray-100 flex items-center justify-center text-3xl">
                  {wine.photo_url ? (
                    <img src={wine.photo_url} alt={wine.name} className="w-full h-full object-cover" />
                  ) : (
                    wine.wine_type === '泡' ? '🥂' : wine.wine_type === '白' ? '🍾' : '🍷'
                  )}
                </div>

                <div className="flex-1 px-3 py-2 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{wine.name}</p>
                    {wine.is_important_memo && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">重要</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 truncate">{wine.variety}</p>
                  <p className="text-xs text-gray-400 truncate">{wine.region}　{wine.producer}</p>
                  {bottlePrice && (
                    <p className="text-xs text-gray-400">ボトル ¥{bottlePrice.toLocaleString()} / グラス ¥{glassPrice?.toLocaleString()}</p>
                  )}
                </div>

                <div className="px-3 flex flex-col items-end justify-center gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStock(wine.id, -1, wine.stock)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50"
                    >−</button>
                    <span className={`text-lg font-medium w-6 text-center ${wine.stock <= 2 ? 'text-red-500' : 'text-gray-900'}`}>
                      {wine.stock}
                    </span>
                    <button
                      onClick={() => updateStock(wine.id, 1, wine.stock)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50"
                    >+</button>
                  </div>
                  {wine.stock <= 2 && (
                    <span className="text-xs text-red-400">残少</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={() => router.push('/wines/new')} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium">
          + 新しいワインを登録
        </button>
      </div>
    </div>
  )
}
