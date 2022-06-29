import * as THREE from "three";

import React, { useEffect, useState } from "react";
import {
  BaseBuildingSettings,
  BuildingWithWindows,
  createBuildingFrom4Coordinate,
} from "./Building";
import { Vector2d, MapGenerator, District, Building } from "./mapGenerator";
import { BaseRoadSettings, Coordinate2D } from "./Road";

export function CityByMapGenerator({
  mapGenerator,
  componentInfoList,
  WindowWidth,
  WindowHeight,
}: {
  mapGenerator: MapGenerator;
  componentInfoList: ComponentInfo[];
  WindowWidth: number;
  WindowHeight: number;
}) {
  const [stage, _] = useState(new Stage(WindowWidth, WindowHeight));

  const createCity = () => {
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#cityCanvas") as HTMLCanvasElement,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WindowWidth, WindowHeight);

    function tick() {
      //
      stage.update(getComponentInfo(mapGenerator));
      renderer.render(stage.scene, stage.camera);
    }
    setInterval(tick, 1000);
  };

  // マウント時一回だけ描写
  useEffect(() => {
    createCity();
  }, []);
  return <canvas id="cityCanvas" />;
}

// Light Camera, Scene ,Componentの管理をする。
class Stage {
  public scene: THREE.Scene;
  public camera: THREE.Camera;
  childrenNum: number;
  buildinglist: THREE.Group[];

  constructor(
    WindowWidth: number,
    WindowHeight: number
    // componentInfoList: ComponentInfo[]
  ) {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(1000));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    this.scene.add(new THREE.DirectionalLight(0xffffff, 0.6));
    this.scene.add(new THREE.DirectionalLight(0xffffff, 0.8));
    this.childrenNum = this.scene.children.length;

    this.camera = new THREE.PerspectiveCamera(
      75,
      WindowWidth / WindowHeight,
      100,
      10000
    );
    this.camera.position.set(-200, 1000, -800);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.buildinglist = [];
  }

  update(componentInfoList: ComponentInfo[]) {
    //sceneのbuildingがある場合に削除
    if (this.buildinglist.length > 0) {
      this.scene.remove(...this.buildinglist);
      this.buildinglist.map((b) => {
        b.clear();
      });
    }

    if (componentInfoList.length > 0) {
      this.buildinglist = componentInfoList.map((componentInfo) =>
        createBuildingFrom4Coordinate(
          componentInfo.coords,
          100,
          "Windows",
          componentInfo.filename
        )
      );
      this.scene.add(...this.buildinglist);
    }
    return this;
  }
}

// フォーマットされた状態
type ComponentInfo = {
  type: string;
  filename: string;
  coords: Array<Vector2d>;
};

// CreateBuildingの引数を作らなければいけない。
// 本来であればGeometoryMapViewerの責務
// 座標のscalingは分離したい...
// cameraの位置は変えたくない...
// mapGeneratorからMap情報を抽出してフォーマットする関数
function getComponentInfo(mapGenerator: MapGenerator) {
  if (typeof mapGenerator.rootDistrict === "undefined") return [];
  let nodes: Array<District | Building> = [mapGenerator.rootDistrict];
  let absPositions: Array<Vector2d> = [new Vector2d(0, 0)];
  // nodeは，現在見ている地区または建物
  let node: District | Building;
  let absPosition: Vector2d;

  const result: ComponentInfo[] = [];

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
