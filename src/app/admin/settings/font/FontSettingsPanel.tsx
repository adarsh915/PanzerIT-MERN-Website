'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { type CSSProperties, type DragEvent, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styles from './FontSettingsPanel.module.scss'

type FontKey = 'primary' | 'secondary' | 'heading' | 'body'
type SizeKey = 'body' | 'h1' | 'h2' | 'h3' | 'paragraph' | 'button' | 'menu'
type WeightKey = 'heading' | 'body' | 'button'
type LineHeightKey = 'body' | 'paragraph' | 'heading'
type SpacingKey = 'body' | 'heading' | 'button' | 'menu'
type TransformKey = 'heading' | 'body' | 'button'
type TextTransform = 'none' | 'uppercase' | 'capitalize' | 'lowercase'
type FontWeight = 400 | 500 | 600 | 700

type FontSettings = {
  fonts: Record<FontKey, string>
  sizes: Record<SizeKey, number>
  weights: Record<WeightKey, FontWeight>
  lineHeights: Record<LineHeightKey, number>
  spacing: Record<SpacingKey, number>
  transforms: Record<TransformKey, TextTransform>
}

// Uploaded custom font entry
interface UploadedFont {
  id: string
  name: string        // derived from filename, e.g. "MyFont"
  fileName: string    // original filename, e.g. "MyFont-Regular.ttf"
  objectUrl: string   // blob URL for @font-face src
  format: string      // 'truetype' | 'opentype' | 'woff' | 'woff2'
}

const ACCEPTED_FONT_TYPES = ['.ttf', '.otf', '.woff', '.woff2']
const ACCEPTED_MIME_TYPES = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', 'application/font-woff2']

const fontFormatMap: Record<string, string> = {
  ttf: 'truetype',
  otf: 'opentype',
  woff: 'woff',
  woff2: 'woff2',
}

const deriveFontName = (fileName: string): string => {
  // Strip extension, replace hyphens/underscores with spaces, trim
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim()
}

const fontOptions = ['Poppins', 'Roboto', 'Inter', 'Montserrat', 'Lato', 'Open Sans', 'Playfair Display', 'Raleway', 'Nunito', 'Source Sans Pro']

const defaultSettings: FontSettings = {
  fonts: {
    primary: 'Inter',
    secondary: 'Roboto',
    heading: 'Inter',
    body: 'Inter',
  },
  sizes: {
    body: 15,
    h1: 48,
    h2: 36,
    h3: 26,
    paragraph: 15,
    button: 14,
    menu: 14,
  },
  weights: {
    heading: 700,
    body: 400,
    button: 600,
  },
  lineHeights: {
    body: 1.55,
    paragraph: 1.7,
    heading: 1.15,
  },
  spacing: {
    body: 0,
    heading: 0,
    button: 0.5,
    menu: 0,
  },
  transforms: {
    heading: 'none',
    body: 'none',
    button: 'none',
  },
}

const fontFields: { key: FontKey; label: string }[] = [
  { key: 'primary', label: 'Primary Font' },
  { key: 'secondary', label: 'Secondary Font' },
  { key: 'heading', label: 'Heading Font' },
  { key: 'body', label: 'Body Font' },
]

const sizeFields: { key: SizeKey; label: string; min: number; max: number }[] = [
  { key: 'body', label: 'Body Font Size', min: 12, max: 20 },
  { key: 'h1', label: 'Heading H1', min: 28, max: 72 },
  { key: 'h2', label: 'Heading H2', min: 24, max: 48 },
  { key: 'h3', label: 'Heading H3', min: 18, max: 36 },
  { key: 'paragraph', label: 'Paragraph Size', min: 12, max: 20 },
  { key: 'button', label: 'Button Text Size', min: 10, max: 18 },
  { key: 'menu', label: 'Menu Font Size', min: 10, max: 18 },
]

const weightFields: { key: WeightKey; label: string }[] = [
  { key: 'heading', label: 'Heading Weight' },
  { key: 'body', label: 'Body Weight' },
  { key: 'button', label: 'Button Weight' },
]

const weights: { label: string; value: FontWeight }[] = [
  { label: 'Regular 400', value: 400 },
  { label: 'Medium 500', value: 500 },
  { label: 'Semi Bold 600', value: 600 },
  { label: 'Bold 700', value: 700 },
]

const lineHeightFields: { key: LineHeightKey; label: string; min: number; max: number }[] = [
  { key: 'body', label: 'Body Line Height', min: 1, max: 2.5 },
  { key: 'paragraph', label: 'Paragraph Line Height', min: 1, max: 2.5 },
  { key: 'heading', label: 'Heading Line Height', min: 0.8, max: 1.8 },
]

const spacingRows: { key: SpacingKey; label: string }[] = [
  { key: 'body', label: 'Body' },
  { key: 'heading', label: 'Heading' },
  { key: 'button', label: 'Button' },
  { key: 'menu', label: 'Menu' },
]

const spacingOptions = [
  { label: 'Normal', value: 0 },
  { label: 'Small', value: 0.5 },
  { label: 'Medium', value: 1 },
  { label: 'Large', value: 2 },
]

const transformRows: { key: TransformKey; label: string }[] = [
  { key: 'heading', label: 'Heading Transform' },
  { key: 'body', label: 'Body Transform' },
  { key: 'button', label: 'Button Transform' },
]

const transformOptions: { label: string; sample: string; value: TextTransform }[] = [
  { label: 'Normal', sample: 'Aa', value: 'none' },
  { label: 'Uppercase', sample: 'AA', value: 'uppercase' },
  { label: 'Capitalize', sample: 'Aa', value: 'capitalize' },
  { label: 'Lowercase', sample: 'aa', value: 'lowercase' },
]

const presets: { name: string; description: string; sample: string; settings: FontSettings }[] = [
  {
    name: 'Modern',
    description: 'Inter + clean',
    sample: 'Modern dashboard',
    settings: defaultSettings,
  },
  {
    name: 'Editorial',
    description: 'Playfair + elegant',
    sample: 'Editorial story',
    settings: {
      ...defaultSettings,
      fonts: { primary: 'Playfair Display', secondary: 'Lato', heading: 'Playfair Display', body: 'Lato' },
      sizes: { ...defaultSettings.sizes, h1: 56, h2: 40, h3: 28, paragraph: 16 },
      weights: { heading: 700, body: 400, button: 500 },
      lineHeights: { body: 1.65, paragraph: 1.8, heading: 1.05 },
    },
  },
  {
    name: 'Friendly',
    description: 'Poppins + rounded',
    sample: 'Friendly admin',
    settings: {
      ...defaultSettings,
      fonts: { primary: 'Poppins', secondary: 'Nunito', heading: 'Poppins', body: 'Nunito' },
      sizes: { ...defaultSettings.sizes, body: 16, button: 15, menu: 15 },
      weights: { heading: 600, body: 400, button: 600 },
    },
  },
  {
    name: 'Minimal',
    description: 'Roboto + compact',
    sample: 'Minimal control',
    settings: {
      ...defaultSettings,
      fonts: { primary: 'Roboto', secondary: 'Roboto', heading: 'Roboto', body: 'Roboto' },
      sizes: { body: 14, h1: 40, h2: 30, h3: 22, paragraph: 14, button: 13, menu: 13 },
      lineHeights: { body: 1.4, paragraph: 1.5, heading: 1 },
    },
  },
]

const sectionMeta: Record<string, { icon: string; subtitle: string }> = {
  family: { icon: 'tabler:typography', subtitle: 'Choose fonts for each typography role' },
  upload: { icon: 'tabler:upload', subtitle: 'Upload your own .ttf, .otf, .woff or .woff2 font files' },
  size: { icon: 'tabler:text-size', subtitle: 'Control scale across the interface' },
  weight: { icon: 'tabler:bold', subtitle: 'Set emphasis for important text' },
  height: { icon: 'tabler:line-height', subtitle: 'Tune vertical reading rhythm' },
  spacing: { icon: 'tabler:letter-spacing', subtitle: 'Adjust character spacing by text type' },
  transform: { icon: 'tabler:letter-case', subtitle: 'Control casing for common text groups' },
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const SectionTitle = ({ title, metaKey }: { title: string; metaKey: keyof typeof sectionMeta }) => (
  <div className={styles.sectionTitle}>
    <span className={styles.sectionIcon}>
      <IconifyIcon icon={sectionMeta[metaKey].icon} />
    </span>
    <div>
      <h3>{title}</h3>
      <p>{sectionMeta[metaKey].subtitle}</p>
    </div>
  </div>
)

const FontSettingsPanel = () => {
  const [settings, setSettings] = useState<FontSettings>(defaultSettings)
  const [darkMode, setDarkMode] = useState(false)
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // All available font names (built-in + uploaded)
  const allFontOptions = useMemo(() => [...fontOptions, ...uploadedFonts.map((f) => f.name)], [uploadedFonts])

  useEffect(() => {
    const fontQuery = fontOptions.map((font) => `family=${font.replaceAll(' ', '+')}:wght@400;500;600;700`).join('&')
    const href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`
    const existing = document.getElementById('admin-font-settings-google-fonts') as HTMLLinkElement | null

    if (existing) {
      existing.href = href
      return
    }

    const link = document.createElement('link')
    link.id = 'admin-font-settings-google-fonts'
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }, [])

  // Inject @font-face rules for uploaded fonts into document <head>
  useEffect(() => {
    uploadedFonts.forEach((font) => {
      const styleId = `custom-font-${font.id}`
      if (document.getElementById(styleId)) return
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `@font-face { font-family: "${font.name}"; src: url("${font.objectUrl}") format("${font.format}"); font-weight: normal; font-style: normal; }`
      document.head.appendChild(style)
    })
  }, [uploadedFonts])

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const valid = fileArray.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      return ACCEPTED_FONT_TYPES.includes(`.${ext}`) || ACCEPTED_MIME_TYPES.includes(file.type)
    })

    if (valid.length === 0) {
      toast.error('Please upload a valid font file (.ttf, .otf, .woff, .woff2)')
      return
    }

    const newFonts: UploadedFont[] = valid.map((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'ttf'
      const name = deriveFontName(file.name)
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        fileName: file.name,
        objectUrl: URL.createObjectURL(file),
        format: fontFormatMap[ext] ?? 'truetype',
      }
    })

    setUploadedFonts((prev) => {
      // Avoid duplicates by filename
      const existingNames = new Set(prev.map((f) => f.fileName))
      const unique = newFonts.filter((f) => !existingNames.has(f.fileName))
      if (unique.length < newFonts.length) {
        toast.warn('Some fonts were already uploaded and skipped')
      }
      if (unique.length > 0) {
        toast.success(`${unique.length} font${unique.length > 1 ? 's' : ''} uploaded successfully`)
      }
      return [...prev, ...unique]
    })
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) processFiles(event.target.files)
    // Reset input so same file can be re-uploaded if removed
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    if (event.dataTransfer.files) processFiles(event.dataTransfer.files)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const removeUploadedFont = (id: string) => {
    setUploadedFonts((prev) => {
      const font = prev.find((f) => f.id === id)
      if (font) {
        URL.revokeObjectURL(font.objectUrl)
        // Remove injected style tag
        document.getElementById(`custom-font-${font.id}`)?.remove()
        // Reset any font slot using this font back to Inter
        setSettings((s) => {
          const updatedFonts = { ...s.fonts }
          for (const key of Object.keys(updatedFonts) as FontKey[]) {
            if (updatedFonts[key] === font.name) updatedFonts[key] = 'Inter'
          }
          return { ...s, fonts: updatedFonts }
        })
      }
      return prev.filter((f) => f.id !== id)
    })
    toast.success('Font removed')
  }

  const cssVariables = useMemo(
    () => `--font-primary: "${settings.fonts.primary}", sans-serif;
--font-secondary: "${settings.fonts.secondary}", sans-serif;
--font-heading: "${settings.fonts.heading}", sans-serif;
--font-body: "${settings.fonts.body}", sans-serif;
--font-size-body: ${settings.sizes.body}px;
--font-size-h1: ${settings.sizes.h1}px;
--font-size-h2: ${settings.sizes.h2}px;
--font-size-h3: ${settings.sizes.h3}px;
--font-size-paragraph: ${settings.sizes.paragraph}px;
--font-size-button: ${settings.sizes.button}px;
--font-size-menu: ${settings.sizes.menu}px;
--font-weight-heading: ${settings.weights.heading};
--font-weight-body: ${settings.weights.body};
--font-weight-button: ${settings.weights.button};
--line-height-body: ${settings.lineHeights.body};
--line-height-paragraph: ${settings.lineHeights.paragraph};
--line-height-heading: ${settings.lineHeights.heading};
--letter-spacing-body: ${settings.spacing.body}px;
--letter-spacing-heading: ${settings.spacing.heading}px;
--letter-spacing-button: ${settings.spacing.button}px;
--letter-spacing-menu: ${settings.spacing.menu}px;
--text-transform-heading: ${settings.transforms.heading};
--text-transform-body: ${settings.transforms.body};
--text-transform-button: ${settings.transforms.button};`,
    [settings],
  )

  const panelVars = {
    '--font-primary': `"${settings.fonts.primary}", sans-serif`,
    '--font-secondary': `"${settings.fonts.secondary}", sans-serif`,
    '--font-heading': `"${settings.fonts.heading}", sans-serif`,
    '--font-body': `"${settings.fonts.body}", sans-serif`,
    '--font-size-body': `${settings.sizes.body}px`,
    '--font-size-h1': `${settings.sizes.h1}px`,
    '--font-size-h2': `${settings.sizes.h2}px`,
    '--font-size-h3': `${settings.sizes.h3}px`,
    '--font-size-paragraph': `${settings.sizes.paragraph}px`,
    '--font-size-button': `${settings.sizes.button}px`,
    '--font-size-menu': `${settings.sizes.menu}px`,
    '--font-weight-heading': settings.weights.heading,
    '--font-weight-body': settings.weights.body,
    '--font-weight-button': settings.weights.button,
    '--line-height-body': settings.lineHeights.body,
    '--line-height-paragraph': settings.lineHeights.paragraph,
    '--line-height-heading': settings.lineHeights.heading,
    '--letter-spacing-body': `${settings.spacing.body}px`,
    '--letter-spacing-heading': `${settings.spacing.heading}px`,
    '--letter-spacing-button': `${settings.spacing.button}px`,
    '--letter-spacing-menu': `${settings.spacing.menu}px`,
    '--text-transform-heading': settings.transforms.heading,
    '--text-transform-body': settings.transforms.body,
    '--text-transform-button': settings.transforms.button,
  } as CSSProperties

  const updateFont = (key: FontKey, value: string) => {
    setSettings((current) => ({ ...current, fonts: { ...current.fonts, [key]: value } }))
  }

  const updateSize = (field: (typeof sizeFields)[number], value: number) => {
    setSettings((current) => ({ ...current, sizes: { ...current.sizes, [field.key]: clamp(value, field.min, field.max) } }))
  }

  const updateWeight = (key: WeightKey, value: FontWeight) => {
    setSettings((current) => ({ ...current, weights: { ...current.weights, [key]: value } }))
  }

  const updateLineHeight = (field: (typeof lineHeightFields)[number], value: number) => {
    setSettings((current) => ({ ...current, lineHeights: { ...current.lineHeights, [field.key]: clamp(value, field.min, field.max) } }))
  }

  const updateSpacing = (key: SpacingKey, value: number) => {
    setSettings((current) => ({ ...current, spacing: { ...current.spacing, [key]: value } }))
  }

  const updateTransform = (key: TransformKey, value: TextTransform) => {
    setSettings((current) => ({ ...current, transforms: { ...current.transforms, [key]: value } }))
  }

  const copyVariables = async () => {
    await navigator.clipboard.writeText(`:root {\n${cssVariables.split('\n').map((line) => `  ${line}`).join('\n')}\n}`)
    toast.success('Font CSS variables copied')
  }

  const previewPanel = () => {
    document.getElementById('font-preview-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.shell} style={panelVars}>
      <div className={styles.header}>
        <div>
          <h2>Font Settings</h2>
          <p>Customize typography across your admin panel</p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={previewPanel}>
            <IconifyIcon icon="tabler:eye" />
            Preview
          </button>
          <button type="button" onClick={() => setSettings(defaultSettings)}>
            <IconifyIcon icon="tabler:refresh" />
            Reset Default
          </button>
          <button type="button" className={styles.primaryAction} onClick={() => toast.success('Font settings saved')}>
            <IconifyIcon icon="tabler:device-floppy" />
            Save Font Settings
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.settings}>
          <section className={styles.panel}>
            <SectionTitle title="Font Family" metaKey="family" />
            <div className={styles.fontGrid}>
              {fontFields.map((field) => (
                <label className={styles.fontField} key={field.key}>
                  <span>{field.label}</span>
                  <select value={settings.fonts[field.key]} onChange={(event) => updateFont(field.key, event.target.value)} style={{ fontFamily: `"${settings.fonts[field.key]}", sans-serif` }}>
                    <optgroup label="Built-in Fonts">
                      {fontOptions.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: `"${font}", sans-serif` }}>
                          {font}
                        </option>
                      ))}
                    </optgroup>
                    {uploadedFonts.length > 0 && (
                      <optgroup label="Your Uploaded Fonts">
                        {uploadedFonts.map((font) => (
                          <option key={font.id} value={font.name} style={{ fontFamily: `"${font.name}", sans-serif` }}>
                            {font.name} (custom)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <small style={{ fontFamily: `"${settings.fonts[field.key]}", sans-serif` }}>The quick brown fox previews this font.</small>
                </label>
              ))}
            </div>
          </section>

          {/* ── Custom Font Upload ── */}
          <section className={styles.panel}>
            <SectionTitle title="Upload Custom Font" metaKey="upload" />

            {/* Drop zone */}
            <div
              className={clsx(styles.dropZone, isDragOver && styles.dropZoneActive)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload font files"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                multiple
                className={styles.hiddenInput}
                onChange={handleFileInput}
                aria-hidden="true"
              />
              <span className={styles.dropIcon}>
                <IconifyIcon icon={isDragOver ? 'tabler:file-download' : 'tabler:upload'} />
              </span>
              <strong>{isDragOver ? 'Drop to upload' : 'Drag & drop font files here'}</strong>
              <span>or click to browse &mdash; .ttf, .otf, .woff, .woff2 supported</span>
            </div>

            {/* Uploaded font list */}
            {uploadedFonts.length > 0 && (
              <div className={styles.uploadedList}>
                <p className={styles.subtleLabel}>{uploadedFonts.length} custom font{uploadedFonts.length > 1 ? 's' : ''} uploaded</p>
                {uploadedFonts.map((font) => (
                  <div key={font.id} className={styles.uploadedItem}>
                    <span className={styles.uploadedIcon}>
                      <IconifyIcon icon="tabler:file-type-ttf" />
                    </span>
                    <div className={styles.uploadedMeta}>
                      <strong style={{ fontFamily: `"${font.name}", sans-serif` }}>{font.name}</strong>
                      <small>{font.fileName} &middot; {font.format}</small>
                      <em style={{ fontFamily: `"${font.name}", sans-serif` }}>
                        The quick brown fox jumps over the lazy dog
                      </em>
                    </div>
                    <button
                      type="button"
                      className={styles.removeFont}
                      onClick={(e) => { e.stopPropagation(); removeUploadedFont(font.id) }}
                      aria-label={`Remove ${font.name}`}
                      title="Remove font"
                    >
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <SectionTitle title="Font Size" metaKey="size" />
            <div className={styles.subtleLabel}>Size scale</div>
            <div className={styles.fieldStack}>
              {sizeFields.map((field) => (
                <div className={styles.sliderRow} key={field.key}>
                  <div className={styles.sliderMeta}>
                    <span>{field.label}</span>
                    <strong>{settings.sizes[field.key]}px</strong>
                  </div>
                  <input type="range" min={field.min} max={field.max} value={settings.sizes[field.key]} onChange={(event) => updateSize(field, Number(event.target.value))} />
                  <input type="number" min={field.min} max={field.max} value={settings.sizes[field.key]} onChange={(event) => updateSize(field, Number(event.target.value))} />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <SectionTitle title="Font Weight" metaKey="weight" />
            <div className={styles.fieldStack}>
              {weightFields.map((field) => (
                <div className={styles.optionRow} key={field.key}>
                  <span>{field.label}</span>
                  <div className={styles.pills}>
                    {weights.map((weight) => (
                      <button type="button" key={weight.value} className={clsx(settings.weights[field.key] === weight.value && styles.activePill)} onClick={() => updateWeight(field.key, weight.value)}>
                        {weight.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <SectionTitle title="Line Height" metaKey="height" />
            <div className={styles.fieldStack}>
              {lineHeightFields.map((field) => (
                <div className={styles.sliderRow} key={field.key}>
                  <div className={styles.sliderMeta}>
                    <span>{field.label}</span>
                    <strong>{settings.lineHeights[field.key].toFixed(1)}</strong>
                  </div>
                  <input type="range" min={field.min} max={field.max} step="0.1" value={settings.lineHeights[field.key]} onChange={(event) => updateLineHeight(field, Number(event.target.value))} />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <SectionTitle title="Letter Spacing" metaKey="spacing" />
            <div className={styles.fieldStack}>
              {spacingRows.map((row) => (
                <div className={styles.optionRow} key={row.key}>
                  <span>{row.label}</span>
                  <div className={styles.pills}>
                    {spacingOptions.map((option) => (
                      <button type="button" key={option.value} className={clsx(settings.spacing[row.key] === option.value && styles.activePill)} onClick={() => updateSpacing(row.key, option.value)}>
                        {option.label} ({option.value}px)
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <SectionTitle title="Text Transform" metaKey="transform" />
            <div className={styles.fieldStack}>
              {transformRows.map((row) => (
                <div className={styles.optionRow} key={row.key}>
                  <span>{row.label}</span>
                  <div className={styles.pills}>
                    {transformOptions.map((option) => (
                      <button type="button" key={option.value} className={clsx(settings.transforms[row.key] === option.value && styles.activePill)} onClick={() => updateTransform(row.key, option.value)}>
                        <b>{option.sample}</b>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        <aside className={clsx(styles.preview, darkMode && styles.darkPreview)} id="font-preview-panel">
          <div className={styles.previewTop}>
            <div>
              <h3>Live Preview Panel</h3>
              <span>{darkMode ? 'Dark mode' : 'Light mode'}</span>
            </div>
            <button type="button" className={clsx(styles.modeToggle, darkMode && styles.modeOn)} onClick={() => setDarkMode((value) => !value)}>
              <span />
            </button>
          </div>

          <div className={styles.previewCard}>
            <section className={styles.headingPreview}>
              <span>Heading Preview</span>
              <h1>Admin Typography</h1>
              <h2>Content Control</h2>
              <h3>Design System</h3>
            </section>

            <section className={styles.paragraphPreview}>
              <span>Paragraph Preview</span>
              <p>
                Manage clear, readable typography for your dashboard. This preview shows how body text feels across multiple lines, with current spacing, font weight, and line height applied.
              </p>
            </section>

            <section>
              <span className={styles.previewLabel}>Button Preview</span>
              <button type="button" className={styles.sampleButton}>Save Changes</button>
            </section>

            <section className={styles.menuPreview}>
              <span>Menu Text Preview</span>
              <ul>
                <li>Dashboard</li>
                <li>Blog Posts</li>
                <li>Color Theme</li>
                <li>Font Settings</li>
              </ul>
            </section>

            <section className={styles.miniCard}>
              <h4>Card Title Preview</h4>
              <p>Typography settings combine here for cards, labels, and body text in a compact admin surface.</p>
            </section>
          </div>

          <button type="button" className={styles.copyButton} onClick={copyVariables}>
            <IconifyIcon icon="tabler:copy" />
            Copy CSS Variables
          </button>
        </aside>
      </div>
    </div>
  )
}

export default FontSettingsPanel
