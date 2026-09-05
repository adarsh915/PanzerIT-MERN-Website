'use server'

import pool from '@/lib/db'
import type { Faq, FaqFormData } from './faqTypes'

import { toSlug } from '../solutions/solutionHelpers'

export const readFaqs = async (): Promise<Faq[]> => {
  const [rows] = await pool.query('SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC')
  return (rows as any[]).map(row => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    slug: row.slug,
    order: row.sort_order,
    status: row.status,
    pageKey: row.page_key || 'global',
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    metaKeywords: row.meta_keywords || '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const readActiveFaqs = async (): Promise<Faq[]> => {
  const [rows] = await pool.query("SELECT * FROM faqs WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC")
  return (rows as any[]).map(row => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    slug: row.slug,
    order: row.sort_order,
    status: row.status,
    pageKey: row.page_key || 'global',
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    metaKeywords: row.meta_keywords || '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const findFaqsByPageKey = async (pageKey: string): Promise<Faq[]> => {
  const [rows] = await pool.query("SELECT * FROM faqs WHERE status = 'active' AND FIND_IN_SET(?, page_key) ORDER BY sort_order ASC, created_at DESC", [pageKey])
  return (rows as any[]).map(row => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    slug: row.slug,
    order: row.sort_order,
    status: row.status,
    pageKey: row.page_key || 'global',
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    metaKeywords: row.meta_keywords || '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}


export const createFaq = async (data: FaqFormData): Promise<Faq> => {
  const id = `f${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.question)

  await pool.query(
    `INSERT INTO faqs (id, question, answer, slug, sort_order, status, page_key, meta_title, meta_description, meta_keywords, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.question,
      data.answer,
      slug,
      data.order || 0,
      data.status || 'active',
      data.pageKey || 'global',
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      createdAt
    ]
  )

  return {
    ...data,
    id,
    slug,
    order: data.order || 0,
    status: data.status || 'active',
    pageKey: data.pageKey || 'global',
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
    metaKeywords: data.metaKeywords || '',
    createdAt
  }
}

export const updateFaq = async (id: string, data: FaqFormData): Promise<Faq | undefined> => {
  const slug = toSlug(data.slug || data.question)

  await pool.query(
    `UPDATE faqs SET question = ?, answer = ?, slug = ?, sort_order = ?, status = ?, page_key = ?, meta_title = ?, meta_description = ?, meta_keywords = ? WHERE id = ?`,
    [
      data.question,
      data.answer,
      slug,
      data.order || 0,
      data.status || 'active',
      data.pageKey || 'global',
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      id
    ]
  )

  return {
    ...data,
    id,
    slug,
    order: data.order || 0,
    status: data.status || 'active',
    pageKey: data.pageKey || 'global',
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
    metaKeywords: data.metaKeywords || '',
    createdAt: new Date().toISOString()
  }
}

export const deleteFaq = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM faqs WHERE id = ?', [id])
}

export const findFaq = async (id: string): Promise<Faq | undefined> => {
  const [rows] = await pool.query('SELECT * FROM faqs WHERE id = ? LIMIT 1', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    slug: row.slug,
    order: row.sort_order,
    status: row.status,
    pageKey: row.page_key || 'global',
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    metaKeywords: row.meta_keywords || '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}
