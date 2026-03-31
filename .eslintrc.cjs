module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["**/dist/**", "**/.next/**", "**/node_modules/**"],
  overrides: [
    {
      files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
      extends: [
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended"
      ],
      rules: {
        "react/jsx-uses-react": "off",
        "react/no-unescaped-entities": "off",
        "react/react-in-jsx-scope": "off"
      },
      settings: {
        react: {
          version: "detect"
        }
      }
    },
    {
      files: ["apps/server/**/*.ts", "packages/**/*.{ts,tsx}"],
      env: {
        node: true
      }
    }
  ]
};
