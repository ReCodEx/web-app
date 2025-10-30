import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import react from 'eslint-plugin-react';
import _import from 'eslint-plugin-import';
import babel from '@babel/eslint-plugin';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
}, ...fixupConfigRules(
    compat.extends('eslint:recommended', 'standard', 'plugin:react/recommended', 'prettier'),
), {
    ignores: ['node_modules/*', 'public/*'],
    plugins: {
        react: fixupPluginRules(react),
        import: fixupPluginRules(_import),
        babel,
    },

    languageOptions: {
        parser: babelParser,
        parserOptions: {
          requireConfigFile: false,
          babelOptions: {
            babelrc: true,
            configFile: false,
            presets: ["@babel/preset-react", "@babel/preset-env"]
          }
        },
        globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.mocha,
            __DEVELOPMENT__: true,
            __CLIENT__: true,
            __SERVER__: true,
            __DISABLE_SSR__: true,
            __DEVTOOLS__: true,
            socket: true,
            webpackIsomorphicTools: true,
            __dirname: true,
        },
    },

    settings: {
        'import/parsers': {
          '@babel/eslint-parser': [ '.js', '.jsx', '.ts', '.tsx' ]
        },

        'import/ignore': ['node_modules', '.less$'],

        react: {
            version: '19.2.0',
        },
    },

    rules: {
        'import/default': 2,
        'import/no-duplicates': 2,
        'import/named': 2,
        'import/namespace': 2,
        'import/no-deprecated': 2,
        'import/no-unresolved': 2,
        'import/no-named-as-default': 2,
        'react/no-did-update-set-state': 0,
        'react/display-name': 0,
        quotes: [2, 'single'],
        'jsx-quotes': [2, 'prefer-double'],
        'no-console': 1,
        'no-unused-vars': 2,
        'no-alert': 2,
        'no-labels': 2,
        'babel/semi': [2, 'always'],
        'standard/computed-property-even-spacing': 0,
        'space-before-function-paren': 0,
    },
}];
