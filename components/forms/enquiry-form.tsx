"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleCheck, Info, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { coverageConfig } from "@/lib/config/coverage";
import { getDemoService } from "@/lib/services";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";

export const ENQUIRY_TYPES = [
  { value: "subscription", label: "Platform subscription" },
  { value: "demonstration", label: "Product demonstration" },
  { value: "locality", label: "Locality-specific research" },
  { value: "custom", label: "Custom research requirements" },
  { value: "collaboration", label: "Institutional collaboration" },
  { value: "other", label: "Other" },
] as const;

type EnquiryType = (typeof ENQUIRY_TYPES)[number]["value"];

interface FormState {
  name: string;
  organisation: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  micromarket: string;
  type: EnquiryType | "";
  message: string;
  consent: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const FREE_EMAIL = ["gmail.com", "yahoo.com", "yahoo.co.in", "hotmail.com", "outlook.com", "live.com", "rediffmail.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"];

export function validateEnquiry(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your full name.";
  if (f.organisation.trim().length < 2) e.organisation = "Please enter your organisation.";
  if (f.designation.trim().length < 2) e.designation = "Please enter your designation.";
  const email = f.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Please enter a valid email address.";
  else if (FREE_EMAIL.includes(email.split("@")[1])) e.email = "Please use your business email address.";
  const digits = f.phone.replace(/[^\d]/g, "");
  if (digits.length < 10 || digits.length > 15) e.phone = "Please enter a valid phone number (10–15 digits).";
  if (!f.city) e.city = "Please select a city.";
  if (!f.type) e.type = "Please choose an enquiry type.";
  if (f.message.trim().length < 20) e.message = "Please describe your requirement (at least 20 characters).";
  if (f.message.length > 2000) e.message = "Please keep your message under 2,000 characters.";
  if (!f.consent) e.consent = "Please confirm so we can respond to your enquiry.";
  return e;
}

export function EnquiryForm() {
  const params = useSearchParams();
  const preType = params.get("type");
  const topic = params.get("topic");
  const initialType = ENQUIRY_TYPES.some((t) => t.value === preType) ? (preType as EnquiryType) : "";

  const empty: FormState = {
    name: "",
    organisation: "",
    designation: "",
    email: "",
    phone: "",
    city: "",
    micromarket: "",
    type: initialType,
    message: topic ? `Regarding: ${topic}\n\n` : "",
    consent: false,
  };
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [reference, setReference] = useState("");

  const micromarketSuggestions = useMemo(() => {
    const city = coverageConfig.cities.find((c) => c.name === form.city);
    if (!city?.demoCityId) return [];
    const cat = getDemoService().catalogSync();
    return cat.cities.find((c) => c.city_id === city.demoCityId)?.micromarkets.map((m) => m.micromarket_name) ?? [];
  }, [form.city]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) setErrors(validateEnquiry(next));
  }
  const blur = (key: keyof FormState) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateEnquiry(form));
  };
  const err = (key: keyof FormState) => (touched[key] ? errors[key] : undefined);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validateEnquiry(form);
    setErrors(v);
    setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
    if (Object.keys(v).length) {
      const first = Object.keys(v)[0];
      document.getElementById(`enq-${first}`)?.focus();
      return;
    }
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 900));
    setReference(`DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`);
    setStatus("done");
  }

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xs border border-rule bg-white p-8 sm:p-10" role="status" aria-live="polite">
        <CircleCheck className="h-8 w-8 text-positive" aria-hidden />
        <h2 className="mt-5 text-[26px] font-semibold tracking-tight text-ink-900">Enquiry validated — demonstration only</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-subtle">
          Thank you, {form.name.split(" ")[0]}. Your enquiry passed validation. In this showcase build it has <strong className="text-ink-900">not</strong> been emailed or stored in any CRM — submission will be connected to MB Research&apos;s enquiry workflow in the backend phase.
        </p>
        <dl className="mt-8 grid gap-4 border-t border-rule pt-6 text-[14px] sm:grid-cols-2">
          <div>
            <dt className="text-muted">Demo reference</dt>
            <dd className="mt-1 font-mono text-ink-900">{reference}</dd>
          </div>
          <div>
            <dt className="text-muted">Enquiry type</dt>
            <dd className="mt-1 text-ink-900">{ENQUIRY_TYPES.find((t) => t.value === form.type)?.label}</dd>
          </div>
          <div>
            <dt className="text-muted">Organisation</dt>
            <dd className="mt-1 text-ink-900">{form.organisation}</dd>
          </div>
          <div>
            <dt className="text-muted">Market of interest</dt>
            <dd className="mt-1 text-ink-900">{[form.micromarket, form.city].filter(Boolean).join(", ")}</dd>
          </div>
        </dl>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            setForm({ ...empty, message: "" });
            setErrors({});
            setTouched({});
            setStatus("idle");
          }}
        >
          Start a new enquiry
        </Button>
      </motion.div>
    );
  }

  const cityOptions = [
    { value: "", label: "Select a city" },
    ...coverageConfig.cities.map((c) => ({ value: c.name, label: c.name })),
    { value: "Other", label: "Other / multiple cities" },
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xs border border-rule bg-white p-6 sm:p-10" aria-describedby="form-note">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="enq-name" required error={err("name")}>
          <Input id="enq-name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} invalid={!!err("name")} aria-describedby={err("name") ? "enq-name-error" : undefined} />
        </Field>
        <Field label="Organisation" htmlFor="enq-organisation" required error={err("organisation")}>
          <Input id="enq-organisation" autoComplete="organization" value={form.organisation} onChange={(e) => set("organisation", e.target.value)} onBlur={() => blur("organisation")} invalid={!!err("organisation")} />
        </Field>
        <Field label="Designation" htmlFor="enq-designation" required error={err("designation")}>
          <Input id="enq-designation" autoComplete="organization-title" value={form.designation} onChange={(e) => set("designation", e.target.value)} onBlur={() => blur("designation")} invalid={!!err("designation")} />
        </Field>
        <Field label="Business email" htmlFor="enq-email" required error={err("email")}>
          <Input id="enq-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} invalid={!!err("email")} />
        </Field>
        <Field label="Phone" htmlFor="enq-phone" required error={err("phone")}>
          <Input id="enq-phone" type="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={(e) => set("phone", e.target.value)} onBlur={() => blur("phone")} invalid={!!err("phone")} />
        </Field>
        <Field label="Enquiry type" htmlFor="enq-type" required error={err("type")}>
          <Select
            id="enq-type"
            skin="light"
            size="md"
            className="[&_select]:h-11"
            value={form.type}
            invalid={!!err("type")}
            onChange={(e) => set("type", e.target.value as EnquiryType)}
            onBlur={() => blur("type")}
            options={[{ value: "", label: "Select enquiry type" }, ...ENQUIRY_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
          />
        </Field>
        <Field label="City" htmlFor="enq-city" required error={err("city")}>
          <Select id="enq-city" skin="light" className="[&_select]:h-11" value={form.city} invalid={!!err("city")} onChange={(e) => set("city", e.target.value)} onBlur={() => blur("city")} options={cityOptions} />
        </Field>
        <Field label="Area / micromarket of interest" htmlFor="enq-micromarket" hint={micromarketSuggestions.length ? "Start typing for suggestions" : "Optional"}>
          <Input id="enq-micromarket" list="mm-suggestions" value={form.micromarket} onChange={(e) => set("micromarket", e.target.value)} />
          <datalist id="mm-suggestions">
            {micromarketSuggestions.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Field>
        <Field label="Message" htmlFor="enq-message" required error={err("message")} className="sm:col-span-2" hint={`${form.message.length} / 2,000`}>
          <Textarea id="enq-message" value={form.message} onChange={(e) => set("message", e.target.value)} onBlur={() => blur("message")} invalid={!!err("message")} placeholder="Tell us about the markets, questions or decisions you are working on." />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-[13.5px] text-subtle">
            <input id="enq-consent" type="checkbox" className="mt-0.5 h-4 w-4 accent-signal-500" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} onBlur={() => blur("consent")} />
            I agree that MB Research may contact me about this enquiry.
          </label>
          {err("consent") && <p className="mt-1.5 text-[12px] text-negative" role="alert">{err("consent")}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse items-start justify-between gap-5 border-t border-rule pt-6 sm:flex-row sm:items-center">
        <p id="form-note" className="flex max-w-md items-start gap-2 text-[12.5px] text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Showcase build: submissions are validated in the browser only and are not transmitted or stored.
        </p>
        <Button type="submit" size="lg" disabled={status === "submitting"}>
          <AnimatePresence mode="wait" initial={false}>
            {status === "submitting" ? (
              <motion.span key="s" className="inline-flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> Validating…
              </motion.span>
            ) : (
              <motion.span key="i" className="inline-flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Submit enquiry <ArrowRight className="h-4 w-4" aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </form>
  );
}
