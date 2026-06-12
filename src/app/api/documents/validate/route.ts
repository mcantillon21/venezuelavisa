import { NextResponse } from "next/server";
import { createHash } from "crypto";

/* POST multipart { file } → server-side checks no client can skip:
   real type via magic bytes (not the filename), 5 MB cap, minimum image
   dimensions parsed from the actual headers, sha256 for audit trails. */

const MAX_BYTES = 5 * 1024 * 1024;
const MIN_IMAGE_PX = 400;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const issues: string[] = [];

  if (buf.length > MAX_BYTES) issues.push("too_large");
  if (buf.length < 1024) issues.push("too_small");

  const kind = sniff(buf);
  if (!kind) issues.push("bad_format");

  let width: number | undefined;
  let height: number | undefined;
  if (kind === "png") [width, height] = pngSize(buf);
  if (kind === "jpeg") [width, height] = jpegSize(buf);
  if (width !== undefined && height !== undefined && Math.min(width, height) < MIN_IMAGE_PX) {
    issues.push("low_resolution");
  }

  return NextResponse.json({
    ok: issues.length === 0,
    kind,
    size: buf.length,
    width,
    height,
    sha256: createHash("sha256").update(buf).digest("hex"),
    issues,
  });
}

function sniff(b: Buffer): "jpeg" | "png" | "pdf" | null {
  if (b.length < 8) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "png";
  if (b.subarray(0, 4).toString("latin1") === "%PDF") return "pdf";
  return null;
}

function pngSize(b: Buffer): [number, number] {
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

function jpegSize(b: Buffer): [number, number] | [undefined, undefined] {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    // SOF0–SOF15 except DHT/JPG/DAC carry dimensions
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return [undefined, undefined];
}
