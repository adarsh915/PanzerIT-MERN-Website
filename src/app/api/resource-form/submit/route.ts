import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createSubmission } from '@/app/admin/resources/questionnaires/questionnaireStore'
import { readFooterSettings } from '@/app/admin/settings/footer/footerSettingsStore'
import { sendQuestionnaireEmail } from '@/lib/mailer'
import { createRateLimiter } from '@/lib/rateLimit'

// Max 3 form submissions per IP per 10 minutes (prevents email bombing of admin)
const limiter = createRateLimiter('resource-form', { windowMs: 10 * 60_000, max: 3 })

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { limited, retryAfterSecs } = limiter.check(ip)
  if (limited) {
    return NextResponse.json(
      { error: `Too many submissions. Please wait ${retryAfterSecs}s before trying again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } }
    )
  }

  try {
    const formData = await request.formData()

    const questionnaireId = formData.get('questionnaireId') as string
    const questionnaireName = formData.get('questionnaireName') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const department = formData.get('department') as string
    const notes = formData.get('notes') as string
    const file = formData.get('file') as File | null

    if (!firstName || !lastName || !email || !questionnaireId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let uploadedFileUrl = ''
    let uploadedFilename = ''

    if (file && file.size > 0) {
      // Limit file size to 10MB
      const maxSizeBytes = 10 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return NextResponse.json({ error: 'File size exceeds the 10MB limit' }, { status: 400 })
      }

      // Restrict extensions to safe types
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'png', 'jpg', 'jpeg', 'zip', 'rar']
      if (!allowedExtensions.includes(ext)) {
        return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, Word, Excel, text, zip or images.' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uniqueName = `submission_${Date.now()}.${ext}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'submissions')
      
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, uniqueName), buffer)
      
      uploadedFileUrl = `/uploads/submissions/${uniqueName}`
      uploadedFilename = file.name
    }

    const submission = await createSubmission({
      questionnaireId,
      questionnaireName,
      firstName,
      lastName,
      email,
      department: department || '',
      notes: notes || '',
      uploadedFileUrl,
      uploadedFilename,
    })

    // Fetch the admin email configured in the footer
    const footerSettings = await readFooterSettings()
    const adminEmail = footerSettings.email || 'hello@codespine.in'

    // Send the email with the attachment
    try {
      await sendQuestionnaireEmail({
        adminEmail,
        firstName,
        lastName,
        userEmail: email,
        department: department || '',
        notes: notes || '',
        questionnaireName,
        filePath: uploadedFileUrl ? join(process.cwd(), 'public', uploadedFileUrl) : undefined,
        fileName: uploadedFilename || undefined,
      })
    } catch (mailError) {
      console.error('Failed to send email notification:', mailError)
      // We don't return an error to the user if ONLY the email fails, 
      // since the submission was successfully saved to the database.
    }

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error: any) {
    console.error('Form submission error:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}
