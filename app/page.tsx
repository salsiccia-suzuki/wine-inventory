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
  country: string
  wine_type: string
  is_magnum: boolean
  stock: number
  tasting_note: string
  memo: string
  is_important_memo: boolean
  is_so2_free: boolean
  purchase_price: number
  photo_url: string
  is_archived: boolean
}

export default function Home() {
  const router = useRouter()
  const [wines, setWines] = useState<Wine[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  useEffect(() => {
    fetchWines()
  }, [showAll])

  async function fetchWines() {
    let query = supabase.from('wines').select('*').order('name')
    if (!showAll) query = query.eq('is_archived', false)
    const { data, error } = await query
    if (error) console.error(error)
    else setWines(data || [])
    setLoading(false)
  }

  async function updateStock(e: React.MouseEvent, id: string, delta: number, current: number) {
    e.stopPropagation()
    const newStock = Math.max(0, current + delta)
    const updates: { stock: number; is_archived?: boolean } = { stock: newStock }
    if (newStock === 0) updates.is_archived = true
    const { error } = await supabase.from('wines').update(updates).eq('id', id)
    if (!error) {
      if (newStock === 0) {
        setWines(wines.filter(w => w.id !== id))
      } else {
        setWines(wines.map(w => w.id === id ? { ...w, stock: newStock } : w))
      }
    }
  }

  const filtered = wines.filter(w => {
    const q = search.toLowerCase()
    const bottlePrice = w.purchase_price ? w.purchase_price * 2 + 1000 : null
    const glassPrice = bottlePrice ? Math.round(bottlePrice / 6) : null

    const matchText = (
      w.name?.toLowerCase().includes(q) ||
      w.variety?.toLowerCase().includes(q) ||
      w.region?.toLowerCase().includes(q) ||
      w.producer?.toLowerCase().includes(q) ||
      w.country?.toLowerCase().includes(q) ||
      w.wine_type?.toLowerCase().includes(q) ||
      w.tasting_note?.toLowerCase().includes(q) ||
      w.memo?.toLowerCase().includes(q) ||
      String(w.vintage || '').includes(q)
    )

    const min = priceMin ? Number(priceMin) : null
    const max = priceMax ? Number(priceMax) : null
    const matchPrice = (min === null && max === null) ? true :
      [bottlePrice, glassPrice].some(p =>
        p !== null &&
        (min === null || p >= min) &&
        (max === null || p <= max)
      )

    return matchText && matchPrice
  })

  const totalValue = wines.reduce((sum, w) => sum + (w.purchase_price || 0) * w.stock, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">ワイン在庫</h1>
            <p className="text-sm text-gray-500 mt-1">
              棚卸金額：<span className="font-medium text-gray-900">¥{totalValue.toLocaleString()}</span>
            </p>
          </div>
          <div className="flex gap-2 mt-1 items-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`text-sm border rounded-full px-3 py-1 ${showAll ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-400 border-gray-200'}`}
            >{showAll ? '全て表示中' : '全て表示'}</button>
            <button onClick={() => router.push('/archive')} className="text-gray-400 text-sm border border-gray-200 rounded-full px-3 py-1">アーカイブ</button>
            <button onClick={() => router.push('/settings')} className="text-gray-400 text-2xl">⚙️</button>
          </div>
        </div>

        <input
          type="text"
          placeholder="名前・品種・国・産地・生産者・年・種類で検索…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-gray-400"
        />

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400 flex-shrink-0">売価</span>
          <input
            type="number"
            placeholder="下限"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-gray-400"
          />
          <span className="text-xs text-gray-400">〜</span>
          <input
            type="number"
            placeholder="上限"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-gray-400"
          />
          <span className="text-xs text-gray-400">円</span>
          {(priceMin || priceMax) && (
            <button onClick={() => { setPriceMin(''); setPriceMax('') }}
              className="text-xs text-gray-400 underline">
              クリア
            </button>
          )}
        </div>

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
                className={`rounded-2xl border overflow-hidden flex h-24 ${wine.is_archived ? 'bg-gray-900 border-gray-900' : wine.stock <= 2 ? 'bg-white border-red-200' : 'bg-white border-gray-100'}`}
                onClick={() => router.push(`/wines/${wine.id}`)}
                style={{ cursor: 'pointer' }}
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
                    <p className={`text-sm font-medium truncate ${wine.is_archived ? 'text-white' : 'text-gray-900'}`}>{wine.name}</p>
                    {wine.is_archived && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full flex-shrink-0">在庫なし</span>
                    )}
                    {wine.is_important_memo && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">重要</span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${wine.is_archived ? 'text-gray-300' : 'text-gray-700'}`}>{wine.variety}</p>
                  <p className={`text-xs truncate ${wine.is_archived ? 'text-gray-500' : 'text-gray-400'}`}>{wine.region}　{wine.producer}</p>
                  {bottlePrice && (
                    <p className={`text-xs ${wine.is_archived ? 'text-gray-500' : 'text-gray-400'}`}>ボトル ¥{bottlePrice.toLocaleString()} / グラス ¥{glassPrice?.toLocaleString()}</p>
                  )}
                </div>

                <div className="px-3 flex flex-col items-end justify-center gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => updateStock(e, wine.id, -1, wine.stock)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50"
                    >−</button>
                    <span className={`text-lg font-medium w-6 text-center ${wine.stock <= 2 ? 'text-red-500' : 'text-gray-900'}`}>
                      {wine.stock}
                    </span>
                    <button
                      onClick={(e) => updateStock(e, wine.id, 1, wine.stock)}
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
