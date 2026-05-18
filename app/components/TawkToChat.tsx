import Script from "next/script";

export default function TawkToChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "6a0a5c225081b91c34af6c9a";
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "default";
  const enabledInDevelopment = process.env.NEXT_PUBLIC_TAWK_ENABLE_IN_DEV === "true";

  if (!propertyId || (process.env.NODE_ENV !== "production" && !enabledInDevelopment)) return null;

  return (
    <>
      <Script id="tawk-to-config" strategy="afterInteractive">
        {`window.Tawk_API = window.Tawk_API || {}; window.Tawk_LoadStart = new Date();`}
      </Script>
      <Script
        id="tawk-to-widget"
        src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </>
  );
}
