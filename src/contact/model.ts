export const contactSubjects = [
  {
    value: 'opportunity',
    label: 'Job Opportunity',
    job: 'JOB OPPORTUNITY',
    file: 'OPPORTUNITY',
  },
  {
    value: 'collaboration',
    label: 'Collaboration',
    job: 'COLLABORATION',
    file: 'NEW BUSINESS',
  },
  { value: 'hello', label: 'Just Saying Hi', job: 'HELLO', file: 'GENERAL' },
  { value: 'other', label: 'Other', job: 'OTHER', file: 'CUSTOM' },
] as const
export type ContactSubject = (typeof contactSubjects)[number]['value']
export interface ContactValues {
  name: string
  email: string
  subject: ContactSubject | ''
  customSubject: string
  message: string
}
export type ContactErrors = Partial<Record<keyof ContactValues, string>>
export interface ContactReceipt {
  reference: string
  receivedAt: string
}
export const contactLimits = {
  name: 100,
  email: 254,
  customSubject: 120,
  message: 6000,
} as const
export const emptyContact: ContactValues = {
  name: '',
  email: '',
  subject: '',
  customSubject: '',
  message: '',
}
function hasControl(value: string, allowLineBreaks = false) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    return (
      code === 127 ||
      (code < 32 && !(allowLineBreaks && [9, 10, 13].includes(code)))
    )
  })
}

export function validEmail(value: string) {
  const local = value.split('@')[0]
  return (
    value.length <= contactLimits.email &&
    /^[^\s@<>,;:"\\]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(
      value,
    ) &&
    !hasControl(value) &&
    !local.startsWith('.') &&
    !local.endsWith('.') &&
    !local.includes('..')
  )
}
export function validateContact(input: unknown): {
  values: ContactValues
  errors: ContactErrors
} {
  const raw =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  const text = (key: string) =>
    typeof raw[key] === 'string' ? raw[key].trim() : ''
  const subject =
    contactSubjects.find((item) => item.value === raw.subject)?.value ?? ''
  const values: ContactValues = {
    name: text('name'),
    email: text('email'),
    subject,
    customSubject: subject === 'other' ? text('customSubject') : '',
    message: text('message').replace(/\r\n?/g, '\n'),
  }
  const errors: ContactErrors = {}
  if (
    !values.name ||
    values.name.length > contactLimits.name ||
    hasControl(values.name)
  )
    errors.name = 'Enter your name (up to 100 characters).'
  if (!validEmail(values.email)) errors.email = 'Enter a valid email address.'
  if (!subject) errors.subject = 'Choose what your letter is about.'
  if (
    subject === 'other' &&
    (!values.customSubject ||
      values.customSubject.length > contactLimits.customSubject ||
      hasControl(values.customSubject))
  )
    errors.customSubject = 'Add a subject (up to 120 characters).'
  if (
    !values.message ||
    values.message.length > contactLimits.message ||
    hasControl(values.message, true)
  )
    errors.message = 'Write a message (up to 6,000 characters).'
  return { values, errors }
}
export function receiptFromResponse(
  input: unknown,
): ContactReceipt | undefined {
  if (!input || typeof input !== 'object') return
  const value = input as Record<string, unknown>
  if (
    value.accepted === true &&
    typeof value.reference === 'string' &&
    /^[a-zA-Z0-9_-]{1,128}$/.test(value.reference) &&
    typeof value.receivedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}T/.test(value.receivedAt) &&
    Number.isFinite(Date.parse(value.receivedAt))
  )
    return { reference: value.reference, receivedAt: value.receivedAt }
}
export type ContactPhase = 'draft' | 'sending' | 'error' | 'sent'
export function receiptStatus(values: ContactValues, phase: ContactPhase) {
  if (phase === 'sent') return 'SENT'
  if (phase === 'sending') return 'SENDING'
  if (phase === 'error') return 'ERROR'
  if (Object.values(values).every((value) => !value.trim())) return 'READY'
  return Object.keys(validateContact(values).errors).length
    ? 'BEING WRITTEN'
    : 'READY TO SEND'
}
