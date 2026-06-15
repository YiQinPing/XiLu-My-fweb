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
        "breathe": "breathe 3s ease-in-out infinite",
        "slide-down": "slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up-fade": "slideUpFade 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
        breathe: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(200,150,108,0.3), 0 0 16px rgba(200,150,108,0.1)" },
          "50%": { boxShadow: "0 0 16px rgba(200,150,108,0.5), 0 0 36px rgba(200,150,108,0.22)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUpFade: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
