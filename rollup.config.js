import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'index.ts',
        output: [
            {
                name: 'mark5',
                file: './lib/umd/index.js',
                format: 'umd',
            },
            {
                name: 'mark5',
                file: './lib/cjs/index.js',
                format: 'cjs',
            },
            {
                name: 'mark5',
                file: './lib/esm/index.js',
                format: 'esm',
            },
            {
                name: 'mark5',
                file: './lib/index.js',
                format: 'umd',
            },
        ],
        strict: false,
        sourcemap: 'inline',
        external: ['parse-html-template'],
        plugins: [
            resolve(),
            typescript({
                downlevelIteration: true,
            }),
        ],
    },
    {
        input: 'index.ts',
        output: {
            file: './lib/index.d.ts',
        },
        plugins: [dts()],
    },
    {
        input: 'index.ts',
        output: [
            {
                name: 'mark5',
                file: './lib/bundles/block.umd.min.js',
                format: 'umd',
            },
        ],
        strict: false,
        sourcemap: 'inline',
        external: ['parse-html-template'],
        plugins: [
            resolve(),
            typescript({
                downlevelIteration: true,
            }),
            terser(),
        ],
    },
];
