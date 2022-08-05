import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
export default {
    input: 'index.ts',
    output: {
        file: './dist/main.js',
        format: 'es',
        name: 'block',
    },
    strict: false,
    plugins: [
        resolve(),
        typescript({
            downlevelIteration: true,
            experimentalDecorators: true,
        }),
    ],
};
