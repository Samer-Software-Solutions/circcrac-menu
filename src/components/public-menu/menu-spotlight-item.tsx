import Image from "next/image";

type MenuSpotlightItemProps = {
  available: boolean;
  description: string | null;
  eagerImage: boolean;
  imageAlt: string;
  imageUrl: string;
  name: string;
  price: string;
  unavailableLabel: string;
};

export function MenuSpotlightItem({
  available,
  description,
  eagerImage,
  imageAlt,
  imageUrl,
  name,
  price,
  unavailableLabel,
}: MenuSpotlightItemProps) {
  return (
    <article
      className={`menu-spotlight${available ? "" : " menu-spotlight-unavailable"}`}
    >
      <div className="menu-spotlight-media">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          loading={eagerImage ? "eager" : "lazy"}
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) calc(50vw - 52px), 640px"
          className="object-cover"
        />
      </div>
      <div className="menu-spotlight-scrim" aria-hidden="true" />

      {!available ? (
        <p className="menu-spotlight-flag">{unavailableLabel}</p>
      ) : null}

      <div className="menu-spotlight-content">
        <h3 className="menu-spotlight-name">{name}</h3>
        <p className="menu-spotlight-price">{price}</p>
        {description ? (
          <p className="menu-spotlight-desc">{description}</p>
        ) : null}
      </div>
    </article>
  );
}
