import { parse } from "path";
import { promisify } from "util";
import { exec } from "child_process";
const _exec = promisify(exec);
import { promises as fs } from "fs";

export const getFileInfo = async (path: string): Promise<FileInfo> => {
  let size: number | null = null;
  let mime: string | null = null;
  let charset: string | null = null;
  let lineCount: number | null = null;

  let { ext, name } = parse(path);

  try {
    const stats = await fs.stat(path);
    size = stats.size;
  } catch {}

  try {
    const fileType = new RegExp(`${path}: +(.+?); +charset=*(.+?)\n`).exec(
      (await _exec(`file --mime ${path}`)).stdout
    );
    if (fileType !== null) {
      mime = fileType[1];
      charset = fileType[2];

      if (charset !== "binary") {
        let l = new RegExp(`([0-9]+)`).exec((await _exec(`wc ${path}`)).stdout);
        if (l !== null) lineCount = Number(l[1]);
      }
    }
  } catch {}

  return {
    mime: mime,
    charset: charset,
    size: size,
    lineCount: lineCount,
    path: path,
    ext: ext,
    name: name,
  };
};
