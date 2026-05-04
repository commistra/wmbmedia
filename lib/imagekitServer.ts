import { ImageKit } from "@imagekit/nodejs";

export function getImageKit() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? "";

  if (!privateKey) {
    throw new Error("Missing IMAGEKIT_PRIVATE_KEY env var");
  }

  // @imagekit/nodejs v7 uses `privateKey` for API auth. URL endpoint / public key
  // are not part of the server SDK client options.
  return new ImageKit({ privateKey });
}
