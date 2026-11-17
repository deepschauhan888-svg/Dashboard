/**
 * Demo-request submission. The showcase uses DemoEnquiryService, which only
 * validates and returns a local reference — nothing is sent anywhere.
 *
 * To go live, implement EnquiryService against a Next.js route handler
 * (e.g. POST /api/v1/demo-requests) that writes to the CRM / database and
 * sends notifications, then return it from getEnquiryService().
 */

export interface DemoRequest {
  name: string;
  organisation: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  micromarket: string;
  message: string;
}

export interface EnquiryResult {
  reference: string;
  /** "demo" means the request was NOT transmitted or stored */
  delivery: "demo" | "submitted";
}

export interface EnquiryService {
  submitDemoRequest(request: DemoRequest): Promise<EnquiryResult>;
}

class DemoEnquiryService implements EnquiryService {
  async submitDemoRequest(_request: DemoRequest): Promise<EnquiryResult> {
    await new Promise((r) => setTimeout(r, 700));
    return { reference: `DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`, delivery: "demo" };
  }
}

let instance: EnquiryService | null = null;

export function getEnquiryService(): EnquiryService {
  if (!instance) instance = new DemoEnquiryService();
  return instance;
}

const FREE_EMAIL = ["gmail.com", "yahoo.com", "yahoo.co.in", "hotmail.com", "outlook.com", "live.com", "rediffmail.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"];

export type DemoRequestErrors = Partial<Record<keyof DemoRequest, string>>;

/** Shared validation — reuse the same rules server-side when the API is built. */
export function validateDemoRequest(r: DemoRequest): DemoRequestErrors {
  const e: DemoRequestErrors = {};
  if (r.name.trim().length < 2) e.name = "Please enter your full name.";
  if (r.organisation.trim().length < 2) e.organisation = "Please enter your organisation.";
  if (r.designation.trim().length < 2) e.designation = "Please enter your designation.";
  const email = r.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Please enter a valid email address.";
  else if (FREE_EMAIL.includes(email.split("@")[1])) e.email = "Please use your business email address.";
  const digits = r.phone.replace(/[^\d]/g, "");
  if (digits.length < 10 || digits.length > 15) e.phone = "Please enter a valid contact number (10–15 digits).";
  if (!r.city) e.city = "Please select a city.";
  if (r.message.trim().length < 20) e.message = "Please describe your requirements (at least 20 characters).";
  if (r.message.length > 2000) e.message = "Please keep your message under 2,000 characters.";
  return e;
}
