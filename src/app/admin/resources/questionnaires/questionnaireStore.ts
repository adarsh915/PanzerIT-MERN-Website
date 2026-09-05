'use server'

import pool from '@/lib/db'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}

// ========================
// TYPES
// ========================

export type Questionnaire = {
  id: string
  name: string
  description: string
  templateFileUrl: string
  templateFilename: string
  departmentOptions: string[]
  status: 'active' | 'inactive'
  createdAt: string
}

export type QuestionnaireFormData = {
  name: string
  description: string
  templateFileUrl: string
  templateFilename: string
  departmentOptions: string[]
  status: 'active' | 'inactive'
}

export type FormSubmission = {
  id: string
  questionnaireId: string
  questionnaireName: string
  firstName: string
  lastName: string
  email: string
  department: string
  notes: string
  uploadedFileUrl: string
  uploadedFilename: string
  isRead: boolean
  createdAt: string
}

// ========================
// QUESTIONNAIRES CRUD
// ========================

export const readQuestionnaires = async (): Promise<Questionnaire[]> => {
  const [rows] = await pool.query('SELECT * FROM resource_questionnaires ORDER BY created_at DESC')
  return (rows as any[]).map(mapQuestionnaire)
}

export const readActiveQuestionnaires = async (): Promise<Questionnaire[]> => {
  const [rows] = await pool.query("SELECT * FROM resource_questionnaires WHERE status = 'active' ORDER BY name ASC")
  return (rows as any[]).map(mapQuestionnaire)
}

export const findQuestionnaire = async (id: string): Promise<Questionnaire | undefined> => {
  const [rows] = await pool.query('SELECT * FROM resource_questionnaires WHERE id = ? LIMIT 1', [id])
  const row = (rows as any[])[0]
  return row ? mapQuestionnaire(row) : undefined
}

export const createQuestionnaire = async (data: QuestionnaireFormData): Promise<Questionnaire> => {
  await checkAuth()
  const id = `qst${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const deptJson = JSON.stringify(data.departmentOptions || [])

  await pool.query(
    `INSERT INTO resource_questionnaires 
     (id, name, description, template_file_url, template_filename, department_options, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.description || '', data.templateFileUrl || '', data.templateFilename || '', deptJson, data.status || 'active', createdAt]
  )

  return { ...data, id, departmentOptions: data.departmentOptions || [], createdAt }
}

export const updateQuestionnaire = async (id: string, data: QuestionnaireFormData): Promise<void> => {
  await checkAuth()
  const deptJson = JSON.stringify(data.departmentOptions || [])
  await pool.query(
    `UPDATE resource_questionnaires 
     SET name = ?, description = ?, template_file_url = ?, template_filename = ?, department_options = ?, status = ?
     WHERE id = ?`,
    [data.name, data.description || '', data.templateFileUrl || '', data.templateFilename || '', deptJson, data.status || 'active', id]
  )
}

export const deleteQuestionnaire = async (id: string): Promise<void> => {
  await checkAuth()
  await pool.query('DELETE FROM resource_questionnaires WHERE id = ?', [id])
}

// ========================
// SUBMISSIONS
// ========================

export const readSubmissions = async (): Promise<FormSubmission[]> => {
  const [rows] = await pool.query('SELECT * FROM resource_form_submissions ORDER BY created_at DESC')
  return (rows as any[]).map(mapSubmission)
}

export const readSubmissionsByQuestionnaire = async (questionnaireId: string): Promise<FormSubmission[]> => {
  const [rows] = await pool.query(
    'SELECT * FROM resource_form_submissions WHERE questionnaire_id = ? ORDER BY created_at DESC',
    [questionnaireId]
  )
  return (rows as any[]).map(mapSubmission)
}

export const countUnreadSubmissions = async (): Promise<number> => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM resource_form_submissions WHERE is_read = 0')
  return (rows as any[])[0]?.total || 0
}

export const getUnreadSubmissions = async (limit = 5): Promise<FormSubmission[]> => {
  const [rows] = await pool.query(
    'SELECT * FROM resource_form_submissions WHERE is_read = 0 ORDER BY created_at DESC LIMIT ?',
    [limit]
  )
  return (rows as any[]).map(mapSubmission)
}

export const markSubmissionRead = async (id: string): Promise<void> => {
  await checkAuth()
  await pool.query('UPDATE resource_form_submissions SET is_read = 1 WHERE id = ?', [id])
}

export const markAllSubmissionsRead = async (): Promise<void> => {
  await checkAuth()
  await pool.query('UPDATE resource_form_submissions SET is_read = 1')
}

export const deleteSubmission = async (id: string): Promise<void> => {
  await checkAuth()
  await pool.query('DELETE FROM resource_form_submissions WHERE id = ?', [id])
}

export const createSubmission = async (data: {
  questionnaireId: string
  questionnaireName: string
  firstName: string
  lastName: string
  email: string
  department: string
  notes: string
  uploadedFileUrl: string
  uploadedFilename: string
}): Promise<FormSubmission> => {
  const id = `sub${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

  await pool.query(
    `INSERT INTO resource_form_submissions 
     (id, questionnaire_id, questionnaire_name, first_name, last_name, email, department, notes, uploaded_file_url, uploaded_filename, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, data.questionnaireId, data.questionnaireName, data.firstName, data.lastName, data.email, data.department, data.notes, data.uploadedFileUrl, data.uploadedFilename, createdAt]
  )

  return {
    id,
    questionnaireId: data.questionnaireId,
    questionnaireName: data.questionnaireName,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    department: data.department,
    notes: data.notes,
    uploadedFileUrl: data.uploadedFileUrl,
    uploadedFilename: data.uploadedFilename,
    isRead: false,
    createdAt,
  }
}

// ========================
// HELPERS
// ========================

const mapQuestionnaire = (row: any): Questionnaire => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  templateFileUrl: row.template_file_url || '',
  templateFilename: row.template_filename || '',
  departmentOptions: (() => {
    try { return JSON.parse(row.department_options || '[]') } catch { return [] }
  })(),
  status: row.status,
  createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
})

const mapSubmission = (row: any): FormSubmission => ({
  id: row.id,
  questionnaireId: row.questionnaire_id || '',
  questionnaireName: row.questionnaire_name || '',
  firstName: row.first_name || '',
  lastName: row.last_name || '',
  email: row.email || '',
  department: row.department || '',
  notes: row.notes || '',
  uploadedFileUrl: row.uploaded_file_url || '',
  uploadedFilename: row.uploaded_filename || '',
  isRead: !!row.is_read,
  createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
})
