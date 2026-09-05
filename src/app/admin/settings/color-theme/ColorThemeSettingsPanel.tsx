'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { type CSSProperties, useState } from 'react'
import { toast } from 'react-toastify'
import styles from './ColorThemeSettingsPanel.module.scss'

type ThemeState = {
  primary: string
  accent: string
  sidebar: string
  page: string
  text: string
}

const presets = [
  { name: 'Ocean', primary: '#0ea5e9', accent: '#22d3ee', sidebar: '#0f172a', page: '#eff6ff', text: '#0f172a' },
  { name: 'Forest', primary: '#16a34a', accent: '#84cc16', sidebar: '#102217', page: '#f0fdf4', text: '#142118' },
  { name: 'Sunset', primary: '#f97316', accent: '#f43f5e', sidebar: '#2b1720', page: '#fff7ed', text: '#2b1720' },
  { name: 'Royal', primary: '#7c3aed', accent: '#db2777', sidebar: '#1e1b4b', page: '#f5f3ff', text: '#1e1b4b' },
  { name: 'Slate', primary: '#475569', accent: '#06b6d4', sidebar: '#111827', page: '#f8fafc', text: '#111827' },
  { name: 'Rose', primary: '#e11d48', accent: '#fb7185', sidebar: '#3b0b18', page: '#fff1f2', text: '#3b0b18' },
]

const colorRows: { key: keyof ThemeState; label: string }[] = [
  { key: 'primary', label: 'Primary color' },
  { key: 'accent', label: 'Accent / highlight' },
  { key: 'sidebar', label: 'Sidebar background' },
  { key: 'page', label: 'Page background' },
  { key: 'text', label: 'Text color' },
]

const ColorThemeSettingsPanel = () => {
  const [theme, setTheme] = useState<ThemeState>(presets[0])
  const [activePreset, setActivePreset] = useState('Ocean')
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const updateColor = (key: keyof ThemeState, value: string) => {
    setTheme((current) => ({ ...current, [key]: value }))
    setActivePreset('')
  }

  const applyPreset = (preset: ThemeState & { name: string }) => {
    setTheme({
      primary: preset.primary,
      accent: preset.accent,
      sidebar: preset.sidebar,
      page: preset.page,
      text: preset.text,
    })
    setActivePreset(preset.name)
  }

  const panelVars = {
    '--theme-primary': theme.primary,
    '--theme-accent': theme.accent,
    '--theme-sidebar': theme.sidebar,
    '--theme-page': mode === 'dark' ? '#101827' : theme.page,
    '--theme-text': mode === 'dark' ? '#f8fafc' : theme.text,
    '--theme-card': mode === 'dark' ? '#182235' : '#ffffff',
    '--theme-muted': mode === 'dark' ? '#94a3b8' : '#64748b',
  } as CSSProperties

  return (
    <div className={styles.shell} style={panelVars}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <span className={styles.headerIcon}>
            <IconifyIcon icon="tabler:palette" />
          </span>
          <div>
            <h2>Color theme</h2>
            <p>Customize your admin panel&apos;s visual identity</p>
          </div>
        </div>
        <button type="button" className={styles.saveButton} onClick={() => toast.success('Color theme saved successfully')}>
          <IconifyIcon icon="tabler:device-floppy" />
          Save changes
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.leftColumn}>
          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <div>
                <h3>
                  <IconifyIcon icon="tabler:sparkles" />
                  Preset Themes
                </h3>
                <span>Apply a complete palette instantly</span>
              </div>
            </div>
            <div className={styles.presetGrid}>
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  className={clsx(styles.presetCard, activePreset === preset.name && styles.activePreset)}
                  onClick={() => applyPreset(preset)}>
                  <span className={styles.presetPreview}>
                    <span style={{ backgroundColor: preset.page }} />
                    <span style={{ backgroundColor: preset.sidebar }} />
                    <i style={{ backgroundColor: preset.primary }} />
                  </span>
                  <span className={styles.presetFooter}>
                    <strong>{preset.name}</strong>
                    {activePreset === preset.name && <IconifyIcon icon="tabler:check" />}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <div>
                <h3>
                  <IconifyIcon icon="tabler:color-picker" />
                  Custom Color Pickers
                </h3>
                <span>Fine tune your admin colors</span>
              </div>
            </div>
            <div className={styles.colorList}>
              {colorRows.map((row) => (
                <div className={styles.colorRow} key={row.key}>
                  <div>
                    <span>{row.label}</span>
                    <strong>{theme[row.key]}</strong>
                  </div>
                  <label className={styles.swatch} style={{ backgroundColor: theme[row.key] }}>
                    <input type="color" value={theme[row.key]} onChange={(event) => updateColor(row.key, event.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <div>
              <h3>Live Preview</h3>
              <span>{mode === 'dark' ? 'Dark preview mode' : 'Light preview mode'}</span>
            </div>
            <div className={styles.modeButtons}>
              <button type="button" className={clsx(mode === 'light' && styles.activeMode)} onClick={() => setMode('light')}>
                <IconifyIcon icon="tabler:sun" />
                Light
              </button>
              <button type="button" className={clsx(mode === 'dark' && styles.activeMode)} onClick={() => setMode('dark')}>
                <IconifyIcon icon="tabler:moon" />
                Dark
              </button>
            </div>
          </div>

          <div className={styles.mockPanel}>
            <div className={styles.mockSidebar}>
              <span className={styles.logoBlock} />
              <i className={styles.activeIcon} />
              <i />
              <i />
              <i />
              <i />
            </div>

            <div className={styles.mockContent}>
              <div className={styles.mockTopbar}>
                <div>
                  <span />
                  <span />
                </div>
                <button type="button">Action</button>
              </div>

              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <b />
                  <h4>Leads</h4>
                  <p>128 active requests</p>
                  <button type="button">Manage</button>
                </div>
                <div className={styles.statCard}>
                  <b />
                  <h4>Downloads</h4>
                  <p>217 total files</p>
                  <button type="button">Review</button>
                </div>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.chartTop}>
                  <h4>Performance overview</h4>
                  <span />
                </div>
                <div className={styles.chartGrid}>
                  <div className={styles.gradientBar} />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ColorThemeSettingsPanel
