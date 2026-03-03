/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0F172A", // Deep Navy
                secondary: "#64748B", // Slate 500
                accent: "#F59E0B", // Amber 500
                background: "#F8FAFC", // Slate 50
                glass: "rgba(255, 255, 255, 0.7)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
