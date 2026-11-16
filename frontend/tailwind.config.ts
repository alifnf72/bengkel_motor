import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { bg: "#0B0E1A", card: "#151A2C", line: "#252B40", tx: "#E8EAF2", mut: "#8B92A8", ac: "#FF5A36", ok: "#2FBF71", warn: "#F5B93B", bad: "#F0524F" } } },
  plugins: [],
};
export default config;
