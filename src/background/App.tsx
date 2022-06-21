import React, { useState, useEffect } from "react";

const { myAPI } = window;

type FileInfo = {
  path: string;
};

export const App = () => {
  const [fileInfos, setFileInfos] = useState({});

  myAPI.on("reset", () => {
    console.log("街を初期化します");
  });

  myAPI.on("addFile", (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
    console.log("建物を追加します", fileInfo);
  });

  myAPI.on("updateFile", (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
    console.log("建物を更新します", fileInfo);
  });

  myAPI.on("removeFile", (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
    console.log("建物を削除します", fileInfo);
  });

  return (
    <div className="container">
      <h1>This is background</h1>
    </div>
  );
};
