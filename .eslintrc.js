module.exports = {
  parser: "@babel/eslint-parser",
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
  ],
  plugins: ["jest"],
  env: {
    node: true,
    "jest/globals": true
  },
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      legacyDecorators: true,
      jsx: true
    }
  },
  settings: {
    react: {
      version: "16.13.1"
    }
  },
  rules: {
    "arrow-parens": [2, "as-needed", { requireForBlockBody: true }],
    "space-before-function-paren": 0,
    "react/jsx-filename-extension": 0,
    "react/jsx-props-no-spreading": 0,
    "quote-props": ["error", "as-needed"],
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
  },
  overrides: [
    {
      files: ["*.test.js", "*.test.mjs"],
      rules: {
        "import/no-extraneous-dependencies": "off"
      }
    }
  ]
};
