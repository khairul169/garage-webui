// https://daisyui.com/docs/themes/

export const themes = [
  "pastel",
  "dark",
  "dracula",
  "cupcake",
  "dim",
  "night",
  "nord",
  "corporate",
  "valentine",
  "winter",
] as const;

export type Themes = (typeof themes)[number];
