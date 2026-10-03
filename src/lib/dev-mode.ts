import "server-only";

// Local-only LINE login bypass. Never active in production, even if DEV_MODE is set there by mistake.
export const isDevMode = () => process.env.DEV_MODE === "true" && process.env.NODE_ENV !== "production";
