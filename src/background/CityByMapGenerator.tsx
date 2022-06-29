import * as THREE from "three";

import React, { useEffect, useState } from "react";
import { createBuildingFrom4Coordinate } from "./Building";
import { Vector2d, MapGenerator, District, Building } from "./mapGenerator";
import { createRoadFromStartToEnd } from "./Road";

export function CityByMapGenerator({
  mapGenerator,
  WindowWidth,
  WindowHeight,
}: {
  mapGenerator: MapGenerator;
  WindowWidth: number;
  WindowHeight: number;
}) {
  const [stage, _] = useState(new Stage(WindowWidth, WindowHeight));

  const createCity = () => {
    // THREEjsのrenderer
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#cityCanvas") as HTMLCanvasElement,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WindowWidth, WindowHeight);

    // 最新の情報で描画
    function tick() {
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
  roadlist: THREE.Group[];
  vertexlist: Vector2d[];

  constructor(
    WindowWidth: number,
    WindowHeight: number
    // componentInfoList: ComponentInfo[]
  ) {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(1000));
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    this.scene.add(new THREE.DirectionalLight(0xffffff, 0.6));
    // this.scene.add(new THREE.DirectionalLight(0xffffff, 0.8));
    this.childrenNum = this.scene.children.length;

    this.camera = new THREE.PerspectiveCamera(
      75,
      WindowWidth / WindowHeight,
      100,
      10000
    );
    // this.camera.position.set(-1200, 800, -1200);
    // this.camera.lookAt(new THREE.Vector3(1000, 0, 1000));
    this.camera.position.set(1000, 1000, 1000);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.buildinglist = [];
    this.roadlist = [];
    this.vertexlist = [];
  }

  update(componentInfoList: ComponentInfo[]) {
    console.log(componentInfoList);
    //sceneのbuildingがある場合に削除
    if (this.buildinglist.length > 0) {
      this.scene.remove(...this.buildinglist);
      this.buildinglist.map((b) => {
        b.clear();
      });
    }
    //sceneのroadがある時に削除
    if (this.roadlist.length > 0) {
      this.scene.remove(...this.roadlist);
      this.buildinglist.map((road) => {
        road.clear();
      });
    }

    // Buildingを追加
    if (componentInfoList.length > 0) {
      this.buildinglist = componentInfoList
        .filter((componentInfo) => componentInfo.type === "building")
        .map((componentInfo) =>
          createBuildingFrom4Coordinate(
            componentInfo.coords.map((c) => c.times(60)),
            // componentInfo.height || 100,
            componentInfo.fileInfo?.lineCount || 100,
            "Stripe"
          )
        );
      // Roadを追加
      this.roadlist = componentInfoList
        .filter((componentInfo) => componentInfo.type === "road")
        .map((componentInfo) =>
          createRoadFromStartToEnd(
            componentInfo.coords[0].times(60),
            componentInfo.coords[1].times(60),
            8,
            "NoLine"
          )
        );
      // console.log("buildinglist", this.buildinglist);
      // console.log("roadlist", this.roadlist);
      this.scene.add(...this.buildinglist);
      this.scene.add(...this.roadlist);
    }
  }

  ajustCamera(componentInfoList: ComponentInfo[]) {}
}

// フォーマットされた状態
type ComponentInfo = {
  type: string;
  fileInfo?: FileInfo;
  coords: Array<Vector2d>;
};
// 座標のscalingは分離したい...
// cameraの位置は変えたくない...
// MapGeneratorから、必要なパラメータを成形して取得する。
function getComponentInfo(mapGenerator: MapGenerator): ComponentInfo[] {
  const result: ComponentInfo[] = [];
  if (typeof mapGenerator.rootDistrict === "undefined") return result;

  let nodes: Array<District | Building> = [mapGenerator.rootDistrict];
  let absPositions: Array<Vector2d> = [new Vector2d(0, 0)];
  // nodeは，現在見ている地区または建物
  let node: District | Building;
  let absPosition: Vector2d;

  while (nodes.length > 0) {
    node = nodes.shift()!;
    absPosition = absPositions.shift()!;
    let absVertices = node.vertices.map((vertex) => {
      // return vertex.add(node.base).add(absPosition);
      return vertex.add(absPosition); // vertex + absPosition
    });

    // nodeがDistrictの時は、座標情報の更新と、子nodeの追加
    if (node instanceof District) {
      let district: District = node;
      for (let route of district.routes) {
        let absStartPoint = route.start.add(absPosition),
          absEndPoint = route.end.add(absPosition);
        result.push({
          type: "road",
          coords: [absStartPoint, absEndPoint],
        });
      }
      nodes = nodes.concat(
        Object.keys(district.children).map((key) => district.children[key])
      );
      absPositions = absPositions.concat(
        Object.keys(district.children).map((childName) => {
          return district.children[childName].base.add(absPosition);
        })
      );
    }
    // nodeがbuildingの時に、infoを追加
    if (node instanceof Building) {
      let building: Building = node;
      result.push({
        type: "building",
        fileInfo: building.fileInfo,
        coords: absVertices,
      });
    }
  }
  return result;
}
