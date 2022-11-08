/* eslint-env node */
module.exports = {
  root: true,
  extends: ['@linusborg/eslint-config', 'plugin:vue/vue3-essential'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['*.js', '.cjs'],
      env: {
        node: true,
      },
    },
  ],
}
