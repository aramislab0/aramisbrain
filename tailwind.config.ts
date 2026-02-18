import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Silent Command Design System
                // Background layers
                'bg-primary': '#0F0F0F',      // Graphite noir profond
                'bg-secondary': '#1A1A1A',    // Graphite foncé

                // Aramis Gold (accent principal)
                'gold-primary': '#D4AF37',
                'gold-hover': '#E5C158',

                // Text hierarchy
                'text-primary': '#FFFFFF',
                'text-secondary': '#9CA3AF',
                'text-muted': '#6B7280',

                // Status colors
                'success': '#10B981',
                'warning': '#F59E0B',
                'error': '#EF4444',
                'risk-critical': '#F87171',

                // Borders
                'border': '#27272A',
                'border-focus': '#D4AF37',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['monospace'],
            },
        },
    },
    plugins: [],
};

export default config;
