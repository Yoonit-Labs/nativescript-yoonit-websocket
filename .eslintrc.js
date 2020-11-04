// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  extends: 'standard',
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: "module"
  },
  env: {
    browser: false,
    node: true
  },
  globals: {
    'android': true,
    'java': true,
    'org': true,
    'javax': true,
    'byte': true,
    'TNS_ENV': true,
    'NSObject': true,
    'PSWebSocketDelegate': true,
    'NSMutableURLRequest': true,
    'NSURL': true,
    'PSWebSocket': true
  },
  rules: {
    'standard/computed-property-even-spacing': [4, 'off'],
    'no-useless-constructor': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'indent': ['error', 2],
    'one-var': [
      'error',
      {
        'var': 'never',
        'let': 'never',
        'const': 'never'
      }
    ],
    'semi': [2, 'never'],
    'arrow-parens': 0,
    'generator-star-spacing': 'off',
    'no-debugger': (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog')  ? 'error' : 'off',
    'no-new': 0,
    'no-fallthrough': 'off'
  }
}
