// Flat config. The point of this file is narrow: keep the invariants the
// accessibility work established from regressing silently.
//
// Those invariants are not in any type. A decorative chart drawing must stay
// `inert`, every landmark must keep its label, headings must not skip a level,
// and a figure must carry its numbers somewhere a screen reader can reach. A
// typecheck sees none of that. `jsx-a11y` catches a good part of it at the
// keystroke instead of six minutes into CI, where the axe sweep runs today.
//
// So the a11y rules are errors and much of the stylistic surface is off. This
// is a guard, not a style council -- formatting is Prettier's job, and
// `eslint-config-prettier` turns off everything that would argue with it.

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    // Build output, dependencies, and the generated font payload. The last one
    // is a single 2 MB line of base64 and linting it helps nobody.
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "client/src/lib/book-fonts-data.ts",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ---------------------------------------------------------------- browser
  {
    files: ["client/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,

      // The reason this config exists. A regression in any of these ships a
      // page some reader cannot use, and none of them fail a typecheck.
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",

      "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",

      // `role="application"` is what made 68 figures unreadable: it tells a
      // screen reader to stop interpreting the subtree and forward keystrokes
      // instead. No jsx-a11y rule catches it on a `div` -- the element is
      // generic, so none of them consider the role a downgrade -- so it is
      // spelled out here. Recharts sets it internally and we neutralise the
      // drawing with `inert`; nothing in this codebase should add one by hand.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='role'][value.value='application']",
          message:
            'role="application" stops a screen reader interpreting the subtree. Mark the drawing `inert` and give the figure a data table or a description instead.',
        },
      ],

      // Deliberate voids are written `_name`. Anything else unused is a bug or
      // a leftover, and both are worth seeing.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // ------------------------------------------------------------------- node
  {
    files: ["server/**/*.ts", "shared/**/*.ts", "script/**/*.ts", "*.{js,ts}"],
    languageOptions: { globals: globals.node },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ------------------------------------------------------------------ tests
  {
    files: ["tests/**/*.ts", "playwright.config.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      // Test code runs `page.evaluate` callbacks in the browser, where the
      // types are whatever the page has. Insisting on precision there costs
      // more than it catches.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Last, so it wins: turn off every rule that would fight the formatter.
  prettier,
);
