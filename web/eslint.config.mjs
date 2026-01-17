import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import tailwind from "eslint-plugin-tailwindcss";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  // ignores in first place
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".env*",
    ],
  },
  // compat config with extends
  ...compat.config({
    extends: ["plugin:@next/next/recommended", "next/core-web-vitals"],
    settings: {
      next: {
        rootDir: ".",
      },
    },
  }),
  // react config
  react.configs.flat.recommended,
  // tailwind config
  ...tailwind.configs["flat/recommended"],
  // typescript-eslint config
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  // prettier config
  eslintPluginPrettierRecommended,
  // custom config with rules
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // allow linting of .mjs and .js files without including them to the tsconfig
          allowDefaultProject: [".*.mjs", "*.mjs", "*.js"],
        },
      },
    },
    settings: {
      tailwindcss: {
        callees: ["twMerge", "createTheme"],
        classRegex: "^(class(Name)|theme)?$",
      },
    },
    rules: {
      "@typescript-eslint/restrict-template-expressions": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/self-closing-comp": [
        "error",
        {
          component: true,
        },
      ],
    },
  },
];

export default eslintConfig;
