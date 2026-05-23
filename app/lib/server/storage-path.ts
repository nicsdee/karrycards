import path from "node:path";

export function serverDataFile(fileName: string) {
  const dataDir = process.env.KARRYCARDS_DATA_DIR
    || (process.env.VERCEL ? path.join("/tmp", "karrycards-data") : path.join(process.cwd(), "data"));

  return path.join(dataDir, fileName);
}
