"use client";

import { useEffect } from "react";
import { API_BASE_URL } from "../lib/api";

export default function VisitorTracker() {
  useEffect(() => {
    if (!API_BASE_URL) return;

    const storageKey = "karrycards-visitor-session";
    const trackedKey = "karrycards-visitor-tracked";
    const now = Date.now();
    const trackedAt = Number(window.sessionStorage.getItem(trackedKey) || 0);

    if (trackedAt && now - trackedAt < 30 * 60 * 1000) return;

    const sessionId = window.sessionStorage.getItem(storageKey) || crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, sessionId);
    window.sessionStorage.setItem(trackedKey, String(now));

    fetch(`${API_BASE_URL}/visitor-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        page_url: window.location.href,
        referrer: document.referrer,
        session_id: sessionId
      })
    }).catch(() => undefined);
  }, []);

  return null;
}
