import type { Config } from "tailwindcss";

const config: Config = {
    // KINDNESS: Ensure dark mode is 'class' based so you can toggle 
    // between the Zinc-900 and Slate-50 looks easily.
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        // This captures your features folder where most of your BI logic lives
        "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // THEME TOKENS: Standardizing your Gym BI aesthetic
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            // CUSTOM BI ANIMATIONS
            keyframes: {
                "scan-move": {
                    "0%, 100%": { top: "40px" },
                    "50%": { top: "calc(100% - 40px)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "zoom-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            animation: {
                // High-tech laser scan for the QR Fast-Pass
                "scan-move": "scan-move 3s ease-in-out infinite",
                "fade-in": "fade-in 0.3s ease-out",
                "zoom-in": "zoom-in 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;