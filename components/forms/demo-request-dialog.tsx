"use client";

import { CircleCheck, Info, LoaderCircle } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { getDemoService } from "@/lib/services";
import { getEnquiryService, validateDemoRequest, type DemoRequest, type DemoRequestErrors } from "@/lib/services/enquiry-service";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";

const EMPTY: DemoRequest = { name: "", organisation: "", designation: "", email: "", phone: "", city: "", micromarket: "", message: "" };

/** "Request a Demo" enquiry panel, opened from the sign-in page and the platform preview. */
export function DemoRequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<DemoRequest>(EMPTY);
  const [errors, setErrors] = useState<DemoRequestErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof DemoRequest, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [reference, setReference] = useState("");

  const catalog = useMemo(() => getDemoService().catalogSync(), []);
  const city = catalog.cities.find((c) => c.city_name === form.city);

  function set<K extends keyof DemoRequest>(key: K, value: DemoRequest[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) setErrors(validateDemoRequest(next));
  }
  function blur(key: keyof DemoRequest) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateDemoRequest(form));
  }
  const err = (key: keyof DemoRequest) => (touched[key] ? errors[key] : undefined);

  function close() {
    onClose();
    if (status === "done") {
      setForm(EMPTY);
      setErrors({});
      setTouched({});
      setStatus("idle");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validateDemoRequest(form);
    setErrors(v);
    setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
    if (Object.keys(v).length) {
      document.getElementById(`demo-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    setStatus("submitting");
    const res = await getEnquiryService().submitDemoRequest(form);
    setReference(res.reference);
    setStatus("done");
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={status === "done" ? "Request recorded (demonstration)" : "Request a Demo"}
      description={status === "done" ? undefined : "Tell us about your organisation and the markets you are evaluating."}
      width="max-w-2xl"
    >
      {status === "done" ? (
        <div role="status" aria-live="polite">
          <CircleCheck className="h-8 w-8 text-positive" aria-hidden />
          <p className="mt-4 text-[15px] leading-relaxed text-ink">
            Thank you, {form.name.split(" ")[0]}. Your request passed validation.
          </p>
          <p className="mt-2 rounded-sm bg-paper p-3 text-[13.5px] leading-relaxed text-ink-2">
            This showcase does <strong className="text-ink">not</strong> send or store enquiries. The request has not been emailed or saved to a CRM — that connection will be added with the backend.
          </p>
          <dl className="mt-5 grid gap-3 text-[14px] sm:grid-cols-2">
            <div>
              <dt className="text-ink-2">Demo reference</dt>
              <dd className="mt-0.5 font-medium tabular">{reference}</dd>
            </div>
            <div>
              <dt className="text-ink-2">Market of interest</dt>
              <dd className="mt-0.5 font-medium">{[form.micromarket, form.city].filter(Boolean).join(", ")}</dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="demo-name" required error={err("name")}>
              <Input id="demo-name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} invalid={!!err("name")} />
            </Field>
            <Field label="Organisation" htmlFor="demo-organisation" required error={err("organisation")}>
              <Input id="demo-organisation" autoComplete="organization" value={form.organisation} onChange={(e) => set("organisation", e.target.value)} onBlur={() => blur("organisation")} invalid={!!err("organisation")} />
            </Field>
            <Field label="Designation" htmlFor="demo-designation" required error={err("designation")}>
              <Input id="demo-designation" autoComplete="organization-title" value={form.designation} onChange={(e) => set("designation", e.target.value)} onBlur={() => blur("designation")} invalid={!!err("designation")} />
            </Field>
            <Field label="Business email" htmlFor="demo-email" required error={err("email")}>
              <Input id="demo-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} invalid={!!err("email")} />
            </Field>
            <Field label="Contact number" htmlFor="demo-phone" required error={err("phone")}>
              <Input id="demo-phone" type="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={(e) => set("phone", e.target.value)} onBlur={() => blur("phone")} invalid={!!err("phone")} />
            </Field>
            <Field label="City" htmlFor="demo-city" required error={err("city")}>
              <Select
                id="demo-city"
                size="lg"
                value={form.city}
                invalid={!!err("city")}
                onChange={(e) => {
                  const next = { ...form, city: e.target.value, micromarket: "" };
                  setForm(next);
                  if (touched.city) setErrors(validateDemoRequest(next));
                }}
                onBlur={() => blur("city")}
                options={[{ value: "", label: "Select a city" }, ...catalog.cities.map((c) => ({ value: c.city_name, label: c.city_name })), { value: "Other", label: "Other / multiple cities" }]}
              />
            </Field>
            <Field label="Area / micromarket of interest" htmlFor="demo-micromarket" hint={city ? "Start typing for suggestions" : "Optional"} className="sm:col-span-2">
              <Input id="demo-micromarket" list="demo-mm-list" value={form.micromarket} onChange={(e) => set("micromarket", e.target.value)} />
              <datalist id="demo-mm-list">
                {city?.micromarkets.map((m) => (
                  <option key={m.micromarket_id} value={m.micromarket_name} />
                ))}
              </datalist>
            </Field>
            <Field label="Requirements / message" htmlFor="demo-message" required error={err("message")} hint={`${form.message.length} / 2,000`} className="sm:col-span-2">
              <Textarea id="demo-message" className="min-h-28" value={form.message} onChange={(e) => set("message", e.target.value)} onBlur={() => blur("message")} invalid={!!err("message")} placeholder="Markets, product formats or decisions you are working on." />
            </Field>
          </div>
          <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
            <p className="flex max-w-sm items-start gap-2 text-[12px] text-ink-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Showcase build: requests are validated in the browser only and are not transmitted or stored.
            </p>
            <Button type="submit" variant="primary" size="lg" disabled={status === "submitting"}>
              {status === "submitting" && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
              Submit Demo Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
