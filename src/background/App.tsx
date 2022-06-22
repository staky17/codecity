import React, { useState, useEffect } from "react";

const { myAPI } = window;

export const App = () => {
  const [fileInfoDict, setFileInfoDict] = useState({} as FileInfoDict);

  myAPI.on("reset", () => {
    console.log("街を初期化します");
    setFileInfoDict({});
  });

  myAPI.on("addFile", (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
    console.log("建物を追加します", fileInfo);
    setFileInfoDict((prevFileInfoDict) =>
      Object.assign({}, prevFileInfoDict, {
        [fileInfo.path]: fileInfo,
      } as FileInfoDict)
    );
  });

  myAPI.on("updateFile", (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
    console.log("建物を更新します", fileInfo);
    setFileInfoDict((prevFileInfoDict) =>
      Object.assign({}, prevFileInfoDict, {
        [fileInfo.path]: fileInfo,
      } as FileInfoDict)
    );
  });

  myAPI.on("removeFile", (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
    console.log("建物を削除します", fileInfo);
    setFileInfoDict((prevFileInfoDict) =>
      (({ [fileInfo.path]: undefined, ...rest }: FileInfoDict) => rest)(
        prevFileInfoDict
      )
    );
  });

  return (
    <div className="container">
      <h1>This is background</h1>
      {Object.keys(fileInfoDict).map((path) => (
        <div key={path}>{path}</div>
      ))}
    </div>
  );
};
