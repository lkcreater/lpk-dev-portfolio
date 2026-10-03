import { randomInt } from "node:crypto";
import { z } from "zod";
import { lpkHotel } from "@/data/lpk-hotel";
import { getSession } from "@/lib/session";

const booking = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,20}$/),
  roomType: z.enum(lpkHotel.rooms.map((room) => room.id) as [string, ...string[]]),
  checkIn: z.iso.date(),
  nights: z.coerce.number().int().min(1).max(30),
  guests: z.coerce.number().int().min(1).max(6),
  offer: z.string().max(200).optional(),
});

// Simulated confirmation for the role-play demo: nothing is stored or sent anywhere.
export async function POST(request: Request) {
  if (!(await getSession())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const parsed = booking.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "invalid_booking" }, { status: 400 });

  const { roomType, nights, checkIn } = parsed.data;
  const room = lpkHotel.rooms.find((item) => item.id === roomType)!;
  const date = checkIn.replaceAll("-", "").slice(2);
  return Response.json({
    ...parsed.data,
    roomName: room.name,
    total: room.rate * nights,
    bookingNo: `LPK-${date}-${String(randomInt(0, 10000)).padStart(4, "0")}`,
  });
}
