import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
export default [
    {
        input: 'index.ts',
        output: {
            file: './@block/index.js',
            format: 'es',
            name: 'block',
        },
        strict: false,
        plugins: [
            resolve(),
            typescript({
                downlevelIteration: true,
            }),
        ],
    },
    // {
    //     input: 'index.ts',
    //     output: {
    //         file: 'dist/index.d.ts',
    //         format: 'es',
    //     },
    //     plugins: [dts()],
    // },
];
