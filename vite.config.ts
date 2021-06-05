import {defineConfig} from 'vite'
import {resolve} from 'path'

export default defineConfig(({mode}) => {
    const server = mode == 'server'
    return {
        resolve: {
            alias: [
                {find: '@', replacement: resolve(__dirname, 'src')},
            ],
        },
        build: {
            // outDir: server ? 'dist/server' : 'dist/client',
            lib: server ? {
                entry: 'src/server.ts',
                name: 'server',
                fileName: 'server',
                formats: ['es'],
            } : undefined,
            sourcemap: server,
            rollupOptions: {
                external: server ? /node_modules\/.*/ : undefined,
            },
        },
        server: {
            port: 8082,
        },
    }
})
