import nodemailer from 'nodemailer'

/**
 * Escapes the 5 HTML special characters in a user-supplied string.
 * Must be applied to every value interpolated into an HTML email template
 * to prevent HTML/script injection in the admin inbox.
 */
function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_PORT === '465', // true for 465, false for other ports like 587
  auth: {
    user: process.env.MAIL_USERNAME || 'hello@codespine.in',
    pass: process.env.MAIL_PASSWORD || '', // User must fill this in .env
  },
})

export const sendQuestionnaireEmail = async ({
  adminEmail,
  firstName,
  lastName,
  userEmail,
  department,
  notes,
  questionnaireName,
  filePath,
  fileName,
}: {
  adminEmail: string
  firstName: string
  lastName: string
  userEmail: string
  department: string
  notes: string
  questionnaireName: string
  filePath?: string
  fileName?: string
}) => {
  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'hello@codespine.in'
  const fromName = process.env.MAIL_FROM_NAME || 'Panzer IT'

  // Escape all user-supplied values before inserting into HTML
  const safeName = `${escapeHtml(firstName)} ${escapeHtml(lastName)}`
  const safeEmail = escapeHtml(userEmail)
  const safeDepartment = escapeHtml(department) || 'N/A'
  const safeNotes = escapeHtml(notes) || 'No notes provided.'
  const safeQuestionnaireName = escapeHtml(questionnaireName)

  const htmlContent = `
    <h2>New Resource Request</h2>
    <p>A user has submitted the questionnaire for <strong>${safeQuestionnaireName}</strong>.</p>
    <br/>
    <h3>User Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${safeName}</li>
      <li><strong>Email:</strong> ${safeEmail}</li>
      <li><strong>Department/Team:</strong> ${safeDepartment}</li>
    </ul>
    <h3>Additional Notes:</h3>
    <p>${safeNotes}</p>
    <br/>
    <p>Please find the user's uploaded file attached to this email.</p>
  `

  const attachments = []
  if (filePath && fileName) {
    attachments.push({
      filename: escapeHtml(fileName),
      path: filePath, // Stream or absolute path
    })
  }

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: adminEmail, // Admin email fetched from footer settings
    subject: `Resource Request: ${safeQuestionnaireName} from ${safeName}`,
    html: htmlContent,
    attachments,
  }

  return transporter.sendMail(mailOptions)
}

export const sendPasswordResetEmail = async ({
  email,
  resetLink,
}: {
  email: string
  resetLink: string
}) => {
  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'hello@codespine.in'
  const fromName = process.env.MAIL_FROM_NAME || 'Panzer IT'

  // Escape the reset link as an href attribute value to prevent attribute injection
  const safeResetLink = encodeURI(resetLink)

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You recently requested to reset your password for your Panzer IT admin account.</p>
      <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
      <div style="margin: 30px 0;">
        <a href="${safeResetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset My Password</a>
      </div>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <br/>
      <p>Best regards,<br/>The Panzer IT Team</p>
    </div>
  `

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: escapeHtml(email),
    subject: `Reset Your Panzer IT Admin Password`,
    html: htmlContent,
  }

  return transporter.sendMail(mailOptions)
}
