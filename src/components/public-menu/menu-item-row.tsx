import Image from "next/image";

type MenuItemRowProps = {
  available: boolean;
  description: string | null;
  eagerImage: boolean;
  imageAlt: string;
  imageUrl: string | null;
  name: string;
  price: string;
  unavailableLabel: string;
};

export function MenuItemRow({
  available,
  description,
  eagerImage,
  imageAlt,
  imageUrl,
  name,
  price,
  unavailableLabel,
}: MenuItemRowProps) {
  return (
    <article
      className={`menu-item-row${available ? "" : " menu-item-row-unavailable"}`}
    >
      {imageUrl ? (
        <div className="menu-item-thumb">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            loading={eagerImage ? "eager" : "lazy"}
            sizes="68px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="menu-item-body">
        <div className="menu-item-heading">
          <h3 className="menu-item-name">{name}</h3>
          <span className="menu-item-leader" aria-hidden="true" />
          <p className="menu-item-price">{price}</p>
        </div>

        {description ? <p className="menu-item-desc">{description}</p> : null}

        {!available ? (
          <p className="menu-item-badge">{unavailableLabel}</p>
        ) : null}
      </div>
    </article>
  );
}
