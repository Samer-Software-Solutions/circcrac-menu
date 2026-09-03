import Image from "next/image";

type MenuItemCardProps = {
  available: boolean;
  description: string | null;
  imageAlt: string;
  imageUrl: string | null;
  name: string;
  price: string;
  unavailableLabel: string;
};

export function MenuItemCard({
  available,
  description,
  imageAlt,
  imageUrl,
  name,
  price,
  unavailableLabel,
}: MenuItemCardProps) {
  return (
    <article
      className={`menu-item-card${imageUrl ? " menu-item-card-with-image" : ""}${available ? "" : " menu-item-unavailable"}`}
    >
      {imageUrl ? (
        <div className="menu-item-image-frame">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) calc(50vw - 52px), 520px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="menu-item-content">
        <div className="flex items-start justify-between gap-5">
          <h3 className="min-w-0 text-[1.08rem] leading-snug font-semibold tracking-[-0.015em] text-stone-900 sm:text-lg">
            {name}
          </h3>
          <p className="shrink-0 pt-0.5 text-[0.95rem] leading-snug font-semibold whitespace-nowrap text-stone-900">
            {price}
          </p>
        </div>

        {description ? (
          <p className="mt-2.5 max-w-[48ch] text-[0.9rem] leading-6 text-stone-600">
            {description}
          </p>
        ) : null}

        {!available ? (
          <p className="menu-unavailable-label">{unavailableLabel}</p>
        ) : null}
      </div>
    </article>
  );
}
