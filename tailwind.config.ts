import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        mist: "#f5f8fb",
        rain: "#1b75bb",
        drizzle: "#70b8d8",
        storm: "#0f4c81",
        slateblue: "#44576d"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 33, 43, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
