'use server'

import { readSetting, writeSetting } from '../settingsStore'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
  if (sessionUser.role !== 'admin') {
    throw new Error('Forbidden: Only admins can manage settings')
  }
}

export type CustomCode = {
  headScripts: string   // Injected inside <head>
  headCSS: string       // <style> injected inside <head>
  footerScripts: string // Injected just before </body>
}

const DEFAULT_CUSTOM_CODE: CustomCode = {
  headScripts: '',
  headCSS: '',
  footerScripts: '',
}

const SETTING_KEY = 'custom_code'

export const getCustomCode = async (): Promise<CustomCode> => {
  return await readSetting<CustomCode>(SETTING_KEY, DEFAULT_CUSTOM_CODE)
}

export const saveCustomCode = async (
  data: CustomCode
): Promise<{ success: boolean; error?: string }> => {
  try {
    await checkAuth()
    await writeSetting(SETTING_KEY, data)
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
