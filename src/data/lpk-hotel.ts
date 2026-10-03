// Fictional hotel used by the playground's role-play chatbot. Single source of truth for the
// system prompt, the read-only prompt panel and the simulated booking price.

export const lpkHotel = {
  name: "LPK Hotel Bangkok",
  tagline: "A calm, design-led city hotel on Sukhumvit",
  location: "Sukhumvit 24, Bangkok — 3 minutes' walk to BTS Phrom Phong, 5 minutes to EmQuartier",
  checkIn: "14:00",
  checkOut: "12:00",
  contact: "LINE @lpkhotel · +66 2 000 2424",
  facilities: [
    "Rooftop infinity pool (07:00–21:00)",
    "24-hour fitness centre",
    "Lumen Spa — Thai massage and aromatherapy",
    "Ember rooftop bar with city views",
    "All-day dining at Saffron Kitchen",
    "Free high-speed Wi-Fi",
    "Co-working lounge",
  ],
  policies: [
    "Free cancellation up to 3 days before arrival; after that the first night is charged",
    "Children under 6 stay free using existing beds",
    "Pets are not allowed",
    "Smoking only in the designated rooftop area",
  ],
  rooms: [
    { id: "deluxe", name: "Deluxe Room", size: "32 m²", bed: "King or twin", guests: 2, rate: 3200 },
    { id: "premier", name: "Premier City View", size: "38 m²", bed: "King", guests: 2, rate: 4200 },
    { id: "family", name: "Family Suite", size: "55 m²", bed: "King + 2 singles", guests: 4, rate: 6500 },
    {
      id: "lpk-suite",
      name: "LPK Signature Suite",
      size: "78 m²",
      bed: "King, separate living room",
      guests: 3,
      rate: 9800,
    },
  ],
  breakfast: { price: 450, note: "per person, Saffron Kitchen buffet" },
  // Offered in order, one step at a time, only when the guest hesitates.
  offers: [
    "Book directly in this chat: 10% off the best available rate",
    "Free breakfast for two for the whole stay",
    "Stay 3 nights, pay 2 (Deluxe and Premier only)",
    "Free upgrade to the next room category, subject to availability",
    "Free one-way airport transfer from Suvarnabhumi",
  ],
  staff: {
    name: "Mint",
    thaiName: "มิ้นท์",
    role: "Reservations Officer",
    tone: "warm, polite and concise; friendly emoji at most once per message",
  },
};

export type HotelRoomId = (typeof lpkHotel.rooms)[number]["id"];

export const formatBaht = (value: number) => `฿${value.toLocaleString("en-US")}`;
