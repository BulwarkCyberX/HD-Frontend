import type { Config } from 'tailwindcss';

type RGB = { r: number; g: number; b: number };

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace('#', '').trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: RGB) {
  return (
    '#' +
    [r, g, b]
      .map((v) => clampByte(v).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function mix(a: RGB, b: RGB, amount: number): RGB {
  const t = Math.max(0, Math.min(1, amount));
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function makeShades(baseHex: string) {
  const base = hexToRgb(baseHex);
  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };

  // A pragmatic scale: lighter steps mix toward white, darker steps mix toward black.
  return {
    50: rgbToHex(mix(base, white, 0.88)),
    100: rgbToHex(mix(base, white, 0.75)),
    200: rgbToHex(mix(base, white, 0.6)),
    300: rgbToHex(mix(base, white, 0.42)),
    400: rgbToHex(mix(base, white, 0.22)),
    500: baseHex.toUpperCase(),
    600: rgbToHex(mix(base, black, 0.12)),
    700: rgbToHex(mix(base, black, 0.26)),
    800: rgbToHex(mix(base, black, 0.42)),
    900: rgbToHex(mix(base, black, 0.58)),
  };
}

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './local-ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        tropical: {
          sunrise: makeShades('#FCA47C'),
          sand: makeShades('#F9D779'),
          aqua: makeShades('#23CED9'),
          sage: makeShades('#A1CCA6'),
          jade: makeShades('#097C87'),
        },
      },
    },
  },
  plugins: [],
};

export default config;
