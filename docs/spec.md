สร้างเว็บไซต์ Portfolio แบบ Premium / Luxury / Modern Editorial โดยใช้ Next.js + TypeScript และรองรับ 2 ภาษา คือ English และ Thai

เป้าหมายของเว็บไซต์:
- ให้ความรู้สึกหรู ดูแพง ทันสมัย และมีความเป็น Creative Technology
- Animation ต้อง smooth, cinematic และมี interaction ขณะ scroll
- ไม่ให้ดูเหมือน Landing Page template ทั่วไป
- เน้น Typography, White Space, Motion และ Visual Storytelling
- Desktop ต้องมีประสบการณ์ที่โดดเด่น แต่ Mobile ต้องใช้งานได้ดีและไม่หนักเกินไป

TECH STACK
- Next.js ด้วย App Router
- TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger สำหรับ scroll animation
- Framer Motion ใช้เฉพาะ micro interaction / UI transition ที่เหมาะสม
- Lenis สำหรับ smooth scrolling
- next/image
- next/font
- รองรับ Responsive Design
- รองรับ SEO
- รองรับ prefers-reduced-motion
- Optimize animation ให้ใช้ transform / opacity เป็นหลัก
- หลีกเลี่ยง animation ที่ทำให้ layout shift หรือกระตุก
- Code structure ต้อง maintainable และแยก component ชัดเจน

LANGUAGE
รองรับ:
- EN
- TH

สร้าง Language Switcher ที่ Header เช่น:

EN / TH

เมื่อเปลี่ยนภาษา:
- เปลี่ยนข้อความทั้งหมดโดยไม่ reload หน้า
- เก็บภาษาที่เลือกไว้
- รองรับ URL structure เช่น:
  /en
  /th

ใช้ dictionary / translation structure ที่สามารถเพิ่มภาษาใหม่ภายหลังได้

DESIGN DIRECTION

Visual Style:
- Luxury minimal
- Editorial design
- Contemporary creative studio
- High-end digital agency
- Modern architecture / fashion magazine influence
- Clean grid
- Oversized typography
- Strong typography hierarchy
- Large whitespace
- Subtle gradients
- Elegant monochrome palette
- Black / Off-white / Warm Gray
- ใช้ accent color เพียงเล็กน้อย

หลีกเลี่ยง:
- Glassmorphism เยอะเกินไป
- Gradient สีรุ้ง
- UI แบบ SaaS dashboard
- Card เต็มหน้า
- Animation เด้งแรง
- Rounded card ทุกอย่าง
- Template style ที่ดู generic

TYPOGRAPHY

ภาษาอังกฤษ:
ใช้ modern sans serif หรือ editorial grotesk

ภาษาไทย:
เลือก font ที่ดู modern และเข้ากับภาษาอังกฤษ

Typography ต้องเป็นองค์ประกอบหลักของเว็บไซต์

ตัวอย่าง hierarchy:
Hero Heading:
72–140px บน Desktop

Section Heading:
48–90px

Body:
16–20px

Hero headline อาจแบ่งเป็นหลายบรรทัด และ animation ทีละ line / word

SITE STRUCTURE

1. PRELOADER

สร้าง minimal preloader

ตัวอย่าง:
0 → 100%

หรือ

INITIALIZING
PORTFOLIO

Animation:
- ตัวเลขเพิ่ม
- Logo / name reveal
- หลังโหลดเสร็จให้ transition เข้า Hero อย่าง smooth
- ไม่เกินความจำเป็น
- Skip preloader animation ถ้าผู้ใช้เคยเข้าหน้าแล้วใน session เดียวกัน

2. NAVIGATION

Header แบบ minimal

ซ้าย:
Logo / Name

กลางหรือขวา:
Work
About
Services
Contact

และ Language:
EN / TH

Behavior:
- Transparent ตอนอยู่ Hero
- เมื่อ scroll เปลี่ยนเป็น minimal sticky header
- Hide ขณะ scroll ลง
- Reveal เมื่อ scroll ขึ้น
- Menu item มี subtle hover animation
- Mobile ใช้ full-screen menu animation

3. HERO SECTION

Full viewport 100vh

ตัวอย่าง content:

EN:
CREATIVE TECHNOLOGIST
DESIGNING DIGITAL
EXPERIENCES THAT MOVE.

TH:
นักสร้างสรรค์เทคโนโลยี
ออกแบบประสบการณ์ดิจิทัล
ที่เคลื่อนไหวและมีชีวิต

Hero ต้องมี:
- Oversized typography
- Animated line reveal
- Text mask animation
- Mouse movement subtle parallax
- Floating visual element หรือ abstract graphic
- Scroll indicator ด้านล่าง

Scroll indicator:
SCROLL TO EXPLORE

เมื่อ scroll:
Hero text ค่อย ๆ scale down / fade
Visual object move ตาม scroll

4. INTRO / ABOUT STATEMENT

ใช้ข้อความขนาดใหญ่ประมาณ editorial statement

ตัวอย่าง:

"I design digital products where
technology, motion and storytelling
come together."

Animation:
- Scroll reveal ทีละบรรทัด
- แต่ละคำเปลี่ยน opacity จาก gray → black
- หรือ text scrub ตาม scroll

ด้านข้างอาจมี:
Based in Bangkok
Available Worldwide
Digital / AI / Product / Motion

5. SELECTED WORK

หัวข้อ:
SELECTED WORK
01 — 05

แต่ละ Project เป็น Full-width หรือ large editorial layout

Project item มี:
- Project number
- Project title
- Category
- Year
- Large image/video
- Short description

ตัวอย่าง:

01
NISSAN SOCIAL COMMAND
Social CRM / AI / Analytics
2026

Animation:
- Project image reveal ด้วย clip-path
- Image scale 1.1 → 1
- Text slide up
- Image parallax
- Hover image distortion หรือ scale subtle
- Cursor เปลี่ยนเป็น VIEW PROJECT

เมื่อ scroll ผ่านแต่ละ project:
Project number / background / typography สามารถ transition อย่าง smooth

6. HORIZONTAL PROJECT SHOWCASE

สร้าง section horizontal scroll

เมื่อ user scroll แนวตั้ง:
เปลี่ยนเป็น horizontal movement ของ project cards

ตัวอย่าง:

[ PROJECT 01 ] → [ PROJECT 02 ] → [ PROJECT 03 ]

แต่ละ project:
- Large image
- Title
- Category
- Year

ใช้ GSAP ScrollTrigger pin section

Animation ต้อง smooth และไม่เร็วเกินไป

บน Mobile:
เปลี่ยนกลับเป็น vertical list
ไม่ใช้ pinned horizontal scroll

7. FEATURED CASE STUDY

สร้าง section ที่มี cinematic storytelling

Layout:
Visual เต็มจอ + information overlay

Scroll sequence:

Step 1:
Project overview

Step 2:
Challenge

Step 3:
Approach

Step 4:
Solution

Step 5:
Result

แต่ละ step reveal ตาม scroll

สามารถใช้ sticky visual ด้านหนึ่ง
และ text scroll อีกด้านหนึ่ง

8. SERVICES / EXPERTISE

แสดงเป็น large typography list:

01
PRODUCT DESIGN

02
AI EXPERIENCE

03
WEB DEVELOPMENT

04
MOTION DESIGN

05
DIGITAL STRATEGY

Interaction:
เมื่อ hover แต่ละ service:
- background image/video เปลี่ยน
- text shift เล็กน้อย
- number animate
- cursor interaction

Mobile ใช้ simple accordion

9. EXPERIMENT / CREATIVE LAB

Section สำหรับ experiment

หัวข้อ:
LAB / EXPERIMENTS

แสดง:
AI
Generative Art
Motion
Interactive Web
Experimental UI

ใช้ grid ที่ playful ขึ้นเล็กน้อย แต่ยังคง premium

แต่ละ item อาจมี:
- WebGL preview
- Motion thumbnail
- Interactive hover

10. ABOUT SECTION

Split layout

ซ้าย:
Large portrait / abstract image

ขวา:
Bio

ตัวอย่าง:

I work at the intersection of
design, technology and artificial intelligence.

My focus is turning complex systems
into simple, human digital experiences.

ข้อมูล:
Location
Experience
Specialization
Current Focus

Image มี subtle parallax

11. MARQUEE / STATEMENT

Full width typography marquee

ตัวอย่าง:

DESIGN × TECHNOLOGY × AI × MOTION × STORYTELLING

Animation:
slow continuous marquee

แต่ต้อง subtle
ไม่เร็ว
ไม่รก

12. CONTACT

Full screen closing section

ข้อความใหญ่:

HAVE A PROJECT?
LET'S CREATE
SOMETHING GREAT.

หรือภาษาไทย:

มีโปรเจกต์ใหม่?
มาสร้างอะไรดี ๆ
ไปด้วยกัน

CTA:
START A PROJECT

Email
LinkedIn
GitHub

Hover CTA ให้มี magnetic effect

13. FOOTER

Minimal footer

แสดง:
© 2026
Bangkok, Thailand
Local Time
Back to Top

Local Time สามารถ update real-time

SCROLL ANIMATION SYSTEM

สร้าง animation system ที่ consistent ทั้งเว็บ

แบ่งเป็น animation primitives:

- fadeUp
- fadeIn
- slideReveal
- maskReveal
- lineReveal
- textScrub
- staggerReveal
- imageReveal
- parallax
- scaleOnScroll
- horizontalScroll
- stickySection
- magneticHover

Animation duration:
ประมาณ 0.6–1.2 วินาที

Easing:
ใช้ premium easing เช่น:
power3.out
power4.out
expo.out

ScrollTrigger:
scrub ใช้ประมาณ 0.5–1.5

ไม่ใช้ animation มากเกินไป
ให้แต่ละ section มีจังหวะพัก

PAGE TRANSITIONS

เมื่อเปิด Project Detail:

Current page
→ image expand
→ transition เต็มจอ
→ project page

Project detail page มี:
Hero
Overview
Problem
Process
Design
Result
Next project

ใช้ shared transition feeling
แต่ไม่จำเป็นต้องใช้ View Transition API ถ้าทำให้ระบบซับซ้อนเกินไป

CUSTOM CURSOR

Desktop เท่านั้น

Default:
small dot / circle

Hover project:
VIEW

Hover link:
OPEN

Hover CTA:
LET'S TALK

Cursor ต้อง smooth และ subtle

RESPONSIVE

Desktop:
เต็ม animation

Tablet:
ลด parallax บางส่วน

Mobile:
- Disable heavy scroll pinning
- Disable custom cursor
- Horizontal project → Vertical
- ลด animation duration
- Typography responsive
- Maintain premium feeling

PERFORMANCE

เป้าหมาย:
- Lighthouse Performance 90+
- Lazy load images/video
- Dynamically import heavy interactive components
- ใช้ GPU-friendly transforms
- Cleanup GSAP ScrollTrigger เมื่อ component unmount
- ไม่สร้าง ScrollTrigger ซ้ำ
- Respect prefers-reduced-motion

CODE STRUCTURE

ใช้ structure ประมาณ:

app/
  [locale]/
    page.tsx
    work/
      [slug]/
        page.tsx

components/
  layout/
    Header.tsx
    Footer.tsx
    LanguageSwitcher.tsx

  sections/
    Hero.tsx
    Intro.tsx
    SelectedWork.tsx
    HorizontalProjects.tsx
    CaseStudy.tsx
    Services.tsx
    Lab.tsx
    About.tsx
    Contact.tsx

  motion/
    FadeUp.tsx
    TextReveal.tsx
    ImageReveal.tsx
    Parallax.tsx
    MagneticButton.tsx

lib/
  animations/
  i18n/
  utils/

data/
  projects.ts

messages/
  en.json
  th.json

IMPORTANT

อย่าสร้างแค่ static mockup

ต้อง implement animation และ interaction จริงทั้งหมด

ต้องเขียน reusable components สำหรับ animation

เน้นความรู้สึก:
Luxury
Cinematic
Editorial
Smooth
Minimal
Creative Technology

เว็บไซต์ต้องมี visual rhythm ที่ดี:
Hero impact
→ slow introduction
→ strong project showcase
→ immersive case study
→ simple information
→ powerful contact ending

สุดท้ายให้สร้าง project ที่สามารถ run ได้จริงด้วย:

npm install
npm run dev

และตรวจสอบ:
- ไม่มี TypeScript error
- ไม่มี hydration error
- Responsive ทุก breakpoint
- ภาษา EN / TH ทำงานจริง
- Animation ไม่กระตุก
- ScrollTrigger cleanup ถูกต้อง
- ไม่มี horizontal overflow