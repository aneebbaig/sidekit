import next from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...next,
  {
    ignores: ["src/generated/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
