
import { registry } from "@/lib/openapi";

// registry.register("example", exampleSchema);
registry.registerPath({
  method: "post",
  path: "/api/example", // use openAPITags basepath - Example: openAPITags.category.basepath
  description: "",
  summary: "",
  tags: ["example"], // use openAPITags name - Example: openAPITags.category.name
  responses: {
    200: {
      description: "example retrieved successfully",
      // content: {"application/json": {schema: exampleResponseSchema,},},
    },
  },
});




// TODO: Add your openAPI specification here
//  Full Example 
// registry.registerPath({
//   method: "get",
//   path: "/api/example", // use openAPITags basepath - Example: openAPITags.category.basepath
//   description: "",
//   summary: "",
//   tags: ["example"], // use openAPITags name - Example: openAPITags.category.name
//   responses: {
//     200: {
//       description: "example retrieved successfully",
//       content: {
//         "application/json": {
//           schema: exampleResponseSchema,
//         },
//       },
//     },
//     500: {
//       description: "Internal server error",
//       content: {
//         "application/json": {
//           schema: ErrorResponseSchema,
//         },
//       },
//     },
//   },
// });


