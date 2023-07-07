import colors from "tailwindcss/colors";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,html,eta}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      yellow: colors.yellow,
      blue: colors.blue,
      red: colors.red,
      green: colors.green,
      brand: {
        DEFAULT: "#4DB3A9",
        50: "#CEEAE7",
        100: "#BFE4E0",
        200: "#A3D8D2",
        300: "#86CBC5",
        400: "#6ABFB7",
        500: "#4DB3A9",
        600: "#3C8C84",
        700: "#2B655F",
        800: "#1A3D3A",
        900: "#091615",
        950: "#010202",
      },
    },
    extend: {
      fontFamily: {
        code: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [forms],
};
