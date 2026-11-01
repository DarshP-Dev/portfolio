import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { site } from '../../content/site'
import {
  contactLimits,
  contactSubjects,
  emptyContact,
  receiptFromResponse,
  receiptStatus,
  validateContact,
  type ContactErrors,
  type ContactPhase,
  type ContactReceipt,
  type ContactValues,
} from '../../contact/model'
import { ContactReceipt as Receipt } from './ContactReceipt'
import './contact.css'

interface LetterState {
  values: ContactValues
  phase: ContactPhase
  errors: ContactErrors
  receipt?: ContactReceipt
  notice?: string
}
type LetterAction =
  | { type: 'edit'; field: keyof ContactValues; value: string }
  | { type: 'errors'; errors: ContactErrors }
  | { type: 'sending'; values: ContactValues }
  | { type: 'sent'; receipt: ContactReceipt }
  | { type: 'error'; notice: string; errors?: ContactErrors }
  | { type: 'new' }
const initial: LetterState = {
  values: emptyContact,
  phase: 'draft',
  errors: {},
}
function reducer(state: LetterState, action: LetterAction): LetterState {
  if (action.type === 'new') return { ...initial, values: { ...emptyContact } }
  if (action.type === 'edit') {
    const errors = { ...state.errors, [action.field]: undefined }
    if (action.field === 'subject' && action.value !== 'other')
      delete errors.customSubject
    return {
      values: { ...state.values, [action.field]: action.value },
      phase: 'draft',
      errors,
    }
  }
  if (action.type === 'errors') return { ...state, errors: action.errors }
  if (action.type === 'sending')
    return {
      ...state,
      values: action.values,
      phase: 'sending',
      errors: {},
      notice: undefined,
    }
  if (action.type === 'sent')
    return {
      ...state,
      phase: 'sent',
      receipt: action.receipt,
      notice:
        'Your letter was accepted for delivery. Thank you for getting in touch.',
    }
  return {
    ...state,
    phase: 'error',
    notice: action.notice,
    errors: action.errors ?? {},
  }
}
function requestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function ContactLetter() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [delivery, setDelivery] = useState<
    'checking' | 'ready' | 'unavailable'
  >('checking')
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const summary = useRef<HTMLDivElement>(null)
  const honey = useRef<HTMLInputElement>(null)
  const status = useRef<HTMLParagraphElement>(null)
  const pending = useRef(false)
  const attempt = useRef<{ payload: string; id: string } | null>(null)
  const controller = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const locked = state.phase === 'sending' || state.phase === 'sent'

  useEffect(() => {
    mounted.current = true
    let current = true
    const check = new AbortController()
    const timer = setTimeout(() => check.abort(), 5000)
    fetch('/api/contact', { signal: check.signal, cache: 'no-store' })
      .then(async (response) => {
        const result: unknown = response.ok ? await response.json() : undefined
        if (current)
          setDelivery(
            result &&
              typeof result === 'object' &&
              'enabled' in result &&
              result.enabled === true
              ? 'ready'
              : 'unavailable',
          )
      })
      .catch(() => {
        if (current) setDelivery('unavailable')
      })
      .finally(() => clearTimeout(timer))
    return () => {
      current = false
      mounted.current = false
      clearTimeout(timer)
      check.abort()
      controller.current?.abort()
    }
  }, [])

  const edit = (field: keyof ContactValues, value: string) =>
    dispatch({ type: 'edit', field, value })
  const errorId = (field: keyof ContactValues) => `${id}-${field}-error`
  const errors = Object.entries(state.errors).filter(
    (entry): entry is [keyof ContactValues, string] => !!entry[1],
  )
  const focusSummary = () =>
    requestAnimationFrame(() => {
      summary.current?.focus()
      summary.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
    })
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending.current || locked || delivery !== 'ready') return
    const checked = validateContact(state.values)
    if (Object.keys(checked.errors).length) {
      dispatch({ type: 'errors', errors: checked.errors })
      focusSummary()
      return
    }
    const payload = JSON.stringify(checked.values)
    if (attempt.current?.payload !== payload)
      attempt.current = { payload, id: requestId() }
    pending.current = true
    dispatch({ type: 'sending', values: checked.values })
    const abort = new AbortController()
    controller.current = abort
    const timer = setTimeout(() => abort.abort(), 20_000)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abort.signal,
        body: JSON.stringify({
          ...checked.values,
          website: honey.current?.value ?? '',
          requestId: attempt.current.id,
        }),
      })
      const result: unknown = await response.json().catch(() => undefined)
      if (!mounted.current) return
      const receipt = response.ok ? receiptFromResponse(result) : undefined
      if (receipt) {
        dispatch({ type: 'sent', receipt })
        requestAnimationFrame(() =>
          status.current?.focus({ preventScroll: true }),
        )
      } else {
        const notice =
          response.status === 429
            ? 'There have been too many letters just now. Please wait before retrying, or email me directly.'
            : response.status === 503
              ? 'Letter delivery is temporarily unavailable. Your draft is still here; you can retry or email me directly.'
              : 'Delivery could not be confirmed. Your draft is still here; please retry or email me directly.'
        const serverErrors: ContactErrors = {}
        if (
          response.status === 422 &&
          result &&
          typeof result === 'object' &&
          'errors' in result &&
          result.errors &&
          typeof result.errors === 'object'
        ) {
          for (const field of Object.keys(
            emptyContact,
          ) as (keyof ContactValues)[]) {
            const value = (result.errors as Record<string, unknown>)[field]
            if (typeof value === 'string' && value.length <= 200)
              serverErrors[field] = value
          }
        }
        dispatch({ type: 'error', notice, errors: serverErrors })
        if (Object.keys(serverErrors).length) focusSummary()
        else
          requestAnimationFrame(() =>
            status.current?.focus({ preventScroll: true }),
          )
      }
    } catch {
      if (mounted.current)
        dispatch({
          type: 'error',
          notice:
            'Delivery could not be confirmed. Your draft is still here; please retry or email me directly.',
        })
    } finally {
      clearTimeout(timer)
      pending.current = false
      controller.current = null
    }
  }
  const fieldProps = (field: keyof ContactValues) => ({
    id: `${id}-${field}`,
    name: field,
    value: state.values[field],
    'aria-invalid': !!state.errors[field],
    'aria-describedby': state.errors[field] ? errorId(field) : undefined,
  })
  const error = (field: keyof ContactValues) =>
    state.errors[field] && (
      <p className="letter-field-error" id={errorId(field)}>
        {state.errors[field]}
      </p>
    )
  return (
    <div className="contact-correspondence">
      <form
        className="contact-letter"
        ref={form}
        noValidate
        onSubmit={submit}
        aria-label="Contact Darsh by letter"
        aria-describedby={`${id}-delivery ${id}-privacy`}
      >
        <div className="letter-top">
          <div className="letter-routing">
            <header className="letter-heading">
              <span className="letter-seal" aria-hidden="true">
                DP
              </span>
              <div>
                <h3>Darsh Patel</h3>
                <p>PERSONAL CORRESPONDENCE / 01</p>
              </div>
            </header>
            <p className="letter-salutation">Dear Darsh,</p>
            <fieldset disabled={locked} className="letter-fields">
              <legend className="sr-only">Letter routing</legend>
              <div className="letter-field">
                <label htmlFor={`${id}-subject`}>RE:</label>
                <select
                  {...fieldProps('subject')}
                  required
                  onChange={(event) => edit('subject', event.target.value)}
                >
                  <option value="">Choose a subject</option>
                  {contactSubjects.map((subject) => (
                    <option value={subject.value} key={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>
              {error('subject')}
              {state.values.subject === 'other' && (
                <>
                  <div className="letter-field">
                    <label htmlFor={`${id}-customSubject`}>SUBJECT:</label>
                    <input
                      {...fieldProps('customSubject')}
                      required
                      maxLength={contactLimits.customSubject}
                      autoComplete="off"
                      onChange={(event) =>
                        edit('customSubject', event.target.value)
                      }
                      placeholder="What’s your letter about?"
                    />
                  </div>
                  {error('customSubject')}
                </>
              )}
              <div className="letter-field">
                <label htmlFor={`${id}-email`}>FROM:</label>
                <input
                  {...fieldProps('email')}
                  type="email"
                  required
                  maxLength={contactLimits.email}
                  autoComplete="email"
                  onChange={(event) => edit('email', event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              {error('email')}
            </fieldset>
          </div>
          <Receipt
            values={state.values}
            phase={state.phase}
            receipt={state.receipt}
          />
        </div>
        {errors.length > 0 && (
          <div
            className="letter-error-summary"
            ref={summary}
            tabIndex={-1}
            role="alert"
          >
            <h3>A few details need your attention.</h3>
            <ul>
              {errors.map(([field, message]) => (
                <li key={field}>
                  <a
                    href={`#${id}-${field}`}
                    onClick={(event) => {
                      event.preventDefault()
                      document.getElementById(`${id}-${field}`)?.focus()
                    }}
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <fieldset
          disabled={locked}
          className="letter-fields letter-body-fields"
        >
          <legend className="sr-only">Your letter</legend>
          <label className="letter-message-label" htmlFor={`${id}-message`}>
            What would you like to talk about?
          </label>
          <textarea
            {...fieldProps('message')}
            required
            maxLength={contactLimits.message}
            onChange={(event) => edit('message', event.target.value)}
            placeholder="An opportunity, an idea, or a simple hello…"
            rows={6}
          />
          {error('message')}
          <p className="letter-signoff">Sincerely,</p>
          <label className="sr-only" htmlFor={`${id}-name`}>
            Your name
          </label>
          <input
            {...fieldProps('name')}
            className="letter-name"
            required
            autoComplete="name"
            maxLength={contactLimits.name}
            onChange={(event) => edit('name', event.target.value)}
            placeholder="Your name"
          />
          {error('name')}
        </fieldset>
        <div className="letter-honeypot" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            name="website"
            ref={honey}
            tabIndex={-1}
            autoComplete="off"
            maxLength={200}
          />
        </div>
        <div className="letter-send-row">
          <span className="mono">ONE REPLY. NO MAILING LIST.</span>
          {state.phase === 'sent' ? (
            <button
              type="button"
              className="action-link"
              onClick={(event) => {
                // React reuses this button as a submit control when the draft resets.
                event.preventDefault()
                attempt.current = null
                if (honey.current) honey.current.value = ''
                dispatch({ type: 'new' })
                requestAnimationFrame(() =>
                  form.current?.querySelector('select')?.focus(),
                )
              }}
            >
              Write another letter <span aria-hidden="true">↗</span>
            </button>
          ) : (
            <button
              type="submit"
              className="action-link"
              disabled={delivery !== 'ready' || state.phase === 'sending'}
            >
              {state.phase === 'sending'
                ? 'Sending letter…'
                : state.phase === 'error'
                  ? 'Retry letter'
                  : 'Send Letter'}
              <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
        <p className="letter-delivery-note" id={`${id}-delivery`}>
          {delivery === 'checking'
            ? 'Checking letter delivery…'
            : delivery === 'unavailable'
              ? 'Letter delivery is not connected yet. You can draft here, or use the email link below.'
              : 'Ready when you are.'}
        </p>
        <p
          ref={status}
          tabIndex={-1}
          className={`letter-feedback ${state.phase === 'error' ? 'letter-feedback-error' : ''}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {state.notice ??
            (state.phase === 'sending'
              ? 'Sending your letter. Please keep this page open.'
              : '')}
        </p>
        {state.phase === 'sent' && (
          <span className="letter-sent-stamp" aria-hidden="true">
            SENT
          </span>
        )}
        <noscript>
          <p className="letter-delivery-note">
            The form needs JavaScript. You can contact Darsh through the email
            link below.
          </p>
        </noscript>
        <p className="letter-privacy" id={`${id}-privacy`}>
          When you send, your name, email and message are used to reply and pass
          through Resend to Darsh’s inbox. Spam controls use time-limited hashed
          identifiers. Your draft is not saved to browser storage.
        </p>
      </form>
      <p className="contact-email-alternative">
        Prefer email? <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <span className="sr-only" aria-live="off">
        Receipt status: {receiptStatus(state.values, state.phase)}
      </span>
    </div>
  )
}
