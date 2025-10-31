import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "src/**/*.ts",
	dts: {
		sourcemap: true,
	},
	minify: true,
	logLevel: "warn",
	alias: {
		"@": "./src",
	},
});
