"use client";

import { useEffect, useMemo, useState } from "react";

function promosForDate(date: Date) {
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const stock = 18 + ((date.getDate() * 7) % 23);
  const lock = 24 + ((date.getHours() * 9 + date.getMinutes()) % 36);

  return [
    {
      label: weekend ? "Weekend drop" : "Surprise deal",
      message: weekend ? "Weekend card prices just unlocked." : "Fresh card prices just refreshed.",
      meta: `${lock} min lock`
    },
    {
      label: weekend ? "Weekend stock" : "Limited cards",
      message: weekend ? "Gaming and retail cards are moving fast today." : "Selected cards are close to today’s stock limit.",
      meta: `${stock} left today`
    },
    {
      label: "Crypto ready",
      message: "Pay with the coin you prefer at checkout.",
      meta: "live quote"
    }
  ];
}

export default function PromoStrip() {
  const promos = useMemo(() => promosForDate(new Date()), []);
  const [promo] = useState(() => promos[Math.floor(Math.random() * promos.length)]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = "karrycards-promo-last-seen";
    const lastSeen = Number(window.sessionStorage.getItem(key) || 0);
    const canShow = Date.now() - lastSeen > 30 * 60 * 1000;

    if (!canShow) return;

    const showTimer = window.setTimeout(() => {
      setVisible(true);
      window.sessionStorage.setItem(key, String(Date.now()));
    }, 30000);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 40500);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <aside className="promo-toast" role="status" aria-live="polite" aria-label={promo.label}>
      <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss offer">x</button>
      <span>{promo.label}</span>
      <strong>{promo.message}</strong>
      <em>{promo.meta}</em>
    </aside>
  );
}
