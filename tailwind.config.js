const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./frontend/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          text: "hsl(var(--secondary-text))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Citadel Brand Colors - Enhanced Futuristic Palette
        citadel: {
          orange: "hsl(var(--citadel-orange))",
          'orange-bright': "hsl(var(--citadel-orange-bright))",
          'orange-light': "hsl(var(--citadel-orange-light))",
          'orange-dark': "hsl(var(--citadel-orange-dark))",
          'orange-glow': "hsl(var(--citadel-orange-glow))",
          black: "hsl(var(--citadel-black))",
          'black-light': "hsl(var(--citadel-black-light))",
          'dark-gray': "hsl(var(--citadel-dark-gray))",
          'medium-gray': "hsl(var(--citadel-medium-gray))",
          'light-gray': "hsl(var(--citadel-light-gray))",
          'steel': "hsl(var(--citadel-steel))",
          'steel-light': "hsl(var(--citadel-steel-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(255, 138, 0, 0.3), 0 0 40px rgba(255, 138, 0, 0.1)"
          },
          "50%": {
            boxShadow: "0 0 30px rgba(255, 138, 0, 0.5), 0 0 60px rgba(255, 138, 0, 0.2)"
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(255, 138, 0, 0.3)',
        'glow': '0 0 20px rgba(255, 138, 0, 0.4)',
        'glow-lg': '0 0 30px rgba(255, 138, 0, 0.5)',
        'glow-xl': '0 0 40px rgba(255, 138, 0, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(255, 138, 0, 0.2)',
        'citadel': '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 138, 0, 0.1)',
        'citadel-lg': '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 138, 0, 0.2)',
      },
      fontSize: {
        12: "0.75rem",
        14: "0.875rem",
        16: "1rem",
        18: "1.125rem",
        20: "1.25rem",
        24: "1.5rem",
        26: "1.625rem",
        30: "1.875rem",
        39: "2.4375rem",
        48: "3rem",
        51: "3.1875rem",
        68: "4.25rem",
        110: "6.875rem",
      },
      lineHeight: {
        16: "1rem",
        18: "1.125rem",
        20: "1.25rem",
        22: "1.375rem",
        24: "1.5rem",
        26: "1.625rem",
        28: "1.75rem",
        32: "2rem",
        34: "2.125rem",
        42: "2.625rem",
        52: "3.25rem",
        62: "3.875rem",
        72: "4.5rem",
        116: "7.25rem",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),

    plugin(function addTextStyles({ addComponents, theme }) {
      addComponents({
        // Component Regular Text Styles
        ".body-sm": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.16"),
          lineHeight: theme("lineHeight.28"),
          fontWeight: theme("fontWeight.regular"),
        },
        ".body-md": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.18"),
          lineHeight: theme("lineHeight.28"),
          fontWeight: theme("fontWeight.regular"),
        },

        // Component Semibold Text Styles
        ".body-sm-semibold": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.16"),
          lineHeight: theme("lineHeight.28"),
          fontWeight: theme("fontWeight.semibold"),
        },
        ".body-md-semibold": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.18"),
          lineHeight: theme("lineHeight.28"),
          fontWeight: theme("fontWeight.semibold"),
        },

        // Label Text Styles
        ".label-sm": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.14"),
          lineHeight: theme("lineHeight.24"),
          color: theme("colors.secondary.text"),
        },

        // Title Text Styles
        ".title-md": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.48"),
          lineHeight: theme("lineHeight.48"),
          fontWeight: theme("fontWeight.bold"),
          letterSpacing: "-1.2%",
        },

        // Heading Text Styles
        ".heading-sm": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.24"),
          lineHeight: theme("lineHeight.32"),
          fontWeight: theme("fontWeight.semibold"),
          letterSpacing: "-0.6%",
        },
        ".heading-md": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: theme("fontSize.30"),
          lineHeight: theme("lineHeight.36"),
          fontWeight: theme("fontWeight.semibold"),
        },

        // Display Text Styles
        ".display": {
          fontFamily: theme("fontFamily.inter"),
          fontSize: "32px",
          lineHeight: "52px",
          fontWeight: theme("fontWeight.bold"),
        },
      });
    }),
  ],
};
