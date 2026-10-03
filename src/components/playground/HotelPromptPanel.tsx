import { buildHotelInstructions } from "@/agent-skill/hotel-roleplay";
import { formatBaht, lpkHotel } from "@/data/lpk-hotel";
import type { Dictionary } from "@/lib/i18n";

// Read-only view of what the chatbot is told. Built from the same data and prompt builder as the API.
export function HotelPromptPanel({ copy }: { copy: Dictionary["playground"]["hotel"] }) {
  const h = lpkHotel;

  return (
    <aside className="hotel-prompt" aria-label={copy.promptLabel}>
      <p className="svg-tool-label">{copy.promptLabel}</p>
      <p className="playground-note">{copy.promptNote}</p>

      <section>
        <h2>{copy.hotelLabel}</h2>
        <p className="hotel-prompt-name">{h.name}</p>
        <p>{h.tagline}</p>
        <dl>
          <dt>Location</dt>
          <dd>{h.location}</dd>
          <dt>Check-in / out</dt>
          <dd>
            {h.checkIn} / {h.checkOut}
          </dd>
          <dt>Facilities</dt>
          <dd>{h.facilities.join(" · ")}</dd>
        </dl>
      </section>

      <section>
        <h2>{copy.staffLabel}</h2>
        <p className="hotel-prompt-name">
          {h.staff.name} ({h.staff.thaiName}) — {h.staff.role}
        </p>
        <p>{h.staff.tone}</p>
      </section>

      <section>
        <h2>{copy.roomsLabel}</h2>
        <ul className="hotel-prompt-rooms">
          {h.rooms.map((room) => (
            <li key={room.id}>
              <span>
                {room.name}
                <small>
                  {room.size} · {room.bed} · {room.guests} pax
                </small>
              </span>
              <b>{formatBaht(room.rate)}</b>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{copy.offersLabel}</h2>
        <ol className="hotel-prompt-offers">
          {h.offers.map((offer) => (
            <li key={offer}>{offer}</li>
          ))}
        </ol>
      </section>

      <details className="hotel-prompt-raw">
        <summary>{copy.systemPromptLabel}</summary>
        <pre>{buildHotelInstructions()}</pre>
      </details>
    </aside>
  );
}
