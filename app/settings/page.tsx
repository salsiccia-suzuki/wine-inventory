'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const DEFAULTS = {
  priceMultiplier: 2,
  priceAddition: 1000,
  glass1: 6,
  glass2: 8,
  stockAlertThreshold: 3,
  inventoryBase: 'purchase',
  swipeIncludeArchived: false,
  listFields: {
    variety: true,
    country: true,
    region: true,
    producer: true,
    price: true,
  },
  detailFields: {
    variety: true,
    country: true,
    region: true,
    producer: true,
    vintage: true,
    tasting_note: true,
    memo: true,
    price: true,
    so2: true,
  },
}

export default function Settings() {
  const router = useRouter()
  const [settings, setSettings] = useState(DEFAULTS)

  useEffect(() => {
    const saved = localStorage.getItem('wineSettings')
    if (saved) setSettings(JSON.parse(saved))
  }, [])

  function set(key: string, value: string | number | boolean) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  function handleSave() {
    localStorage.setItem('wineSettings', JSON.stringify(settings))
    alert('設定を保存しました')
    router.push('/')
  }

  const examplePurchase = 3000
  const exampleBottle = examplePurchase * settings.priceMultiplier + settings.priceAddition
  const exampleGlass1 = Math.round(exampleBottle / settings.glass1)
  const exampleGlass2 = Math.round(exampleBottle / settings.glass2)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="text-gray-400 text-2xl">←</button>
          <h1 className="text-xl font-medium text-gray-900">設定</h1>
        </div>

        <div className="flex flex-col gap-4">

          {/* 売価計算式 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-4">売価計算式</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400">掛け率</label>
                <input
                  type="number"
                  value={settings.priceMultiplier}
                  onChange={e => set('priceMultiplier', Number(e.target.value))}
                  step="0.1" min="1"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div className="pt-4 text-gray-400 text-sm">倍 +</div>
              <div className="flex-1">
                <label className="text-xs text-gray-400">加算額（円）</label>
                <input
                  type="number"
                  value={settings.priceAddition}
                  onChange={e => set('priceAddition', Number(e.target.value))}
                  step="100" min="0"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* プレビュー */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">計算例（納価 ¥3,000 の場合）</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-400">ボトル</p>
                  <p className="text-sm font-medium text-gray-900">¥{exampleBottle.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">グラス{settings.glass1}杯</p>
                  <p className="text-sm font-medium text-gray-900">¥{exampleGlass1.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">グラス{settings.glass2}杯</p>
                  <p className="text-sm font-medium text-gray-900">¥{exampleGlass2.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* グラス何杯どり */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">グラスワイン 何杯どり</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.glass1}
                  onChange={e => set('glass1', Number(e.target.value))}
                  min="1" max="20"
                  className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                />
                <p className="text-sm text-gray-500">杯</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.glass2}
                  onChange={e => set('glass2', Number(e.target.value))}
                  min="1" max="20"
                  className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                />
                <p className="text-sm text-gray-500">杯</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">2種類の杯数を設定できます</p>
          </div>

          {/* 残少アラート */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">残少アラートの基準</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.stockAlertThreshold}
                onChange={e => set('stockAlertThreshold', Number(e.target.value))}
                min="1" max="10"
                className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
              <p className="text-sm text-gray-500">本以下で警告表示</p>
            </div>
          </div>

          {/* スワイプ検索 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">スワイプ検索</p>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">アーカイブを含める</span>
              <input
                type="checkbox"
                checked={settings.swipeIncludeArchived}
                onChange={e => set('swipeIncludeArchived', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>

          {/* 棚卸金額の基準 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">棚卸金額の計算基準</p>
            <div className="flex gap-2">
              {[
                { value: 'purchase', label: '納価ベース' },
                { value: 'sell', label: '売価ベース' },
              ].map(opt => (
                <button key={opt.value} onClick={() => set('inventoryBase', opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm border ${settings.inventoryBase === opt.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 在庫一覧の表示項目 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">在庫一覧に表示する項目</p>
            <div className="flex flex-col gap-2">
              {[
                { key: 'variety', label: '品種' },
                { key: 'country', label: '国' },
                { key: 'region', label: '地方・産地' },
                { key: 'producer', label: '生産者' },
                { key: 'price', label: '売価' },
              ].map(f => (
                <label key={f.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{f.label}</span>
                  <input
                    type="checkbox"
                    checked={settings.listFields[f.key as keyof typeof settings.listFields]}
                    onChange={e => setSettings(s => ({ ...s, listFields: { ...s.listFields, [f.key]: e.target.checked } }))}
                    className="w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 詳細画面の表示項目 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">ワイン詳細に表示する項目</p>
            <div className="flex flex-col gap-2">
              {[
                { key: 'variety', label: '品種' },
                { key: 'country', label: '国' },
                { key: 'region', label: '地方・産地' },
                { key: 'producer', label: '生産者' },
                { key: 'vintage', label: 'ヴィンテージ' },
                { key: 'tasting_note', label: 'テイスティングコメント' },
                { key: 'memo', label: 'メモ' },
                { key: 'price', label: '売価' },
                { key: 'so2', label: 'SO2無添加' },
              ].map(f => (
                <label key={f.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{f.label}</span>
                  <input
                    type="checkbox"
                    checked={settings.detailFields[f.key as keyof typeof settings.detailFields]}
                    onChange={e => setSettings(s => ({ ...s, detailFields: { ...s.detailFields, [f.key]: e.target.checked } }))}
                    className="w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

        </div>

        <button onClick={handleSave}
          className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium">
          保存する
        </button>

      </div>
    </div>
  )
}
