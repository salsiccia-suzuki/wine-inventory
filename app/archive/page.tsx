'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Wine = {
  id: string
  name: string
  producer: string
  region: string
  variety: string
  wine_type: string
  photo_url: string
  purchase_price: number
  is_important_memo: boolean
}

export default function Archive() {
  const router = useRouter()
  const [wines, setWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArchived() {
      const { data, error } = await supabase
        .from('wines')
        .select('*')
        .eq('is_archived', true)
        .order('name')
      if (error) console.error(error)
      else setWines(data || [])
      setLoading(false)
    }
    fetchArchived()
  }, [])

  async function handleRestore(id: string) {
    const { error } = await supabase
      .from('wines')
      .update({ is_archived: false, stock: 1 })
      .eq('id', id)
    if (!error) setWines(wines.filter(w => w.id !== id))
  }

  async function handleDelete(id: string) {
    if (!confirm('完全に削除しますか？この操作は元に戻せません。')) return
    const { error } = await supabase.from('wines').delete().eq('id', id)
    if (!error) setWines(wines.filter(w => w.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="text-gray-400 text-2xl">←</button>
          <h1 className="text-xl font-medium text-gray-900">アーカイブ</h1>
        </div>

        {loading && <p className="text-gray-400 text-sm">読み込み中…</p>}

        {!loading && wines.length === 0 && (
          <p className="text-gray-400 text-sm">アーカイブされたワインはありません。</p>
        )}

        <div className="flex flex-col gap-3">
          {wines.map(wine => (
            <div
              key={wine.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-24 opacity-70"
            >
              <div className="w-20 flex-shrink-0 bg-gray-100 flex items-center justify-center text-3xl">
                {wine.photo_url ? (
                  <img src={wine.photo_url} alt={wine.name} className="w-full h-full object-cover" />
                ) : (
                  wine.wine_type === '泡' ? '🥂' : wine.wine_type === '白' ? '🍾' : '🍷'
                )}
              </div>

              <div className="flex-1 px-3 py-2 flex flex-col justify-center min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{wine.name}</p>
                <p className="text-sm text-gray-700 truncate">{wine.variety}</p>
                <p className="text-xs text-gray-400 truncate">{wine.region}　{wine.producer}</p>
              </div>

              <div className="px-3 flex flex-col gap-1.5 items-end justify-center flex-shrink-0">
                <button
                  onClick={() => handleRestore(wine.id)}
                  className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600"
                >
                  在庫に戻す
                </button>
                <button
                  onClick={() => handleDelete(wine.id)}
                  className="text-xs border border-red-200 rounded-full px-3 py-1.5 text-red-400"
                >
                  完全削除
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
