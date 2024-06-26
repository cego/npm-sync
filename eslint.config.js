"use strict";
const config = require("eslint-config-eslint/cjs");
const formatting = require("eslint-config-eslint/formatting");
const jest = require("eslint-plugin-jest");
const globals = require("globals");

module.exports = [
    ...config,
    formatting,
    {
        plugins: { jest },
        rules: {
            ...jest.configs.recommended.rules,
        },
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
    {
        ignores: ["coverage/"],
    },
    {
        rules: {
            "jsdoc/require-param-description": ["off"],
            "jsdoc/require-returns-description": ["off"],
            "comma-dangle": ["error", "always-multiline"],
            "no-console": ["off"],
            "n/no-process-exit": ["off"],
            "n/no-unpublished-require": ["error", {
                allowModules: ["eslint-config-eslint", "globals", "eslint-plugin-jest"],
            }],
        },
    },
];
