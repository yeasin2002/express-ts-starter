#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => readline.question(query, resolve));

// Parse command line arguments
const args = process.argv.slice(2);
const subModuleFlag = args.includes("--sub");
const parentModuleName = subModuleFlag ? args[args.indexOf("--sub") + 1] : null;
const moduleFlag = args.includes("--module");
const providedModuleName = moduleFlag
  ? args[args.indexOf("--module") + 1]
  : null;

// Helper to check if directory exists
const directoryExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

// Helper to capitalize first letter
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Helper to convert to PascalCase
const toPascalCase = (str) =>
  str
    .split(/[-_\s]/)
    .map(capitalize)
    .join("");

// Helper to convert to camelCase for variable names
const toCamelCase = (str) => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

// Generate controller template
const generateRoute = (moduleName) => {
  const camelName = toCamelCase(moduleName);
  return `
  import "./${moduleName}.openapi";

  import express, { type Router } from "express";

export const ${camelName}: Router = express.Router();

// TODO: Add your routes here
// Example:
// ${camelName}.get("/", handler);
// ${camelName}.post("/", validateBody(schema), handler);
`;
};

// Generate service index template
const generateServiceIndex = () => {
  return `// Export all service handlers
// Example:
// export * from "./login";
// export * from "./register";
`;
};

// Generate example service template
const generateExampleService = (moduleName) => {
  return `import type { RequestHandler } from "express";
import { sendInternalError, sendSuccess } from "@/helpers";

// TODO: Implement your service handler
// Example: Get all ${moduleName}
export const getAll${toPascalCase(
    moduleName
  )}: RequestHandler = async (req, res) => {
  try {
    // Add your business logic here
    return sendSuccess(res, 200, "Success", null);
  } catch (error) {
    console.log(error);
    return sendInternalError(res, "Internal Server Error");
  }
};
`;
};

// Generate schema template
const generateValidation = (_moduleName) => {
  return `import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
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
`;
};

const generateOpenAPI = (moduleName, routePath = `/api/${moduleName}`) => {
  return `
import { registry } from "@/lib/openapi";
import { mediaTypeFormat, openAPITags } from "@/common/constants";

// registry.register("${moduleName}", ${moduleName}Schema);
registry.registerPath({
  method: "post",
  path: "${routePath}", // use openAPITags basepath - Example: openAPITags.category.basepath
  description: "",
  summary: "",
  tags: ["${moduleName}"], // use openAPITags name - Example: openAPITags.category.name
  responses: {
    200: {
      description: "${moduleName} retrieved successfully",
      // content: {"application/json": {schema: ${moduleName}ResponseSchema,},},
    },
  },
});




// TODO: Add your openAPI specification here
//  Full Example 
// registry.registerPath({
//   method: "get",
//   path: "${routePath}", // use openAPITags basepath - Example: openAPITags.category.basepath
//   description: "",
//   summary: "",
//   tags: ["${moduleName}"], // use openAPITags name - Example: openAPITags.category.name
//   responses: {
//     200: {
//       description: "${moduleName} retrieved successfully",
//       content: {
//         "application/json": {
//           schema: ${moduleName}ResponseSchema,
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


`;
};

async function main() {
  try {
    console.log("🚀 Module Generator for JobSphere API\n");

    // Validate flags
    if (subModuleFlag && !parentModuleName) {
      console.error("❌ --sub flag requires a parent module name!");
      console.log("Usage: bun run generate:module --sub <parent-module>");
      process.exit(1);
    }

    if (moduleFlag && !providedModuleName) {
      console.error("❌ --module flag requires a module name!");
      console.log("Usage: bun run generate:module --module <module-name>");
      console.log("Example: bun run generate:module --module auth");
      console.log("Example: bun run generate:module --sub auth --module user");
      process.exit(1);
    }

    if (subModuleFlag) {
      console.log(`📂 Creating sub-module under: ${parentModuleName}\n`);
    }

    // Get module name from flag or prompt
    let moduleName;
    if (moduleFlag) {
      moduleName = providedModuleName;
      console.log(`📝 Module name: ${moduleName}\n`);
    } else {
      moduleName = await question(
        subModuleFlag
          ? `Enter sub-module name (will be created under ${parentModuleName}): `
          : "Enter module name (e.g., user, job, booking): "
      );
    }

    if (!moduleName || moduleName.trim() === "") {
      console.error("❌ Module name cannot be empty!");
      process.exit(1);
    }

    const cleanModuleName = moduleName.trim().toLowerCase();
    const pascalName = toPascalCase(cleanModuleName);

    // Determine module path
    let modulePath;
    let routePath;

    if (subModuleFlag) {
      const cleanParentName = parentModuleName.trim().toLowerCase();
      const parentPath = join(process.cwd(), "src", "api", cleanParentName);

      // Check if parent module exists
      const parentExists = await directoryExists(parentPath);

      if (!parentExists) {
        console.log(
          `⚠️  Parent module "${cleanParentName}" doesn't exist. Creating it first...\n`
        );
        await mkdir(parentPath, { recursive: true });
        console.log(`✅ Created parent directory: src/api/${cleanParentName}`);
      }

      modulePath = join(parentPath, cleanModuleName);
      routePath = `/api/${cleanParentName}/${cleanModuleName}`;

      console.log(
        `\n📦 Creating sub-module: ${cleanParentName}/${cleanModuleName}`
      );
      console.log(`📝 PascalCase name: ${pascalName}\n`);
    } else {
      modulePath = join(process.cwd(), "src", "api", cleanModuleName);
      routePath = `/api/${cleanModuleName}`;

      console.log(`\n📦 Creating module: ${cleanModuleName}`);
      console.log(`📝 PascalCase name: ${pascalName}\n`);
    }

    // Create module directory
    await mkdir(modulePath, { recursive: true });
    console.log(
      `✅ Created directory: ${modulePath
        .replace(process.cwd(), "")
        .substring(1)}`
    );

    // Create services directory
    const servicesPath = join(modulePath, "services");
    await mkdir(servicesPath, { recursive: true });
    console.log(
      `✅ Created directory: ${servicesPath
        .replace(process.cwd(), "")
        .substring(1)}`
    );

    // Generate files
    const files = [
      {
        name: `${cleanModuleName}.route.ts`,
        content: generateRoute(cleanModuleName),
      },
      {
        name: `${cleanModuleName}.validation.ts`,
        content: generateValidation(cleanModuleName),
      },
      {
        name: `${cleanModuleName}.openapi.ts`,
        content: generateOpenAPI(cleanModuleName, routePath),
      },
    ];

    // Generate service files
    const serviceFiles = [
      {
        name: "index.ts",
        content: generateServiceIndex(),
      },
      {
        name: "example.service.ts",
        content: generateExampleService(cleanModuleName),
      },
    ];

    // Create main module files
    for (const file of files) {
      const filePath = join(modulePath, file.name);
      await writeFile(filePath, file.content, "utf-8");
      const relativePath = filePath.replace(process.cwd(), "").substring(1);
      console.log(`✅ Created file: ${relativePath}`);
    }

    // Create service files
    for (const file of serviceFiles) {
      const filePath = join(servicesPath, file.name);
      await writeFile(filePath, file.content, "utf-8");
      const relativePath = filePath.replace(process.cwd(), "").substring(1);
      console.log(`✅ Created file: ${relativePath}`);
    }

    const displayPath = subModuleFlag
      ? `${parentModuleName}/${cleanModuleName}`
      : cleanModuleName;

    console.log(`\n🎉 Module "${displayPath}" created successfully!`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Define schemas in ${cleanModuleName}.validation.ts`);
    console.log(
      `   2. Add service handlers in services/ folder (e.g., login.service.ts, register.service.ts)`
    );
    console.log(`   3. Export services in services/index.ts`);
    console.log(`   4. Define routes in ${cleanModuleName}.route.ts`);

    if (subModuleFlag) {
      console.log(
        `   5. Register route in parent or src/app.ts: app.use("${routePath}", ${toCamelCase(
          cleanModuleName
        )})\n`
      );
    } else {
      console.log(
        `   5. Register route in src/app.ts: app.use("${routePath}", ${toCamelCase(
          cleanModuleName
        )})\n`
      );
    }
  } catch (error) {
    console.error("❌ Error creating module:", error.message);
    process.exit(1);
  } finally {
    readline.close();
  }
}

main();
