"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";

function bangkokTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function Footer({ copy }: { copy: Dictionary["footer"] }) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(bangkokTime());
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <footer className="site-footer">
      <span>© 2026 LPK</span>
      <span>{copy.location}</span>
      <span>
        {copy.localTime} <b>{time}</b>
      </span>
      <a href="#top" data-cursor="OPEN">
        {copy.top} ↑
      </a>
    </footer>
  );
}
