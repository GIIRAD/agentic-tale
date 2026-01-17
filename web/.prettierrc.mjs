/** @type {import("prettier").Config} */
const config = {
  trailingComma: "es5",
  semi: true,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  jsxSingleQuote: false,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: ["^react$", "<THIRD_PARTY_MODULES>", "^@/", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["importAssertions", "typescript", "jsx"],
  tailwindConfig: "./tailwind.config.js",
  tailwindAttributes: ["theme"],
  tailwindFunctions: ["twMerge", "createTheme"],
  endOfLine: "lf",
};

export default config;
