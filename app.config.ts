import { defineConfig } from "@solidjs/start/config";
import path from "path";

export default defineConfig({
    server: {
        preset: "node-server",
        // HTTPS disabled - using standard HTTP localhost
        // https: {
        //     key: path.resolve(".certs/localhost-key.pem"),
        //     cert: path.resolve(".certs/localhost.pem"),
        // },
    },
});
