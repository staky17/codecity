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
  // const [componentInfoList, setComponentInfoList] = useState(
  //   getComponentInfo(mapGenerator)
  // );

  const [stage, setStage] = useState(new Stage(WindowWidth, WindowHeight));

  const createBox = () => {
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#cityCanvas") as HTMLCanvasElement,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WindowWidth, WindowHeight);

    // reactのstateとして、scene
    // Three.js 内のオブジェクト を辞書 (state)
    // キーをファイル名、valueはコンポーネント
    console.log("create box");
    // setStage(stage);

    function tick() {
      setStage(stage.add(getComponentInfo(mapGenerator)));
      console.log("added component", stage.scene.children);
      // console.log(getComponentInfo(mapGenerator));
      // stage.add(componentInfoList);
      // console.log(componentInfoList);
      renderer.render(stage.scene, stage.camera);
      // requestAnimationFrame(tick);
    }
    // tick();
    setInterval(tick, 1000);
  };

  // マウント時一回だけ描写
  useEffect(() => {
    createBox();
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

  add(componentInfoList: ComponentInfo[]) {
    //sceneのbuildingがある場合に削除
    if (this.buildinglist.length > 0) {
      this.scene.remove(...this.buildinglist);
      this.buildinglist.map((b) => {
        b.remove();
      });
      // console.log(this.buildinglist.length);
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
      console.log("buildinglist", this.buildinglist);
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
