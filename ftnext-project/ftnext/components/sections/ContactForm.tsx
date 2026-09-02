'use client';

import { useActionState } from 'react';
import { contactDepartments } from '@/data/site-config';
import { Button } from '@/components/ui/Button';
import { submitContactForm, type ContactFormState } from '@/app/actions/contact';

/**
 * Contact form with accessible labels, focus rings, and server action.
 *
 * NOTE: The server action (app/actions/contact.ts) is a PLACEHOLDER —
 * it only logs form data to the console. Real email/CRM delivery
 * (e.g. Resend, SendGrid) needs to be wired in before launch.
 * See spec Section 10, item 7.
 */
export function ContactForm() {
  const initialState: ContactFormState = { success: false, message: '' };
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <div className="bg-slate border border-gunmetal rounded-lg p-8">
        <p className="text-chrome text-lg">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state.message && !state.success && (
        <p className="text-crimson text-sm">{state.message}</p>
      )}

      <div>
        <label htmlFor="contact-name" className="block text-steel text-sm mb-1.5">
          Name <span className="text-crimson">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          placeholder="Your full name"
          required
          className="w-full bg-slate border border-gunmetal rounded-md px-4 py-3 text-chrome placeholder:text-steel/60 focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson transition-all"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-steel text-sm mb-1.5">
          Email <span className="text-crimson">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          className="w-full bg-slate border border-gunmetal rounded-md px-4 py-3 text-chrome placeholder:text-steel/60 focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson transition-all"
        />
      </div>

      <div>
        <label htmlFor="contact-company" className="block text-steel text-sm mb-1.5">
          Company
        </label>
        <input
          id="contact-company"
          name="company"
          placeholder="Company name (optional)"
          className="w-full bg-slate border border-gunmetal rounded-md px-4 py-3 text-chrome placeholder:text-steel/60 focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson transition-all"
        />
      </div>

      <div>
        <label htmlFor="contact-department" className="block text-steel text-sm mb-1.5">
          Department <span className="text-crimson">*</span>
        </label>
        <select
          id="contact-department"
          name="department"
          required
          className="w-full bg-slate border border-gunmetal rounded-md px-4 py-3 text-chrome focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson transition-all"
        >
          <option value="">Select Department</option>
          {contactDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-steel text-sm mb-1.5">
          Message <span className="text-crimson">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="How can we help?"
          rows={5}
          required
          className="w-full bg-slate border border-gunmetal rounded-md px-4 py-3 text-chrome placeholder:text-steel/60 focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:border-crimson transition-all resize-y"
        />
      </div>

      <Button type="submit" variant="primary">
        {isPending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  );
}
