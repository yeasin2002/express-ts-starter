import { APP_CONFIG } from "@/common/constants";
import {
	OpenAPIRegistry,
	OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import type { OpenAPIObject } from "openapi3-ts/oas30";

export const registry = new OpenAPIRegistry();

// helper function to generate the OpenAPI document
export const generateOpenAPIDocument = (): OpenAPIObject => {
	const generator = new OpenApiGeneratorV3(registry.definitions);
	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			title: APP_CONFIG.title,
			version: APP_CONFIG.version,
			description: APP_CONFIG.description,
		},
		servers: [
			{
				url: process.env.API_BASE_URL || "http://localhost:4000",
				description: "Development server",
			},
		],
	});
};
