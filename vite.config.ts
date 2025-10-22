import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import {resolve} from 'path'
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({mode, command}) => ({
        base: mode !== 'development' ? '/' : '/dm_front/',
        plugins: [
            // Allows using React dev server along with building a React application with Vite.
            // https://npmjs.com/package/@vitejs/plugin-react-swc
            react(),
            // Allows using the compilerOptions.paths property in tsconfig.json.
            // https://www.npmjs.com/package/vite-tsconfig-paths
            tsconfigPaths(),
            // Creates a custom SSL certificate valid for the local machine.
            // Using this plugin requires admin rights on the first dev-mode launch.
            // https://www.npmjs.com/package/vite-plugin-mkcert
            process.env.HTTPS && mkcert(),
        ],
        publicDir: './public',
        server: {
            // Exposes your dev server and makes it accessible for the devices in the same network.
            port: 443,
            host: "0.0.0.0",
            hmr: {
                host: 'dt-mini-app.local',
                port: 443,
            },
            proxy: {
                '/api/': {
                    target: 'https://devsoko.ru',
                    changeOrigin: true,
                }
            },
            https: command == 'build' ? null : {
                key: fs.readFileSync('./.cert/localhost-key.pem'),
                cert: fs.readFileSync('./.cert/localhost.pem'),
            },
        },
        build: {
            target: 'ES2022',
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "index.html"),
                    404: resolve(__dirname, "public/404.html"),
                },
            },
        },
    })
);
