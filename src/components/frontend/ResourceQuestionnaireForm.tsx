'use client'

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import IconifyIcon from '../wrappers/IconifyIcon'
import styles from './ResourceQuestionnaireForm.module.scss'

type Questionnaire = {
  id: string
  name: string
  description: string
  templateFileUrl: string
  templateFilename: string
  departmentOptions: string[]
}

type Props = {
  questionnaire: Questionnaire;
  onCancel: () => void;
}

export default function ResourceQuestionnaireForm({ questionnaire, onCancel }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    notes: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv']
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) {
      toast.error('Unsupported file type. Please upload a document or spreadsheet.')
      e.target.value = ''
      return
    }
    setFile(f)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill in your details')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('questionnaireId', questionnaire.id)
      fd.append('questionnaireName', questionnaire.name)
      fd.append('firstName', form.firstName)
      fd.append('lastName', form.lastName)
      fd.append('email', form.email)
      fd.append('department', form.department)
      fd.append('notes', form.notes)
      if (file) fd.append('file', file)

      const res = await fetch('/api/resource-form/submit', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      toast.success('Submitted successfully! Thank you.')
      
      // Reset form
      setForm({ firstName: '', lastName: '', email: '', department: '', notes: '' })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      onCancel() // Close form on success
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{questionnaire.name}</h3>
      <p className={styles.subtitle}>Please fill out the form below to request this resource.</p>

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.formContent}>
          {questionnaire.description && (
            <p className={styles.description}>{questionnaire.description}</p>
          )}

            <div className={styles.sectionTitle}>YOUR DETAILS</div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>First name</label>
                <input required type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First Name" />
              </div>
              <div className={styles.field}>
                <label>Last name</label>
                <input required type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last Name" />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email address</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>

            {questionnaire.departmentOptions.length > 0 && (
              <div className={styles.field}>
                <label>Department / Team</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                  <option value="">Select department</option>
                  {questionnaire.departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            {questionnaire.templateFileUrl && (
              <>
                <div className={styles.sectionTitle}>EXCEL TEMPLATE</div>
                <div className={styles.templateBox}>
                  <div className={styles.templateInfo}>
                    <IconifyIcon icon="vscode-icons:file-type-excel" className={styles.fileIcon} />
                    <div>
                      <div className={styles.templateName}>{questionnaire.templateFilename || 'Downloadable Template'}</div>
                      <div className={styles.templateDesc}>Download, fill in your data, then upload below</div>
                    </div>
                  </div>
                  <a href={questionnaire.templateFileUrl} target="_blank" rel="noreferrer" className={styles.downloadBtn}>
                    <IconifyIcon icon="tabler:download" /> Download
                  </a>
                </div>
              </>
            )}

            <div className={styles.sectionTitle}>UPLOAD FILLED SHEET</div>
            <div className={styles.uploadArea} onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => {
              e.preventDefault()
              if (e.dataTransfer.files?.[0]) {
                const f = e.dataTransfer.files[0]
                setFile(f)
              }
            }}>
              {file ? (
                <div className={styles.fileSelected}>
                  <IconifyIcon icon="tabler:file-check" />
                  <span>{file.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }}><IconifyIcon icon="tabler:x" /></button>
                </div>
              ) : (
                <>
                  <IconifyIcon icon="tabler:upload" className={styles.uploadIcon} />
                  <div className={styles.uploadText}>Drag & drop your file here, or click to browse</div>
                  <div className={styles.uploadSub}>Accepts .xlsx, .xls, .csv, .pdf, .doc, .docx</div>
                </>
              )}
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

            <div className={styles.field}>
              <label>Notes (optional)</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any extra details or context..."></textarea>
            </div>

              <div className={styles.submitActions}>
                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? <IconifyIcon icon="tabler:loader-2" className="spin" /> : <IconifyIcon icon="tabler:send" />}
                  {submitting ? 'Submitting...' : 'Submit form'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
          </div>
      </form>
    </div>
  )
}
