'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  field: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function AutocompleteInput({ field, value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [allValues, setAllValues] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchValues() {
      const { data } = await supabase
        .from('wines')
        .select(field)
        .not(field, 'is', null)
        .neq(field, '')
      if (data) {
        const unique = [...new Set(data.map((r) => (r as unknown as Record<string, string>)[field]).filter(Boolean))] as string[]
        setAllValues(unique.sort())
      }
    }
    fetchValues()
  }, [field])

  useEffect(() => {
    if (value.length === 0) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const filtered = allValues.filter(v =>
      v.toLowerCase().includes(value.toLowerCase()) && v !== value
    )
    setSuggestions(filtered.slice(0, 6))
    setOpen(filtered.length > 0)
  }, [value, allValues])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
      />
      {open && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(s => (
            <li
              key={s}
              onMouseDown={() => { onChange(s); setOpen(false) }}
              onTouchEnd={() => { onChange(s); setOpen(false) }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
