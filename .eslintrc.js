module.exports = {
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  env: {
    browser: true,
    commonjs: true
  },
  rules: {
    'dot-notation': 2,
    'eqeqeq': [2, 'smart'],
    'curly': [2, 'multi-or-nest', 'consistent'],
    'brace-style': [2, '1tbs', { 'allowSingleLine': true }],
    'eol-last': 2,
    'consistent-this': [2, 'self'],
    'no-var': 2,
    'prefer-arrow-callback': 2,
    'prefer-template': 2,
    'arrow-parens': [2, 'as-needed']
  }
}
