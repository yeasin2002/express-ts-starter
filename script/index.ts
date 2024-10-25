import fs from "fs/promises";
import readline from "readline/promises";
import { fileList } from "./filelist";

async function createFolderAndFiles(folderName: string) {
  const folderPath = `${process.cwd()}/src/api/${folderName}`;

  try {
    await fs.access(folderPath);
    console.error(`Error: Folder "${folderName}" already exists.`);
    return;
  } catch (err) {
    await fs.mkdir(folderPath, { recursive: true });
  }

  const files = fileList(folderName);

  await Promise.all(
    files.map(async (file) => {
      const filePath = `${folderPath}/${file.name}`;
      try {
        await fs.writeFile(filePath, file.content);
      } catch (err) {
        console.error(`Error creating file ${file}: ${err.message}`);
      }
    }),
  );

  console.log("Congratulations! Folder and files created successfully.");
}

(async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const folderName = await rl.question("Enter folder name: ");
  await createFolderAndFiles(folderName);

  rl.close();
})();
