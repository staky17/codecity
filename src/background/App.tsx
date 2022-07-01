import React, { useState, useEffect, useRef } from "react";
import { CityByMapGenerator } from "./CityByMapGenerator";
import { Building, District, MapGenerator, Vector2d } from "./mapGenerator";
import GeometryMapViewer from "./GeometryMapViewer";

export const App = () => {
  // mapGeneratorはマップ情報を保持して，位置を変化させ続けるクラス
  const [mapGenerator, _] = useState(new MapGenerator());

  // 画面（コンポーネント）が描写されたら一回だけ実行される
  useEffect(() => {
    // フォルダを選択した時に実行される
    window.myAPI.on("reset", (_: Electron.IpcRendererEvent, path: string) => {
      setTimeout(() => {
        console.log("街を初期化します", path);
        // mapGeneratorを初期化する
        mapGenerator.initialize(path);
      }, 1);
    });

    // ファイルが1つ追加された時に実行される（フォルダが増えてもこれは実行されません）
    window.myAPI.on(
      "addFile",
      (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
        setTimeout(() => {
          console.log("建物を追加します", fileInfo);
          // ファイル情報を追加して，建物を増やす
          mapGenerator.addBuilding(fileInfo);
        }, 1);
      }
    );

    window.myAPI.on(
      "updateFile",
      (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
        setTimeout(() => {
          console.log("建物を更新します", fileInfo);
          mapGenerator.updateBuilding(fileInfo);
        }, 1);
      }
    );

    window.myAPI.on(
      "removeFile",
      (_: Electron.IpcRendererEvent, fileInfo: FileInfo) => {
        setTimeout(() => {
          console.log("建物を削除します", fileInfo);
          mapGenerator.removeBuilding(fileInfo);
        }, 1);
      }
    );
  }, []);

  return (
    <>
      {/* <GeometryMapViewer mapGenerator={mapGenerator}></GeometryMapViewer> */}
      <CityByMapGenerator mapGenerator={mapGenerator} />
    </>
  );
};
