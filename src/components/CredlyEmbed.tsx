import { useEffect, useRef } from "react";

export default function CredlyEmbed(badgeId: { badgeId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.credly.com/assets/utilities/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-iframe-width="300"
      data-iframe-height="270"
      data-share-badge-id={badgeId.badgeId}
      data-share-badge-host="https://www.credly.com"
    />
  );
}