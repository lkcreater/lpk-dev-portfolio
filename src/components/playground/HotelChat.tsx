"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { formatBaht, lpkHotel } from "@/data/lpk-hotel";
import type { Dictionary, Locale } from "@/lib/i18n";

type Copy = Dictionary["playground"]["hotel"];
type Usage = { used: number; limit: number; remaining: number };
type BookingInput = { roomType: string; checkIn?: string; nights?: number; guests?: number; offer?: string };
type Confirmation = { bookingNo: string; roomName: string; total: number; checkIn: string; nights: number };

type ChatMessage = UIMessage<{ at?: number }>;

const time = (locale: Locale, at?: number) =>
  at
    ? new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(at)
    : "";

export function HotelChat({
  copy,
  locale,
  usageTemplate,
  initialUsage,
}: {
  copy: Copy;
  locale: Locale;
  usageTemplate: string;
  initialUsage: Usage | null;
}) {
  const [usage, setUsage] = useState(initialUsage);
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  // The greeting is local: it costs no model call but is sent as context with the first message.
  const [greeting] = useState<ChatMessage>(() => ({
    id: "greeting",
    role: "assistant",
    metadata: { at: Date.now() },
    parts: [{ type: "text", text: copy.chat.greeting }],
  }));

  // Custom fetch reads the remaining-quota headers the API sends with each reply.
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/playground/hotel-chat",
        fetch: async (url, init) => {
          const response = await fetch(url, init);
          const remaining = response.headers.get("x-usage-remaining");
          const limit = response.headers.get("x-usage-limit");
          if (remaining && limit) {
            setUsage({
              used: Number(limit) - Number(remaining),
              limit: Number(limit),
              remaining: Number(remaining),
            });
          }
          return response;
        },
      }),
  );

  const { messages, sendMessage, status, error, setMessages, clearError } = useChat<ChatMessage>({
    transport,
    messages: [greeting],
  });

  const busy = status === "submitted" || status === "streaming";
  const outOfMessages = usage !== null && usage.remaining === 0;
  const limitMessage = copy.errors.limit.replace("{limit}", String(usage?.limit ?? 20));

  // The API answers errors with JSON like {"error":"limit_reached"}.
  const errorCode = error ? (/"error":"([a-z_]+)"/.exec(error.message)?.[1] ?? "failed") : null;
  const errorText =
    errorCode === "limit_reached"
      ? limitMessage
      : errorCode === "unavailable"
        ? copy.errors.unavailable
        : errorCode === "unauthorized"
          ? copy.errors.unauthorized
          : errorCode
            ? copy.errors.failed
            : null;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy || outOfMessages) return;
    clearError();
    setInput("");
    sendMessage({ text, metadata: { at: Date.now() } }).catch(() => undefined);
  };

  return (
    <div className="line-chat">
      <header className="line-chat-head">
        <span className="line-chat-avatar" aria-hidden="true">
          LPK
        </span>
        <div>
          <p>{lpkHotel.name}</p>
          <small>
            ● {copy.chat.status} · {lpkHotel.staff.name}
          </small>
        </div>
        <button
          type="button"
          onClick={() => {
            clearError();
            setMessages([greeting]);
          }}
          disabled={busy}
        >
          {copy.chat.reset}
        </button>
      </header>

      <div className="line-chat-body" ref={scroller} data-lenis-prevent aria-live="polite">
        {messages.map((message) => {
          const mine = message.role === "user";
          return (
            <div key={message.id} className={`line-row${mine ? " is-mine" : ""}`}>
              {mine ? null : (
                <span className="line-chat-avatar small" aria-hidden="true">
                  LPK
                </span>
              )}
              <div className="line-stack">
                {message.parts.map((part, index) => {
                  if (part.type === "text" && part.text) {
                    return (
                      <p key={index} className="line-bubble">
                        {part.text}
                      </p>
                    );
                  }
                  if (part.type === "tool-openBookingForm" && part.state === "output-available") {
                    return (
                      <BookingCard key={index} copy={copy.booking} draft={part.output as BookingInput} />
                    );
                  }
                  return null;
                })}
              </div>
              <span className="line-meta">
                {mine ? <em>{copy.chat.read}</em> : null}
                {time(locale, message.metadata?.at)}
              </span>
            </div>
          );
        })}
        {status === "submitted" ? (
          <div className="line-row">
            <span className="line-chat-avatar small" aria-hidden="true">
              LPK
            </span>
            <p className="line-bubble line-typing" aria-label={copy.chat.typing}>
              <i />
              <i />
              <i />
            </p>
          </div>
        ) : null}
      </div>

      {errorText ? (
        <p className="line-chat-error" role="alert">
          {errorText}
        </p>
      ) : null}

      <form className="line-chat-input" onSubmit={send}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={copy.chat.placeholder}
          maxLength={1000}
          disabled={outOfMessages}
          aria-label={copy.chat.placeholder}
        />
        <button type="submit" disabled={!input.trim() || busy || outOfMessages}>
          {copy.chat.send}
        </button>
      </form>
      {usage ? (
        <p className={`playground-usage line-chat-usage${outOfMessages ? " is-empty" : ""}`}>
          {usageTemplate
            .replace("{remaining}", String(usage.remaining))
            .replace("{limit}", String(usage.limit))}
        </p>
      ) : null}
    </div>
  );
}

function BookingCard({ copy, draft }: { copy: Copy["booking"]; draft: BookingInput }) {
  const [sending, setSending] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmation | null>(null);
  const room = lpkHotel.rooms.find((item) => item.id === draft.roomType) ?? lpkHotel.rooms[0];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setInvalid(false);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/playground/hotel-chat/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, roomType: room.id, offer: draft.offer }),
      });
      if (!response.ok) return setInvalid(true);
      setConfirmed((await response.json()) as Confirmation);
    } catch {
      setInvalid(true);
    } finally {
      setSending(false);
    }
  };

  if (confirmed) {
    return (
      <div className="line-flex is-confirmed">
        <p className="line-flex-kicker">✓ {copy.confirmed}</p>
        <p className="line-flex-title">{confirmed.roomName}</p>
        <dl>
          <dt>{copy.bookingNo}</dt>
          <dd>{confirmed.bookingNo}</dd>
          <dt>{copy.checkIn}</dt>
          <dd>{confirmed.checkIn}</dd>
          <dt>{copy.nights}</dt>
          <dd>{confirmed.nights}</dd>
          <dt>{copy.total}</dt>
          <dd>{formatBaht(confirmed.total)}</dd>
        </dl>
        <small>{copy.totalNote}</small>
      </div>
    );
  }

  return (
    <form className="line-flex" onSubmit={submit}>
      <p className="line-flex-kicker">{copy.title}</p>
      <p className="line-flex-title">
        {room.name} <span>{formatBaht(room.rate)} / night</span>
      </p>
      {draft.offer ? (
        <p className="line-flex-offer">
          {copy.offer}: {draft.offer}
        </p>
      ) : null}
      <label>
        {copy.name}
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
      </label>
      <label>
        {copy.phone}
        <input name="phone" required inputMode="tel" pattern="[0-9+\-\s]{8,20}" autoComplete="tel" />
      </label>
      <div className="line-flex-row">
        <label>
          {copy.checkIn}
          <input name="checkIn" type="date" required defaultValue={draft.checkIn} />
        </label>
        <label>
          {copy.nights}
          <input name="nights" type="number" min={1} max={30} required defaultValue={draft.nights ?? 1} />
        </label>
        <label>
          {copy.guests}
          <input name="guests" type="number" min={1} max={6} required defaultValue={draft.guests ?? 2} />
        </label>
      </div>
      {invalid ? <p className="line-chat-error">{copy.invalid}</p> : null}
      <button type="submit" disabled={sending}>
        {sending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
