'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function WineDetail() {
  const router = useRouter()
  const { id } = useParams()
  const [wine, setWine] = useState<Wine | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWine() {
      const { data, error } = await supabase.from('wines').select('*').eq('id', id).single()
      if (error) console.error(error)
      else setWine(data)
      setLoading(false)
    }
    fetchWine()
  }, [id])

  async function updateStock(delta: number) {
    if (!wine) return
    const newStock = Math.max(0, wine.stock + delta)
    const { error } = await supabase.from('wines').update({ stock: newStock }).eq('id', wine.id)
    if (!error) setWine({ ...wine, stock: newStock })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">読み込み中…</div>
  if (!wine) return <div className="min-h-screen flex items-center justify-center text-gray-400">見つかりません</div>

  const bottlePrice = wine.purchase_price ? wine.purchase_price * 2 + 1000 : null
  const glassPrice6 = bottlePrice ? Math.round(bottlePrice / 6) : null
  const glassPrice8 = bottlePrice ? Math.round(bottlePrice / 8) : null

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* 左：写真（画面全体の高さ） */}
      <div className="w-5/12 flex-shrink-0 bg-gray-200 sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {wine.photo_url ? (
          <img src={wine.photo_url} alt={wine.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-8xl">
            {wine.wine_type === '泡' ? '🥂' : wine.wine_type === '白' ? '🍾' : '🍷'}
          </span>
        )}
      </div>

      {/* 右：情報 */}
      <div className="flex-1 overflow-y-auto">

        <div className="p-4 pb-0">
          <button onClick={() => router.push('/')} className="text-gray-400 text-2xl">←</button>
        </div>

        <div className="p-4 flex flex-col gap-4">

          <div>
            <p className="text-base font-medium text-gray-900 leading-tight">{wine.name}</p>
            {wine.vintage && <p className="text-sm text-gray-400 mt-0.5">{wine.vintage}</p>}
          </div>

          <div className="flex flex-col gap-2">
            {wine.variety && (
              <div>
                <p className="text-xs text-gray-400">品種</p>
                <p className="text-sm font-medium text-gray-900">{wine.variety}</p>
              </div>
            )}
            {wine.region && (
              <div>
                <p className="text-xs text-gray-400">地方・産地</p>
                <p className="text-sm font-medium text-gray-900">{wine.region}</p>
              </div>
            )}
            {wine.producer && (
              <div>
                <p className="text-xs text-gray-400">生産者</p>
                <p className="text-sm font-medium text-gray-900">{wine.producer}</p>
              </div>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {wine.wine_type && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{wine.wine_type}</span>
            )}
            {wine.is_magnum && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">マグナム</span>
            )}
            {wine.is_so2_free && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700">SO2無添加</span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">在庫本数</p>
            <div className="flex items-center gap-2">
              <button onClick={() => updateStock(-1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600">−</button>
              <span className={`text-lg font-medium w-6 text-center ${wine.stock <= 2 ? 'text-red-500' : 'text-gray-900'}`}>
                {wine.stock}
              </span>
              <button onClick={() => updateStock(1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600">+</button>
            </div>
          </div>

          {bottlePrice && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-3">売価</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400">ボトル</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">¥{bottlePrice.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">グラス6杯</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">¥{glassPrice6?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">グラス8杯</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">¥{glassPrice8?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {wine.tasting_note && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-2">テイスティングコメント</p>
              <p className="text-sm text-gray-700 leading-relaxed">{wine.tasting_note}</p>
            </div>
          )}

          {wine.memo && (
            <div className={`rounded-2xl border p-4 ${wine.is_important_memo ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
              <p className="text-xs text-gray-400 mb-2">
                {wine.is_important_memo ? '⚠️ 重要メモ' : 'メモ'}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{wine.memo}</p>
            </div>
          )}

          <button onClick={() => router.push(`/wines/${wine.id}/edit`)}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium">
            編集する
          </button>

        </div>
      </div>
    </div>
  )
}
