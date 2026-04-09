import fs from "fs/promises";
import path from "path";

export function storageDir() {
  return process.env.STORAGE_DIR
    ? path.resolve(process.env.STORAGE_DIR)
    : path.resolve(process.cwd(), "data");
}

export function visitsPath() {
  return path.join(storageDir(), "visits.jsonl");
}

export async function ensureStorage() {
  await fs.mkdir(storageDir(), { recursive: true });
}
