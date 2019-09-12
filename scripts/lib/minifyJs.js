const terser = require('terser')

function minifyJs(code) {
  console.time('minifyJs')
  const ret = terser.minify(code, getOptions())
  if (ret.error) {
    throw new Error(ret.error)
  }

  console.timeEnd('minifyJs')

  return ret.code
}

function getOptions() {
  // Documentation of the options is available at https://github.com/mishoo/UglifyJS2
  return {
    ecma: 8,
    keep_classnames: false,
    keep_fnames: false,
    ie8: false,
    module: false,
    safari10: false,
    toplevel: true,
    parse: {
      bare_returns: false,
      ecma: 8,
      expression: false,
      filename: null,
      html5_comments: true,
      shebang: true,
      strict: false,
      toplevel: true
    },
    compress: {
      arrows: true,
      arguments: true,
      booleans: true,
      booleans_as_integers: true,
      collapse_vars: true,
      comparisons: true,
      computed_props: true,
      conditionals: true,
      directives: true,
      dead_code: true,
      drop_console: true,
      drop_debugger: true,
      ecma: 8,
      evaluate: true,
      expression: false,
      global_defs: {},
      hoist_funs: true,
      hoist_props: true,
      hoist_vars: true,
      ie8: false,
      if_return: true,
      inline: true,
      join_vars: true,
      keep_classnames: false,
      keep_fargs: false,
      keep_fnames: false,
      keep_infinity: false,
      loops: true,
      negate_iife: true,
      passes: 4,
      properties: true,
      pure_getters: true,
      pure_funcs: null,
      reduce_funcs: true,
      reduce_vars: true,
      sequences: true,
      side_effects: true,
      switches: true,
      top_retain: null,
      toplevel: true,
      typeofs: true,
      unsafe: true,
      unsafe_arrows: true,
      unsafe_comps: true,
      unsafe_Function: true,
      unsafe_math: true,
      unsafe_methods: true,
      unsafe_proto: true,
      unsafe_regexp: true,
      unsafe_undefined: true,
      unused: true,
      warnings: false
    },
    mangle: {
      eval: true,
      ie8: false,
      keep_classnames: false,
      keep_fnames: false,
      properties: false,
      reserved: [],
      safari10: false,
      toplevel: true
    },
    output: {
      ascii_only: true,
      beautify: false,
      comments: /@license|@preserve|^!/,
      ecma: 8,
      ie8: false,
      indent_level: 2,
      indent_start: 0,
      inline_script: true,
      keep_quoted_props: false,
      max_line_len: false,
      preamble: null,
      quote_keys: false,
      quote_style: 0,
      safari10: false,
      semicolons: true,
      shebang: true,
      source_map: null,
      webkit: false,
      width: 80,
      wrap_iife: false
    },
    wrap: false
  }
}

module.exports = minifyJs
