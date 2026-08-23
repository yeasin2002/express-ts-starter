export const APP_CONFIG = {
	name: "node-express-starter",
	displayName: "Node Express Starter",
	title: "Node Express Starter API",
	description:
		"Production-ready REST API starter template built with Node.js, Express 5, and TypeScript",
	version: "1.0.0",
} as const;

export const openAPITags = {
	example: {
		name: "Example",
		basepath: "/api/example",
	},
};

export const mediaTypeFormat = {
	json: "application/json",
	form: "multipart/form-data",
};
