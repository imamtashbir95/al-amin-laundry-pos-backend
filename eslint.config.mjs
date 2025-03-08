import globals from "globals";
import pluginJs from "@eslint/js";
import pluginJest from "eslint-plugin-jest";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
        },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
        },
    },
    pluginJs.configs.recommended,
    {
        plugins: {
            jest: pluginJest,
        },
        rules: {
            ...pluginJest.configs.recommended.rules,
        },
    },
];
