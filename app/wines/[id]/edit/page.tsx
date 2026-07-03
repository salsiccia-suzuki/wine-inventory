'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AutocompleteInput from '@/app/components/AutocompleteInput'

export default function EditWine() {
  const router = useRouter()
  const { id } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    producer: '',
    region: '',
    vintage: '',
    variety: '',
    country: '',
    wine_type: '赤',
    is_magnum: false,
    bottle_ml: 750,
    stock: 1,
    tasting_note: '',
    memo: '',
    is_important_memo: false,
    is_so2_free: false,
    purchase_price: '',
    photo_url: '',
  })

  useEffect(() => {
    async function fetchWine() {
      const { data, error } = await supabase.from('wines').select('*').eq('id', id).single()
      if (error) { console.error(error); setLoading(false); return }
      setForm({
        name: data.name || '',
        producer: data.producer || '',
        region: data.region || '',
        vintage: data.vintage ? String(data.vintage) : '',
        variety: data.variety || '',
        country: data.country || '',
        wine_type: data.wine_type || '赤',
        is_magnum: data.is_magnum || false,
        bottle_ml: data.bottle_ml || 750,
        stock: data.stock || 0,
        tasting_note: data.tasting_note || '',
        memo: data.memo || '',
        is_important_memo: data.is_important_memo || false,
        is_so2_free: data.is_so2_free || false,
        purchase_price: data.purchase_price ? String(data.purchase_price) : '',
        photo_url: data.photo_url || '',
      })
      if (data.photo_url) setPhotoPreview(data.photo_url)
      setLoading(false)
    }
    fetchWine()
  }, [id])

  function set(key: string, value: string | number | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setSaving(true)
    let photo_url = form.photo_url

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('wine-photos')
        .upload(fileName, photoFile)
      if (uploadError) {
        alert('写真のアップロードに失敗しました：' + uploadError.message)
        setSaving(false)
        return
      }
      const { data } = supabase.storage.from('wine-photos').getPublicUrl(fileName)
      photo_url = data.publicUrl
    }

    const { error } = await supabase.from('wines').update({
      ...form,
      vintage: form.vintage ? Number(form.vintage) : null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      stock: Number(form.stock),
      photo_url,
    }).eq('id', id)

    setSaving(false)
    if (error) { alert('保存に失敗しました：' + error.message); return }
    router.push(`/wines/${id}`)
  }

  async function handleDelete() {
    if (!confirm('このワインを削除しますか？')) return
    const { error } = await supabase.from('wines').delete().eq('id', id)
    if (error) { alert('削除に失敗しました'); return }
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">読み込み中…</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 text-2xl">←</button>
          <h1 className="text-xl font-medium text-gray-900">ワインを編集</h1>
        </div>

        {/* 写真 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-56 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex items-center justify-center cursor-pointer overflow-hidden mb-4"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <span className="text-5xl">📷</span>
              <span className="text-sm">タップして写真を変更</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">

          <div>
            <label className="text-xs text-gray-400">ワイン名</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          <div>
            <label className="text-xs text-gray-400">生産者</label>
            <AutocompleteInput field="producer" value={form.producer} onChange={v => set('producer', v)} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400">地方・産地</label>
              <AutocompleteInput field="region" value={form.region} onChange={v => set('region', v)} />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-400">ヴィンテージ</label>
              <input value={form.vintage} onChange={e => set('vintage', e.target.value)}
                type="number" placeholder="2020"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">品種</label>
            <AutocompleteInput field="variety" value={form.variety} onChange={v => set('variety', v)} />
          </div>

          <div>
            <label className="text-xs text-gray-400">国</label>
            <AutocompleteInput field="country" value={form.country} onChange={v => set('country', v)} />
          </div>

          <div>
            <label className="text-xs text-gray-400">種類</label>
            <div className="flex gap-2 mt-1">
              {['赤', '白', '泡', 'ロゼ'].map(type => (
                <button key={type} onClick={() => set('wine_type', type)}
                  className={`px-4 py-1.5 rounded-full text-sm border ${form.wine_type === type ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">ボトルサイズ</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {[
                { ml: 375, label: 'ハーフ（375ml）' },
                { ml: 750, label: 'スタンダード（750ml）' },
                { ml: 1000, label: '1000ml' },
                { ml: 1500, label: 'マグナム（1500ml）' },
              ].map(opt => (
                <button key={opt.ml} onClick={() => { set('bottle_ml', opt.ml); set('is_magnum', opt.ml === 1500) }}
                  className={`px-3 py-1.5 rounded-full text-sm border ${form.bottle_ml === opt.ml ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_so2_free} onChange={e => set('is_so2_free', e.target.checked)}
                className="w-4 h-4 rounded" />
              SO2無添加
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-400">在庫本数</label>
            <input value={form.stock} onChange={e => set('stock', e.target.value)}
              type="number" min="0"
              className="w-24 mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          <div>
            <label className="text-xs text-gray-400">テイスティングコメント</label>
            <textarea value={form.tasting_note} onChange={e => set('tasting_note', e.target.value)}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">メモ</label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={form.is_important_memo} onChange={e => set('is_important_memo', e.target.checked)}
                  className="w-3.5 h-3.5" />
                重要メモとしてマーク
              </label>
            </div>
            <textarea value={form.memo} onChange={e => set('memo', e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="text-xs text-gray-400">納価（円）</label>
            <input value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)}
              type="number" min="0"
              className="w-40 mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
          </div>

        </div>

        <button onClick={handleSave} disabled={saving}
          className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-50">
          {saving ? '保存中…' : '保存する'}
        </button>

        <button onClick={handleDelete}
          className="mt-3 w-full py-3 border border-red-200 text-red-400 rounded-xl text-sm font-medium">
          このワインを削除する
        </button>

      </div>
    </div>
  )
}
