import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { City } from "./City";
import { MapGenerator } from "./mapGenerator";
import GeometryMapViewer from "./GeometryMapViewer";

export const App = () => {
  // mapGeneratorはマップ情報を保持して，位置を変化させ続けるクラス
  const [mapGenerator, _] = useState(new MapGenerator());

  // 画面（コンポーネント）が描写されたら一回だけ実行される
  useEffect(() => {
    // フォルダを選択した時に実行される
    window.myAPI.on("reset", (_: Electron.IpcRendererEvent, path: string) => {
      console.log("街を初期化します", path);
      // mapGeneratorを初期化する
      mapGenerator.initialize(path);
    });

    // ファイルが1つ追加された時に実行される（フォルダが増えてもこれは実行されません）
    window.myAPI.on(
      "addFile",
      (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
        console.log("建物を追加します", fileInfo);
        // ファイル情報を追加して，建物を増やす
        mapGenerator.addBuilding(fileInfo);
      }
    );

    window.myAPI.on(
      "updateFile",
      (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
        console.log("建物を更新します", fileInfo);
      }
    );

    window.myAPI.on(
      "removeFile",
      (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
        console.log("建物を削除します", fileInfo);
      }
    );
  }, []);

  //return (
  //  <div className="container">
  //    <h1>This is background</h1>
  //    {Object.keys(fileInfoDict).map((path) => (
  //      <div key={path}>{path}</div>
  //    ))}
  //  </div>
  //);

  return <GeometryMapViewer mapGenerator={mapGenerator}></GeometryMapViewer>;

  // return <City />;
};
