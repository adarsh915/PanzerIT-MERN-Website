'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { searchLinkableContent, type LinkType, type SearchResult } from './footerStore'
import styles from './FooterSettingsPanel.module.scss'

type PickedLink = {
  label: string
  link_type: LinkType
  ref_id?: string
  custom_url?: string
  display?: string  // for UI display: slug or URL
}

interface LinkPickerProps {
  value: PickedLink
  onChange: (v: PickedLink) => void
}

const TYPE_OPTIONS: { value: LinkType; label: string }[] = [
  { value: 'custom',   label: 'Custom URL' },
  { value: 'blog',     label: 'Blog Post' },
  { value: 'solution', label: 'Solution' },
  { value: 'brand',    label: 'Brand' },
]

const URL_PREFIX: Record<Exclude<LinkType, 'custom'>, string> = {
  blog:     '/blog',
  solution: '/solution',
  brand:    '/brand',
}

export function LinkPicker({ value, onChange }: LinkPickerProps) {
  const [query, setQuery] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const doSearch = useCallback(
    async (q: string, type: Exclude<LinkType, 'custom'>) => {
      if (!q.trim()) { setResults([]); setOpen(false); return }
      setSearching(true)
      const res = await searchLinkableContent(type, q)
      setResults(res)
      setOpen(true)
      setSearching(false)
    },
    []
  )

  const handleQueryChange = (q: string) => {
    setQuery(q)
    if (value.link_type === 'custom') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(q, value.link_type as Exclude<LinkType, 'custom'>)
    }, 300)
  }

  const handleTypeChange = (type: LinkType) => {
    setQuery(null)
    setResults([])
    setOpen(false)
    onChange({ label: value.label, link_type: type, custom_url: '', ref_id: '' })
  }

  const handleSelectResult = (item: SearchResult) => {
    const prefix = URL_PREFIX[value.link_type as Exclude<LinkType, 'custom'>]
    onChange({
      label: value.label || item.title,
      link_type: value.link_type,
      ref_id: item.id,
      display: `${prefix}/${item.slug}`,
    })
    setQuery(null)
    setOpen(false)
  }

  const isCustom = value.link_type === 'custom'

  return (
    <div className={styles.linkPicker} ref={containerRef}>
      {/* Type selector */}
      <select
        className={styles.linkTypeSelect}
        value={value.link_type}
        onChange={(e) => handleTypeChange(e.target.value as LinkType)}
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* URL input (custom) or search box (others) */}
      {isCustom ? (
        <input
          className={styles.linkInput}
          placeholder="URL (e.g. /contact or https://…)"
          value={value.custom_url ?? ''}
          onChange={(e) => onChange({ ...value, custom_url: e.target.value })}
          autoComplete="off"
        />
      ) : (
        <div className={styles.pickerSearchWrap} style={{ position: 'relative', flex: 1 }}>
          <input
            className={styles.linkInput}
            placeholder={`Search ${value.link_type}s…`}
            value={query !== null ? query : (value.display || '')}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query && results.length > 0 && setOpen(true)}
            autoComplete="off"
          />
          {searching && (
            <span className={styles.pickerSpinner}>⟳</span>
          )}
          {open && results.length > 0 && (
            <ul className={styles.pickerDropdown}>
              {results.map((item) => (
                <li
                  key={item.id}
                  className={styles.pickerItem}
                  onMouseDown={() => handleSelectResult(item)}
                >
                  <span className={styles.pickerItemTitle}>{item.title}</span>
                  <span className={styles.pickerItemSlug}>/{item.slug}</span>
                </li>
              ))}
            </ul>
          )}
          {open && results.length === 0 && !searching && (query || '').length > 0 && (
            <ul className={styles.pickerDropdown}>
              <li className={styles.pickerNoResults}>No results found</li>
            </ul>
          )}
        </div>
      )}

      {/* Selected content display (non-custom) */}
      {!isCustom && value.ref_id && value.display && (
        <span className={styles.pickerSelected} title={value.display}>
          ✓ {value.display}
        </span>
      )}
    </div>
  )
}
