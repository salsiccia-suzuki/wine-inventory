'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewWine() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
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
  })

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
    let photo_url = null

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

    const { error } = await supabase.from('wines').insert({
      ...form,
      vintage: form.vintage ? Number(form.vintage) : null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      stock: Number(form.stock),
      photo_url,
    })

    setSaving(false)
    if (error) { alert('保存に失敗しました：' + error.message); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="text-gray-400 text-2xl">←</button>
          <h1 className="text-xl font-medium text-gray-900">ワインを登録</h1>
        </div>

        {/* 写真（最重要） */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-56 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex items-center justify-center cursor-pointer overflow-hidden mb-4"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <span className="text-5xl">📷</span>
              <span className="text-sm">タップして写真を撮影・選択</span>
              <span className="text-xs">写真だけで登録できます</span>
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
            <input value={form.producer} onChange={e => set('producer', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400">地方・産地</label>
              <input value={form.region} onChange={e => set('region', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
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
            <input value={form.variety} onChange={e => set('variety', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          <div>
            <label className="text-xs text-gray-400">国</label>
            <input value={form.country} onChange={e => set('country', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
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
          {saving ? '保存中…' : '登録する'}
        </button>

      </div>
    </div>
  )
}
