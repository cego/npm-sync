"use strict";
const eslintConfigESLintBase = require("eslint-config-eslint/base");
const eslintConfigESLintCJS = require("eslint-config-eslint/cjs");
const eslintConfigESLintFormatting = require("eslint-config-eslint/formatting");

module.exports = [
    ...eslintConfigESLintBase,
    ...eslintConfigESLintCJS,
    eslintConfigESLintFormatting,
    {
        rules: {
            "comma-dangle": ["error", "always-multiline"],
            "no-console": ["off"],
            "n/no-process-exit": ["off"],
            "n/no-unpublished-require": ["error", {
                allowModules: ["eslint-config-eslint"],
            }],
        },
    },
];
