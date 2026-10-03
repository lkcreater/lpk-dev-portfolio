import { brandIcon } from "./brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS applies its own rounded mask, so the square stays square.
  return brandIcon(size.width, 0);
}
