import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['JetBrains Mono', 'monospace'],
                body: ['Outfit', 'sans-serif'],
            },
            colors: {
                'bg-primary': '#050810',
                'bg-secondary': '#0a0e17',
                'bg-tertiary': '#0d1220',
                accent: '#00e5ff',
                'threat-critical': '#ff2d55',
                'threat-high': '#ff9500',
                'threat-medium': '#ffcc00',
                'threat-low': '#30d158',
            },
            animation: {
                ticker: 'ticker 80s linear infinite',
                pulse: 'pulse 2s ease-in-out infinite',
                'fade-in': 'fadeIn 0.3s ease-out forwards',
            },
            keyframes: {
                ticker: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.4' },
                },
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
