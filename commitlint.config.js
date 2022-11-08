const config = require('@commitlint/config-angular')
module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [2, 'always', [...config.rules['type-enum'][2], 'chore']],
  },
}
