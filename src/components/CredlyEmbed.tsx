interface CredlyEmbedProps {
  /** The Credly badge id, used to link to the verification page. */
  badgeId: string;
  /** The Credly image id (from images.credly.com/images/<imageId>/image.png). */
  imageId: string;
  /** The certification title. */
  title: string;
  /** The organization that issued the badge. */
  issuer: string;
}

export default function CredlyEmbed({
  badgeId,
  imageId,
  title,
  issuer,
}: CredlyEmbedProps) {
  return (
    <a
      href={`https://www.credly.com/badges/${badgeId}/public_url`}
      target="_blank"
      rel="noopener noreferrer"
      title={`Verify "${title}" on Credly`}
      className="group flex w-full max-w-md items-center gap-4 rounded-md bg-gradient-to-br from-white/5 to-white/3 p-4 transition hover:from-primary/10 hover:to-white/5"
    >
      <img
        src={`https://images.credly.com/images/${imageId}/image.png`}
        alt={title}
        width={80}
        height={80}
        loading="lazy"
        className="h-20 w-20 shrink-0 object-contain"
      />
      <div className="flex flex-col">
        <span className="font-semibold tracking-tight text-foreground">
          {title}
        </span>
        <span className="text-sm text-muted-foreground">Issued by {issuer}</span>
      </div>
    </a>
  );
}
