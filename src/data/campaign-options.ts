// Options for the playground's sale-campaign tool. Goals follow mek's campaign goals; themes cover the
// whole year so every month has occasions to choose from. `kind` steers the poster palette.

export type ThemeKind = "festival" | "sale" | "tribute" | "general";
type Label = { th: string; en: string };

export const campaignGoals: (Label & { id: string })[] = [
  { id: "increase_sales", th: "เพิ่มยอดขาย", en: "Increase sales" },
  { id: "brand_awareness", th: "สร้างการรับรู้แบรนด์", en: "Brand awareness" },
  { id: "new_customers", th: "หาลูกค้าใหม่", en: "New customers" },
  { id: "customer_retention", th: "รักษาลูกค้าเดิม", en: "Customer retention" },
  { id: "engagement", th: "เพิ่มการมีส่วนร่วม", en: "Engagement" },
];

export type CampaignTheme = Label & { id: string; kind: ThemeKind };

export const campaignThemeGroups: (Label & { themes: CampaignTheme[] })[] = [
  {
    th: "ทุกช่วงเวลา",
    en: "Any time",
    themes: [
      { id: "everyday", th: "โปรโมชันทั่วไป", en: "Everyday promotion", kind: "general" },
      { id: "launch", th: "เปิดตัวสินค้าใหม่", en: "New product launch", kind: "general" },
      { id: "flash-sale", th: "Flash Sale", en: "Flash sale", kind: "sale" },
      { id: "payday", th: "Payday Sale สิ้นเดือน", en: "Payday sale", kind: "sale" },
    ],
  },
  {
    th: "มกราคม",
    en: "January",
    themes: [
      { id: "new-year", th: "วันปีใหม่", en: "New Year's Day", kind: "festival" },
      { id: "children-day", th: "วันเด็กแห่งชาติ", en: "National Children's Day", kind: "tribute" },
      { id: "chinese-new-year", th: "ตรุษจีน", en: "Chinese New Year", kind: "festival" },
      { id: "1-1", th: "1.1 เทศกาลช้อปปิ้ง", en: "1.1 shopping day", kind: "sale" },
    ],
  },
  {
    th: "กุมภาพันธ์",
    en: "February",
    themes: [
      { id: "valentine", th: "วาเลนไทน์", en: "Valentine's Day", kind: "festival" },
      { id: "2-2", th: "2.2 เทศกาลช้อปปิ้ง", en: "2.2 shopping day", kind: "sale" },
    ],
  },
  {
    th: "มีนาคม",
    en: "March",
    themes: [
      { id: "womens-day", th: "วันสตรีสากล", en: "International Women's Day", kind: "tribute" },
      { id: "3-3", th: "3.3 เทศกาลช้อปปิ้ง", en: "3.3 shopping day", kind: "sale" },
      { id: "summer", th: "รับซัมเมอร์", en: "Summer kick-off", kind: "festival" },
    ],
  },
  {
    th: "เมษายน",
    en: "April",
    themes: [
      { id: "songkran", th: "สงกรานต์", en: "Songkran", kind: "festival" },
      { id: "4-4", th: "4.4 เทศกาลช้อปปิ้ง", en: "4.4 shopping day", kind: "sale" },
    ],
  },
  {
    th: "พฤษภาคม",
    en: "May",
    themes: [
      { id: "labour-day", th: "วันแรงงาน", en: "Labour Day", kind: "tribute" },
      { id: "5-5", th: "5.5 เทศกาลช้อปปิ้ง", en: "5.5 shopping day", kind: "sale" },
      { id: "back-to-school", th: "เปิดเทอม", en: "Back to school", kind: "festival" },
    ],
  },
  {
    th: "มิถุนายน",
    en: "June",
    themes: [
      { id: "6-6", th: "6.6 เทศกาลช้อปปิ้ง", en: "6.6 shopping day", kind: "sale" },
      { id: "pride", th: "Pride Month", en: "Pride Month", kind: "festival" },
      { id: "mid-year", th: "Mid-Year Sale", en: "Mid-year sale", kind: "sale" },
    ],
  },
  {
    th: "กรกฎาคม",
    en: "July",
    themes: [
      { id: "7-7", th: "7.7 เทศกาลช้อปปิ้ง", en: "7.7 shopping day", kind: "sale" },
      { id: "rainy-season", th: "หน้าฝน", en: "Rainy season", kind: "festival" },
    ],
  },
  {
    th: "สิงหาคม",
    en: "August",
    themes: [
      { id: "mothers-day", th: "วันแม่", en: "Mother's Day (Thailand)", kind: "tribute" },
      { id: "8-8", th: "8.8 เทศกาลช้อปปิ้ง", en: "8.8 shopping day", kind: "sale" },
    ],
  },
  {
    th: "กันยายน",
    en: "September",
    themes: [
      { id: "9-9", th: "9.9 เทศกาลช้อปปิ้ง", en: "9.9 shopping day", kind: "sale" },
      { id: "mid-autumn", th: "ไหว้พระจันทร์", en: "Mid-Autumn Festival", kind: "festival" },
    ],
  },
  {
    th: "ตุลาคม",
    en: "October",
    themes: [
      { id: "10-10", th: "10.10 เทศกาลช้อปปิ้ง", en: "10.10 shopping day", kind: "sale" },
      { id: "vegetarian", th: "เทศกาลกินเจ", en: "Vegetarian Festival", kind: "festival" },
      { id: "halloween", th: "ฮาโลวีน", en: "Halloween", kind: "festival" },
    ],
  },
  {
    th: "พฤศจิกายน",
    en: "November",
    themes: [
      { id: "loy-krathong", th: "ลอยกระทง", en: "Loy Krathong", kind: "festival" },
      { id: "11-11", th: "11.11 เทศกาลช้อปปิ้ง", en: "11.11 shopping day", kind: "sale" },
      { id: "black-friday", th: "Black Friday", en: "Black Friday", kind: "sale" },
    ],
  },
  {
    th: "ธันวาคม",
    en: "December",
    themes: [
      { id: "fathers-day", th: "วันพ่อ", en: "Father's Day (Thailand)", kind: "tribute" },
      { id: "12-12", th: "12.12 เทศกาลช้อปปิ้ง", en: "12.12 shopping day", kind: "sale" },
      { id: "christmas", th: "คริสต์มาส", en: "Christmas", kind: "festival" },
      { id: "countdown", th: "เคาท์ดาวน์ส่งท้ายปี", en: "Year-end countdown", kind: "festival" },
    ],
  },
];

export const findGoal = (id: string) => campaignGoals.find((goal) => goal.id === id);
export const findTheme = (id: string) =>
  campaignThemeGroups.flatMap((group) => group.themes).find((theme) => theme.id === id);
