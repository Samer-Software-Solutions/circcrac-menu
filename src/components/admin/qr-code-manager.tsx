"use client";

import QRCode from "qrcode";
import { Download, ExternalLink, LoaderCircle, QrCode } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type QrCodeManagerProps = {
  logoUrl: string | null;
  publicUrl: string;
  restaurantName: string;
};

type QrAssets = {
  pngDataUrl: string;
  svg: string;
  warning?: string;
};

const OUTPUT_SIZE = 2048;
// Error correction level H recovers ~30% of the code, so the logo plus its
// quiet-zone padding can safely occupy roughly a quarter of the width.
const LOGO_RATIO = 0.30;
const LOGO_PADDING_RATIO = 0.01;
const overlaySize = Math.round(OUTPUT_SIZE * LOGO_RATIO);
const overlayPadding = Math.round(OUTPUT_SIZE * LOGO_PADDING_RATIO);
const overlayX = Math.round((OUTPUT_SIZE - overlaySize) / 2);
const overlayY = overlayX;

const qrOptions = {
  color: { dark: "#e0332d", light: "#242021" },
  errorCorrectionLevel: "H" as const,
  margin: 4,
  width: OUTPUT_SIZE,
};

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = source;
  });
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Logo data could not be read."));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Logo could not be read."));
    reader.readAsDataURL(blob);
  });
}

async function loadLogoDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Logo request failed.");
  }
  return readBlobAsDataUrl(await response.blob());
}

async function composePngWithLogo(
  qrDataUrl: string,
  logoDataUrl: string,
): Promise<string> {
  const [qrImage, logoImage] = await Promise.all([
    loadImage(qrDataUrl),
    loadImage(logoDataUrl),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("PNG export is not available in this browser.");
  }

  context.drawImage(qrImage, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.fillStyle = "#FFFFFF";
  context.fillRect(
    overlayX - overlayPadding,
    overlayY - overlayPadding,
    overlaySize + overlayPadding * 2,
    overlaySize + overlayPadding * 2,
  );
  const scale = Math.min(overlaySize / logoImage.width, overlaySize / logoImage.height);
  const width = logoImage.width * scale;
  const height = logoImage.height * scale;
  context.drawImage(
    logoImage,
    overlayX + (overlaySize - width) / 2,
    overlayY + (overlaySize - height) / 2,
    width,
    height,
  );
  return canvas.toDataURL("image/png");
}

function composeSvgWithLogo(svg: string, logoDataUrl: string): string {
  // qrcode's SVG viewBox uses its module grid, even when its rendered width is
  // 2048px. Derive the overlay from that grid so it remains centered in every
  // print size rather than accidentally placing a 2048px overlay off-canvas.
  const viewBox = svg.match(/viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/);
  const viewBoxWidth = Number(viewBox?.[1]);
  const viewBoxHeight = Number(viewBox?.[2]);
  if (!Number.isFinite(viewBoxWidth) || !Number.isFinite(viewBoxHeight)) {
    return svg;
  }
  const size = Math.min(viewBoxWidth, viewBoxHeight) * LOGO_RATIO;
  const padding = Math.min(viewBoxWidth, viewBoxHeight) * LOGO_PADDING_RATIO;
  const x = (viewBoxWidth - size) / 2;
  const y = (viewBoxHeight - size) / 2;
  const overlay = `<rect x="${x - padding}" y="${y - padding}" width="${size + padding * 2}" height="${size + padding * 2}" fill="#FFFFFF"/><image href="${logoDataUrl}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;
  return svg.replace("</svg>", `${overlay}</svg>`);
}

async function createQrAssets(
  publicUrl: string,
  logoUrl: string | null,
): Promise<QrAssets> {
  const [pngDataUrl, svg] = await Promise.all([
    QRCode.toDataURL(publicUrl, qrOptions),
    QRCode.toString(publicUrl, { ...qrOptions, type: "svg" }),
  ]);
  if (!logoUrl) {
    return { pngDataUrl, svg };
  }

  try {
    const logoDataUrl = await loadLogoDataUrl(logoUrl);
    return {
      pngDataUrl: await composePngWithLogo(pngDataUrl, logoDataUrl),
      svg: composeSvgWithLogo(svg, logoDataUrl),
    };
  } catch (error) {
    console.warn("Could not add the restaurant logo to the QR code.", error);
    return {
      pngDataUrl,
      svg,
      warning:
        "The restaurant logo could not be loaded, so the QR code was generated without it.",
    };
  }
}

function downloadFile(contents: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function QrCodeManager({
  logoUrl,
  publicUrl,
  restaurantName,
}: QrCodeManagerProps) {
  const [assets, setAssets] = useState<QrAssets | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    // Defer clearing prior output so React does not synchronously cascade a
    // render from this synchronization effect when props change.
    void Promise.resolve().then(() => {
      if (current) {
        setAssets(null);
        setError(null);
      }
    });
    void createQrAssets(publicUrl, logoUrl)
      .then((nextAssets) => {
        if (current) {
          setAssets(nextAssets);
        }
      })
      .catch((generationError: unknown) => {
        console.error("Failed to generate the CMS QR code.", generationError);
        if (current) {
          setError("We couldn’t generate the QR code. Please refresh and try again.");
        }
      });
    return () => {
      current = false;
    };
  }, [logoUrl, publicUrl]);

  return (
    <section className="max-w-3xl" aria-labelledby="qr-code-title">
      <p className="text-sm font-medium text-muted-foreground">Public menu</p>
      <h1 id="qr-code-title" className="mt-1 text-3xl font-semibold tracking-tight">
        QR code
      </h1>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
        Print this permanent entry point for {restaurantName}. Visitors are sent to their preferred language after scanning.
      </p>

      <div className="mt-7 grid gap-6 rounded-xl border bg-background p-4 shadow-xs sm:grid-cols-[minmax(0,1fr)_18rem] sm:items-center sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium">Public menu URL</p>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-2 flex min-h-11 items-center gap-2 break-all rounded-lg border bg-muted/40 px-3 font-mono text-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            {publicUrl}
          </a>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The encoded URL stays at the site root, without a locale or CMS path.
          </p>
          {assets?.warning ? <p role="alert" className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm leading-6">{assets.warning}</p> : null}
          {error ? <p role="alert" className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          {assets ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={() => downloadDataUrl(assets.pngDataUrl, "criccrac-menu-qr.png")}>
                <Download aria-hidden="true" /> Download PNG
              </Button>
              <Button type="button" variant="outline" onClick={() => downloadFile(assets.svg, "image/svg+xml;charset=utf-8", "criccrac-menu-qr.svg")}>
                <Download aria-hidden="true" /> Download SVG
              </Button>
            </div>
          ) : null}
        </div>
        <div className="grid aspect-square w-full max-w-xs place-items-center justify-self-center rounded-xl border bg-white p-4">
          {assets ? <NextImage src={assets.pngDataUrl} alt={`QR code for ${restaurantName} public menu`} width={OUTPUT_SIZE} height={OUTPUT_SIZE} unoptimized className="size-full object-contain" /> : error ? <QrCode className="size-20 text-muted-foreground" aria-hidden="true" /> : <LoaderCircle className="size-8 animate-spin text-muted-foreground" aria-label="Generating QR code" />}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Downloads are 2048 × 2048 pixels with high error correction and a centered logo overlay when available.
      </p>
    </section>
  );
}
