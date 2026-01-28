/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./training_path_map_view.html",
    "./weekly_challenges_hub.html",
    "./workout_player_screen.html",
    "./caliquest_xp_rewards_store.html",
    "./user_profile_setup_step_1.html",
    "./fitness_level_selection_step_2.html",
    "./admin_dashboard_overview.html",
    "./boss_level_success_screen.html",
    "./database-admin.html",
    "./src/**/*.{html,js}",
    "./*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00eeff',
        'background-light': '#f5f8f8',
        'background-dark': '#0f2223',
      },
      fontFamily: {
        display: ['Lexend', 'Noto Sans Arabic', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif']
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
