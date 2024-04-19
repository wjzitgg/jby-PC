module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es2021: true
  },

  parserOptions: {
    ecmaVersion: 13,
    requireConfigFile: false,
    sourceType: "module" // 模块为 ECMAScript 模块
  },
  // parser: "vue-eslint-parser",
  parser: "vue-eslint-parser",
  extends: ["standard"], // 使用 standard 标准
  // extends: ["@vue/prettier", "plugin:vue/vue3-essential", "eslint:recommended"],

  //   off 或 0：关闭对该规则的校验；
  // warn 或 1：启用规则，不满足时抛出警告，且不会退出编译进程；
  // error 或 2：启用规则，不满足时抛出错误，且会退出编译进程；

  rules: {
    "no-console": "error",
    "no-debugger": "error", // 禁止在代码中使用 debugger
    quotes: ["error", "double"], // 单引号
    semi: ["error", "always"], // 代码需要以分号结尾
    "space-before-function-paren": 0, // 去掉方法名和括号之间的空格
    "no-empty": 1, // 禁止空块语句
    eqeqeq: 0, // 要求使用 === 和 !== (eqeqeq)
    "no-async-promise-executor": 0
  }
};
