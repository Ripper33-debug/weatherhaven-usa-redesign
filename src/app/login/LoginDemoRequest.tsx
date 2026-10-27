"use client";

import { useState } from "react";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { btnPrimary } from "@/lib/cta-buttons";

const inputClass =
  "mt-1.5 w-full border border-[rgba(255,255,255,0.12)] bg-[#080a0c] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#8a9099] focus:border-[rgba(255,255,255,0.35)]";

export function LoginDemoRequest({ onBack }: { onBack: () => void }) {
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const org = organization.trim();
    const addr = email.trim();
    if (!org || !addr) {
      setError("Organization and work email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithCsrf("/api/contact-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: org,
          email: addr,
          inquiry_type: "Demo Request",
          full_name: name.trim() || "Not provided",
          role: "Not provided",
          subject: "Demo request from sign-in page",
          message: message.trim() || "Demo requested via sign-in — details to follow.",
          contact_method: "Email",
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not send request. Try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div>
        <h1 className="text-center text-lg font-semibold text-white">Demo request sent</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-white/60">
          A Weatherhaven expert will follow up at <span className="text-white">{email}</span> within 48 hours. This
          does not create platform access — sign in only after you receive credentials.
        </p>
        <button type="button" onClick={onBack} className={`mt-8 w-full justify-center ${btnPrimary}`}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm text-[#8a9099] transition hover:text-white"
      >
        ← Back to sign in
      </button>
      <h1 className="text-center text-lg font-semibold text-white">Request a demo</h1>
      <p className="mt-2 text-center text-sm text-white/50">
        Capability briefing or system walkthrough — no platform login required.
      </p>
      <form className="mt-8 space-y-4" noValidate onSubmit={handleSubmit}>
        <div>
          <label htmlFor="demo-org" className="wh-field-label">
            Organization
          </label>
          <input
            id="demo-org"
            required
            className={inputClass}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="demo-email" className="wh-field-label">
            Work email
          </label>
          <input
            id="demo-email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="demo-name" className="wh-field-label">
            Your name <span className="text-white/40">(optional)</span>
          </label>
          <input
            id="demo-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="demo-message" className="wh-field-label">
            What would you like to see? <span className="text-white/40">(optional)</span>
          </label>
          <textarea
            id="demo-message"
            rows={3}
            className={`${inputClass} min-h-[80px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Systems, mission type, timeline…"
          />
        </div>
        {error && (
          <p className="wh-field-error">
            <span aria-hidden>⚠ </span>
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={`w-full justify-center ${btnPrimary} disabled:opacity-60`}>
          {loading ? "Sending…" : "Submit demo request"}
        </button>
      </form>
    </div>
  );
}
