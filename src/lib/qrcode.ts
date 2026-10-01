import QRCode from "qrcode";

/** Server-side QR → inline SVG string (dark navy, no margin) */
export async function qrSvg(data: string, width = 120): Promise<string> {
  const svg = await QRCode.toString(data, {
    type: "svg",
    width,
    margin: 0,
    color: { dark: "#1e1b4b", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
  return svg;
}

/** Card-size (CR80-ish) helpers */
export const CARD_W = "w-[340px]";
export const CARD_H = "h-[214px]";
