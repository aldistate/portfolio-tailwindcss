/** @type {import('tailwindcss').Config} */
module.exports = {
  // PENTING: js/**/*.js ikut dipindai karena class Tailwind untuk
  // project card ditulis di js/main.js.
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1152px",
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Warna utama portofolio (teal).
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 8px 24px -16px rgb(15 23 42 / 0.12)",
        lift: "0 18px 40px -20px rgb(15 23 42 / 0.25)",
        soft: "0 20px 50px -30px rgb(15 23 42 / 0.35)",
      },
    },
  },
  plugins: [],
};
