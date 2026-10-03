import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The gradient logo fades to white, so icons sit it on the site's dark ink background.
export async function brandIcon(size: number, radius: number) {
  const logo = await readFile(join(process.cwd(), "public/images/brand/lpk-logo-gradient.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
        background: "#121210",
      }}
    >
      <img src={src} width={size} height={size} alt="" />
    </div>,
    { width: size, height: size },
  );
}
