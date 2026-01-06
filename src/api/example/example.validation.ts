import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// TODO: Define your validation schemas here
// Example:
// export const ExampleValidation = z.object({
//   name: z.string().min(1).openapi({ description: "Name" }),
// }).openapi("Example");
//
// export type Example = z.infer<typeof ExampleValidation>;
