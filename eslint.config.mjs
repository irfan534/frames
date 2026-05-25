import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [".next/**", ".tmp-tests/**", "node_modules/**"]
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@next/next/no-page-custom-font": "off"
    }
  }
];

export default config;
