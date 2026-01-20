/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Rubik', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      colors: {
        'soft-cream': '#FDFBD4',
        'soft-lilac': '#E6DFF0',
        'sage-border': '#C0D0B0',
        'sage-fill': '#F6F8F2',
        'olive-btn': '#A0B098',
        'streak-bg': '#E2C78E',
        'streak-pill': '#DBC695',
        'input-bg': '#F5F7EF',
        'nav-active': '#DAA520',
      },
      boxShadow: {
        'soft': '0 4px 15px -3px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.02)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '16px',
      }
    }
  },
  plugins: [],
}
