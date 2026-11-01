import {
  contactSubjects,
  receiptStatus,
  type ContactPhase,
  type ContactReceipt as Receipt,
  type ContactValues,
} from '../../contact/model'

export function ContactReceipt({
  values,
  phase,
  receipt,
}: {
  values: ContactValues
  phase: ContactPhase
  receipt?: Receipt
}) {
  const subject = contactSubjects.find((item) => item.value === values.subject)
  return (
    <aside className="contact-receipt" aria-label="Live letter receipt">
      <svg className="receipt-paperclip" viewBox="0 0 24 72" aria-hidden="true">
        <path
          d="M17 57V12a7 7 0 0 0-14 0v46a9 9 0 0 0 18 0V17a4 4 0 0 0-8 0v39"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="receipt-paper">
        <h3>
          DARSH PATEL ::
          <br />
          CONTACT INTAKE
        </h3>
        <p className="receipt-counter">PORTFOLIO / COUNTER 01</p>
        <dl>
          <div>
            <dt>JOB</dt>
            <dd>{subject?.job ?? '--'}</dd>
          </div>
          <div>
            <dt>REPLY TO</dt>
            <dd className="receipt-email" title={values.email || undefined}>
              {values.email || '--'}
            </dd>
          </div>
          <div>
            <dt>FILE UNDER</dt>
            <dd>{subject?.file ?? '--'}</dd>
          </div>
          <div className="receipt-status">
            <dt>STATUS</dt>
            <dd>{receiptStatus(values, phase)}</dd>
          </div>
          <div>
            <dt>RECEIVED</dt>
            <dd>
              {receipt ? (
                <time dateTime={receipt.receivedAt}>
                  {new Date(receipt.receivedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
              ) : (
                '--'
              )}
            </dd>
          </div>
          <div>
            <dt>REF</dt>
            <dd className="receipt-reference">{receipt?.reference ?? '--'}</dd>
          </div>
        </dl>
        {receipt && (
          <p className="receipt-time-note">Server confirmation · local time</p>
        )}
        <div className="receipt-barcode" aria-hidden="true" />
        <p className="receipt-keep">ONE LETTER · ONE CONVERSATION</p>
      </div>
    </aside>
  )
}
