// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "I Digress";
export const SITE_DESCRIPTION =
  "musings and observations, mostly about CSS";
export const X_HANDLE = "@cbolson";
export const bsky_HANDLE = "@cbolson";
export const MY_NAME = "Chris Bolson";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;
