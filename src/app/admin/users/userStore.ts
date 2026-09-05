'use server'

import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getSessionUser } from '@/lib/session'

async function checkAdminAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser || sessionUser.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators can manage users')
  }
  return sessionUser
}

export type User = {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'author'
  createdAt: string
}

export type UserFormData = {
  name: string
  email: string
  password?: string
  role: 'admin' | 'manager' | 'author'
}

export const readUsers = async (): Promise<User[]> => {
  await checkAdminAuth()
  const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || 'admin',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const createUser = async (data: UserFormData): Promise<{ success: boolean, message?: string }> => {
  await checkAdminAuth()

  if (!data.email || !data.password || !data.name) {
    return { success: false, message: 'Name, email, and password are required' }
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [data.email])
  if ((existing as any[]).length > 0) {
    return { success: false, message: 'A user with this email already exists' }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)
  
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [data.name, data.email, hashedPassword, data.role || 'admin']
  )

  return { success: true }
}

export const updateUser = async (id: number, data: UserFormData): Promise<{ success: boolean, message?: string }> => {
  await checkAdminAuth()

  if (!data.email || !data.name) {
    return { success: false, message: 'Name and email are required' }
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [data.email, id])
  if ((existing as any[]).length > 0) {
    return { success: false, message: 'A user with this email already exists' }
  }

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    await pool.query(
      'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?',
      [data.name, data.email, hashedPassword, data.role || 'admin', id]
    )
  } else {
    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [data.name, data.email, data.role || 'admin', id]
    )
  }

  return { success: true }
}

export const deleteUser = async (id: number): Promise<{ success: boolean, message?: string }> => {
  const sessionUser = await checkAdminAuth()
  
  if (sessionUser.id === id) {
    return { success: false, message: 'You cannot delete your own account' }
  }

  await pool.query('DELETE FROM users WHERE id = ?', [id])
  return { success: true }
}
