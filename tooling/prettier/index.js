import tsPackageJson from 'typescript/package.json' with { type: 'json' }

/** @type {import("prettier").Config} */
export default {
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  trailingComma: 'all',
  singleQuote: true,
  semi: false,
  printWidth: 120,
  endOfLine: 'auto',
  // sort-imports
  importOrder: [
    '<BUILTIN_MODULES>',
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)',
    '',
    '^~/(.*)',
    '',
    '^[../]',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: tsPackageJson.version,
}
