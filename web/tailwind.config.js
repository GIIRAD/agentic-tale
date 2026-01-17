/* eslint-disable @typescript-eslint/no-require-imports */
const flowbiteReact = require("flowbite-react/plugin/tailwindcss");
const flowbiteTypography = require("flowbite-typography");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts}", "./.flowbite-react/class-list.json"],
  plugins: [flowbiteReact, flowbiteTypography],
};
