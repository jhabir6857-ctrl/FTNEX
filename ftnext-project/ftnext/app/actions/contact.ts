'use server';

/**
 * Contact form server action — receives form submissions.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TODO / PLACEHOLDER — NOT PRODUCTION-READY                      ║
 * ║                                                                  ║
 * ║  This action currently only logs form data to the server         ║
 * ║  console. Before launch, wire this up to an actual email         ║
 * ║  delivery or CRM service such as:                                ║
 * ║   - Resend (https://resend.com)                                  ║
 * ║   - SendGrid (https://sendgrid.com)                              ║
 * ║   - Formspree / HubSpot                                         ║
 * ║                                                                  ║
 * ║  See spec Section 10, item 7 — confirm with client which         ║
 * ║  service/CRM to use for form backend.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export type ContactFormState = {
  success: boolean;
  message: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const company = formData.get('company') as string;
  const department = formData.get('department') as string;
  const message = formData.get('message') as string;

  // Basic validation
  if (!name || !email || !department || !message) {
    return {
      success: false,
      message: 'Please fill in all required fields.',
    };
  }

  // TODO: Replace with real email/CRM delivery (see banner above)
  console.log('[PLACEHOLDER] Contact form submission:', {
    name,
    email,
    company,
    department,
    message,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    message: '[PLACEHOLDER] Thanks — your message has been received. We\'ll be in touch shortly.',
  };
}
