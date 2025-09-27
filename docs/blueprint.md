# **App Name**: Loni Tax Manager

## Core Features:

- User Authentication: Secure user registration and login for citizens and admin using Firebase Authentication.
- Property Registration: Allow citizens to register property details (address, type, size) with secure Aadhaar data encryption.
- Tax Calculation: Automatically calculate taxes based on property details and applicable tax types.
- Online Payment: Enable online tax payments through payment gateway integration (e.g., Razorpay/Stripe).
- Payment History: Allow citizens to track their payment history and download receipts.
- Admin Dashboard: Provide an admin dashboard to view total properties and pending/paid taxes.  The LLM tool provides proactive system feedback based on overall tax assessment completeness, highlighting edge cases and anomalies to the assessment officer.
- Reporting and Export: Allow admin to export reports (CSV/PDF) for selected filters like year, tax type, and payment status.

## Style Guidelines:

- Primary color: Light Blue (#B0E2FF) to create a sense of trust and transparency.
- Background color: Very light blue (#F0F8FF), close to white, to give the interface a clean and uncluttered feel.
- Accent color: Soft green (#98FF98) for CTAs and success states (payment confirmation, etc).
- Body font: 'PT Sans' (sans-serif) for readability and a modern feel.
- Headline font: 'Playfair' (serif) for headings to provide an elegant and readable experience. Use 'PT Sans' (sans-serif) for body text.
- Use clear, consistent icons from a Material Design library.
- Implement a responsive layout using Material UI / Tailwind CSS to ensure accessibility across devices.