const UglifyJS = require('uglify-es')

function minifyJs(code) {
  console.time('minifyJs')
  const ret = UglifyJS.minify(code, getOptions())
  if (ret.error) {
    throw new Error(ret.error)
  }

  console.timeEnd('minifyJs')

  return ret.code
}

function getOptions() {
  // Documentation of the options is available at https://github.com/mishoo/UglifyJS2
  return {
    parse: {
      bare_returns: false,
      ecma: 9,
      expression: false,
      filename: null,
      html5_comments: true,
      shebang: true,
      strict: false,
      toplevel: null
    },
    compress: {
      arrows: true,
      booleans: true,
      collapse_vars: true,
      comparisons: true,
      computed_props: true,
      conditionals: true,
      dead_code: true,
      drop_console: true,
      drop_debugger: true,
      ecma: 8,
      evaluate: true,
      expression: true,
      global_defs: {},
      hoist_funs: true,
      hoist_props: true,
      hoist_vars: true,
      ie8: false,
      if_return: true,
      inline: true,
      join_vars: true,
      keep_classnames: false,
      keep_fargs: true,
      keep_fnames: false,
      keep_infinity: false,
      loops: true,
      negate_iife: true,
      passes: 4,
      properties: true,
      pure_getters: 'strict',
      pure_funcs: null,
      reduce_funcs: true,
      reduce_vars: true,
      sequences: true,
      side_effects: true,
      switches: false,
      top_retain: null,
      toplevel: false,
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
      toplevel: false
    },
    output: {
      ascii_only: false,
      beautify: false,
      bracketize: false,
      comments: /@license|@preserve|^!/,
      ecma: 9,
      ie8: false,
      indent_level: 2,
      indent_start: 0,
      inline_script: true,
      keep_quoted_props: false,
      max_line_len: false,
      preamble: null,
      preserve_line: false,
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
