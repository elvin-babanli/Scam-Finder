import path from "path";
import fs from "fs/promises";

export function storageRoot() {
  return process.env.STORAGE_DIR
    ? path.resolve(process.env.STORAGE_DIR)
    : path.resolve(process.cwd(), "data");
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export function exportsDir() {
  return path.join(storageRoot(), "exports");
}

export function uploadsDir() {
  return path.join(storageRoot(), "uploads");
}

