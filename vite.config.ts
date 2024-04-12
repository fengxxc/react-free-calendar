import { readFileSync, writeFileSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { preserveDirectives } from "rollup-plugin-preserve-directives";
import dts from "vite-plugin-dts";

const packageJson = JSON.parse(
    readFileSync("./package.json", { encoding: "utf-8" }),
);

const globals = {
    ...(packageJson?.dependencies || {}),
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(), 
        dts({
            beforeWriteFile: (filePath, content) => {
                writeFileSync(filePath.replace('.d.ts', '.d.cts'), content) 
                return { filePath, content }
              },
        })
    ],

    build: {
        lib: {
            entry: ["src/index.ts"],
            formats: ["cjs", "es"],
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                ...Object.keys(globals),
            ],
            output: {
                preserveModules: true,
            },
            plugins: [preserveDirectives({})],
        },
    },
});
