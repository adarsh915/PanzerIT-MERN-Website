'use client'

import React, { useState, ErrorInfo } from 'react'
import { writeSetting } from '@/app/admin/settings/settingsStore'
import { useRouter } from 'next/navigation'
import ColorPicker from 'react-best-gradient-color-picker'
import styles from './ThemeSettingsPanel.module.scss'

interface ThemeSettingsPanelProps {
  initialColors: Record<string, string>
}

class PickerErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Gradient Picker cannot parse this complex value:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '16px', maxWidth: '300px', background: '#fff' }}>
          <p style={{ color: '#e53e3e', fontSize: '13px', fontWeight: 600 }}>This complex gradient cannot be edited visually.</p>
          <p style={{ color: '#4a5568', fontSize: '12px', marginTop: '8px' }}>Please use the text input below to modify it.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const defaultColors = {
  '--theme-color': '#061153',
  '--theme-navy-dark': '#061153',
  '--theme-blue-light': '#79c6ff',
  '--theme-navy-darker': '#061238',
  '--theme-blue-medium': '#2f63dd',
  '--theme-navy-medium': '#123b88',
  '--theme-blue-bright': '#2b72ff',
  '--theme-navy-slate': '#273553',
  '--theme-navy-deep': '#07133d',
  '--theme-navy-slate-light': '#34405e',
  '--theme-blue-dark': '#051372',
  '--dark-color3': '#000000',
  '--bs-bg-color2': '#f3f6fe',
  '--bs-bg-color23': '#eef4ff',
  '--bs-bg-color24': '#fbfdff',
  '--bs-bg-color25': '#051372',
  '--light-color': '#f4f7ff',
  '--light-color2': '#e8edfa',
  '--white-color': '#ffffff',
  '--cardmention': '#ffffff',
  '--card-hover-light': 'radial-gradient(circle at 10% 18%, rgba(255, 255, 255, 0.95) 0 16%, rgba(255, 255, 255, 0) 34%), radial-gradient(circle at 90% 0%, rgba(220, 246, 255, 0.95) 0 20%, rgba(220, 246, 255, 0) 46%), linear-gradient(135deg, #d9f4ff 0%, #eefbff 45%, #c7ecff 100%)',
  '--footer-bg': '#0b1322',
  '--footer-text-main': '#dde2ec',
  '--footer-text-second': '#7d889c',
  '--footer-text-hover': '#3a8bf5',
  '--footer-border': '#1c2638',
  '--footer-input-bg': '#161f30',
  '--hero-bg': 'linear-gradient(135deg, #0a1628 0%, #1a2847 25%, #0d1b3a 50%, #162640 75%, #0a1628 100%)',
  '--hero-text-color': '#ffffff',
  '--hero-btn-bg': '#e76b1f',
  '--text-light': '#ffffff',
}

const colorLabels: Record<string, string> = {
  '--theme-color': 'Primary Accent',
  '--theme-navy-dark': 'Primary Heading Text',
  '--theme-blue-light': 'Primary Light Accent',
  '--theme-navy-darker': 'Primary Dark Text',
  '--theme-blue-medium': 'Primary Hover State',
  '--theme-navy-medium': 'Secondary Dark Accent',
  '--theme-blue-bright': 'Primary Bright Accent',
  '--theme-navy-slate': 'Tertiary Text',
  '--theme-navy-deep': 'Primary Body Text',
  '--theme-navy-slate-light': 'Secondary Body Text',
  '--theme-blue-dark': 'Tertiary Dark Accent',
  '--dark-color3': 'Base Dark Contrast',
  '--bs-bg-color2': 'Tertiary Surface Background',
  '--bs-bg-color23': 'Primary Surface Background',
  '--bs-bg-color24': 'Alternative Surface Background',
  '--bs-bg-color25': 'Quaternary Surface Background',
  '--light-color': 'Input Surface Background',
  '--light-color2': 'Secondary Surface Background',
  '--white-color': 'Button Text Color',
  '--cardmention': 'primary background',
  '--card-hover-light': 'Card Hover Light',
  '--footer-bg': 'Footer Surface',
  '--footer-text-main': 'Footer Primary Text',
  '--footer-text-second': 'Footer Secondary Text',
  '--footer-text-hover': 'Footer Hover State',
  '--footer-border': 'Footer Divider',
  '--footer-input-bg': 'Footer Input Surface',
  '--hero-bg': 'Hero Surface Gradient',
  '--hero-text-color': 'Hero Primary Text',
  '--hero-btn-bg': 'Hero Primary Action',
  '--text-light': 'Light Text Color',
}

const colorCategories: Record<string, string[]> = {
  'Global Theme Colors': [
    '--theme-color',
    '--theme-blue-medium',
    '--theme-blue-light',
    '--theme-blue-bright',
    '--theme-blue-dark',
    // '--theme-navy-darker',
    // '--theme-navy-medium',
    // '--dark-color3',
  ],
  'Typography & Text Colors': [
    '--theme-navy-dark',
    '--theme-navy-deep',
    '--theme-navy-slate-light',
    '--theme-navy-slate',
    '--text-light',
    '--theme-navy-darker',
  ],
  'Card & Surface Backgrounds': [
    '--bs-bg-color23',
    '--white-color',
    '--bs-bg-color2',
    '--bs-bg-color24',
    '--bs-bg-color25',
    '--light-color',
    '--light-color2',
    '--cardmention',
    '--card-hover-light'
  ],
  'Hero Section': [
    '--hero-bg',
    '--hero-text-color',
    '--hero-btn-bg',
  ],
  'Footer Section': [
    '--footer-bg',
    '--footer-text-main',
    '--footer-text-second',
    '--footer-text-hover',
    '--footer-border',
    '--footer-input-bg',
  ]
}

import { setThemePreview, clearThemePreview } from '../settingsStore'

export default function ThemeSettingsPanel({ initialColors }: ThemeSettingsPanelProps) {
  const router = useRouter()
  const [colors, setColors] = useState<Record<string, string>>({
    ...defaultColors,
    ...initialColors, // Override defaults with saved colors if any exist
  })
  const [activePicker, setActivePicker] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save the entire object as JSON in the database
      await writeSetting('frontend_theme_colors', colors)
      // Also clear any preview so it doesn't conflict
      await clearThemePreview()
      alert('Theme colors saved successfully!')
      router.refresh() // Refresh to reflect in layout
    } catch (error) {
      console.error(error)
      alert('Failed to save theme colors.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = async () => {
    setIsSaving(true)
    try {
      await setThemePreview(colors)
      window.open('/', '_blank')
    } catch (error) {
      console.error(error)
      alert('Failed to set preview colors.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all colors to their defaults?')) return

    setIsSaving(true)
    try {
      // Save an empty object or the explicit defaults. Saving defaults guarantees it resets on the frontend.
      await writeSetting('frontend_theme_colors', defaultColors)
      await clearThemePreview()
      setColors(defaultColors)
      alert('Theme colors reset to defaults.')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to reset theme colors.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <h3>Dynamic Theme Colors</h3>
            <p>Customize the primary and secondary colors used across the frontend website.</p>
          </div>
          <div className={styles.actions}>
            <button
              onClick={handleReset}
              disabled={isSaving}
              className={styles.resetBtn}
            >
              Reset to Defaults
            </button>
            <button
              onClick={handlePreview}
              disabled={isSaving}
              className={styles.previewBtn}
            >
              {isSaving ? 'Loading...' : 'Preview on Frontend'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={styles.saveBtn}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className={styles.categoriesWrap}>
          {Object.entries(colorCategories).map(([category, keys]) => (
            <div key={category} className={styles.categoryBlock}>
              <h4 className={styles.categoryTitle}>{category}</h4>
              <div className={styles.grid}>
                {keys.map((key) => (
                  <div
                    key={key}
                    className={styles.colorItem}
                    style={{ zIndex: activePicker === key ? 100 : undefined }}
                  >
                    <label className={styles.colorLabel}>
                      <span>{colorLabels[key] || key}</span>
                      <span className={styles.hex}>{colors[key]}</span>
                    </label>
                    <div className={styles.colorInputRow}>
                      <div className={styles.swatchContainer}>
                        <div
                          className={styles.colorSwatch}
                          style={{ background: colors[key] || '#000000' }}
                          onClick={() => setActivePicker(key)}
                        />
                        {activePicker === key && (
                          <div className={styles.popover}>
                            <div className={styles.cover} onClick={() => setActivePicker(null)} />
                            <div style={{ position: 'relative', zIndex: 9999 }}>
                              <PickerErrorBoundary>
                                <ColorPicker
                                  value={(colors[key] || '').match(/gradient\(/g)?.length! > 1 ? 'linear-gradient(135deg, #d9f4ff 0%, #c7ecff 100%)' : (colors[key] || '#000000')}
                                  onChange={(value) => handleColorChange(key, value)}
                                />
                              </PickerErrorBoundary>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={colors[key] || ''}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className={styles.textInput}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
