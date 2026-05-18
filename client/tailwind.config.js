/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 主题色将通过 CSS 变量注入，这里只定义语义色
        success: "#5c9a6f",
        warning: "#c9a44b",
        error: "#c1554b",
        info: "#5c8abf",
      },
      fontFamily: {
        ui: ['"Inter"', '"思源黑体"', '"Source Han Sans SC"', "sans-serif"],
        editor: ['"思源宋体"', '"Source Han Serif SC"', '"Georgia"', "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      fontSize: {
        "editor-base": ["16px", "1.8"],
      },
      spacing: {
        4.5: "18px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
