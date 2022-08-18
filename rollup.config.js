import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
export default [
    {
        input: 'index.ts',
        output: {
            file: './@block/index.js',
            format: 'es',
        },
        strict: false,
        plugins: [
            resolve(),
            typescript({
                downlevelIteration: true,
            }),
        ],
    },
    {
        input: 'form/index.ts',
        output: {
            file: './@block/form/index.js',
            format: 'es',
        },
        strict: false,
        plugins: [
            resolve(),
            typescript({
                downlevelIteration: true,
            }),
        ],
    },
    {
        input: 'platform/index.ts',
        output: {
            file: './@block/platform/index.js',
            format: 'es',
        },
        strict: false,
        plugins: [
            resolve(),
            typescript({
                downlevelIteration: true,
            }),
        ],
    },
    {
        input: 'compiler/index.ts',
        output: {
            file: './@block/platform/index.js',
            format: 'es',
        },
        strict: false,
        plugins: [
            resolve(),
            typescript({
                downlevelIteration: true,
            }),
        ],
    },
];
