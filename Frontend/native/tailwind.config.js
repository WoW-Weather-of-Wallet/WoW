/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6666ee",
          light: "#8888f4",
          dark: "#4d4dcc",
          50: "#f0f0fd",
          100: "#e0e0fb",
          200: "#c2c2f7",
          300: "#a3a3f3",
          400: "#8585ef",
          500: "#6666ee",
          600: "#4d4dcc",
          700: "#3939aa",
          800: "#2b2b88",
          900: "#1d1d66",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F7F7FC",
          tertiary: "#EFEFFA",
        },
        text: {
          DEFAULT: "#1A1A2E",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
          inverse: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          focus: "#6666ee",
        },
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
