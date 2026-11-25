"use client";

import { useState, type FormEvent } from "react";
import { sendMessage } from "@/lib/listings";
import { LIMITS, validateMessage } from "@/lib/validation";

type Status = "idle" | "sending" | "sent";

export function MessageSellerForm({ listingId }: { listingId: string }) {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("Hi, is this still available?");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateMessage({ buyerEmail, message });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setStatus("sending");
    setError(null);
    try {
      await sendMessage(listingId, result.value);
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("Could not send your message. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-lg bg-success-soft p-4 text-sm text-success">
        <p className="font-semibold">Message sent to the seller.</p>
        <p>They can reply to {buyerEmail.trim().toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-line p-4">
      <h2 className="font-bold text-ink">Message seller</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="buyer-email" className="text-sm font-medium text-ink">
          Your email
        </label>
        <input
          id="buyer-email"
          type="email"
          autoComplete="email"
          required
          value={buyerEmail}
          onChange={(event) => setBuyerEmail(event.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-brand"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="buyer-message" className="text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="buyer-message"
          required
          rows={3}
          maxLength={LIMITS.messageMax}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-brand"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
