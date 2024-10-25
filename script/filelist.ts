export const fileList = (folderName: string) => {
  return [
    {
      name: `${folderName}.route.ts`,
      content: `
    import express from "express";
    export const router = express.Router();

     router.post("/create", () => {});
    

     export { router as ${folderName}Router};
     `,
    },
    {
      name: `${folderName}.controller.ts`,
      content: "",
    },
    {
      name: `${folderName}.validation.ts`,
      content: "// zod,joi, valibot, express validator etc. validation  ",
    },
  ];
};
