interface FileInfo {
  path: string;
  ext: string;
  name: string;
  mime: string | null;
  charset: string | null;
  lineCount: number | null;
  size: number | null;
}

interface FileInfoDict {
  [path: string]: FileInfo;
}

interface Message {
  text: string;
}
