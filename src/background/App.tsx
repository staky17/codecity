import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { CityByMapGenerator } from "./CityByMapGenerator";
import { City } from "./City";
import { Building, District, MapGenerator, Vector2d } from "./mapGenerator";
import GeometryMapViewer from "./GeometryMapViewer";
import { map } from "lodash";

export const App = () => {
  // mapGeneratorはマップ情報を保持して，位置を変化させ続けるクラス
  // const [mapGenerator, _] = useState(new MapGenerator());
  const [mapGenerator, setMapGenerator] = useState(new MapGenerator());
  let [componentInfoList, setComponentInfoList] = useState<ComponentInfo[]>([]);

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

  return (
    <>
      <CityByMapGenerator
        mapGenerator={mapGenerator}
        componentInfoList={componentInfoList}
        WindowWidth={1500}
        WindowHeight={1500}
      />
    </>
  );
};

// フォーマット形式
type ComponentInfo = {
  type: string;
  filename: string;
  coords: Array<Vector2d>;
};

function getComponentInfo(mapGenerator: MapGenerator) {
  const result: ComponentInfo[] = [];
  if (typeof mapGenerator.rootDistrict === "undefined") return [];

  let nodes: Array<District | Building> = [mapGenerator.rootDistrict];
  let absPositions: Array<Vector2d> = [new Vector2d(0, 0)];
  // nodeは，現在見ている地区または建物
  let node: District | Building;
  let absPosition: Vector2d;

  while (nodes.length > 0) {
    node = nodes.shift()!;
    absPosition = absPositions.shift()!;
    let absVertices = node.vertices.map((vertex) => {
      return vertex.add(node.base).add(absPosition).times(60);
    });

    if (node instanceof District) {
      let district: District = node;
      nodes = nodes.concat(
        Object.keys(district.children).map((key) => district.children[key])
      );
      absPositions = absPositions.concat(
        Object.keys(district.children).map((_) => {
          return district.base.add(absPosition);
        })
      );
    }
    if (node instanceof Building) {
      let building: Building = node;
      result.push({
        type: "building",
        filename: node.name,
        coords: absVertices,
      });
    }
    // MapObjectじゃないのでおそらくこうではないが一応。
    // if (node instanceof Road) {
    //   let road: Road = node;
    //   result.push({type:"Road", filename:node.name, coords?})
    // }
  }
  return result;
}
