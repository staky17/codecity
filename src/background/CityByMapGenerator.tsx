import * as THREE from "three";

import React, { useEffect, useRef, useState } from "react";
import { createBuildingFrom4Coordinate } from "./Building";
import { Vector2d, MapGenerator, District, Building } from "./mapGenerator";
import { createRoadFromStartToEnd } from "./Road";

// 親からmapGeneratorを受け取るための型定義
type Props = {
  mapGenerator: MapGenerator;
};

// Renderer を変える。
export function CityByMapGenerator({ mapGenerator }: Props) {
  // canvasタグを参照する
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Timerを設置(このcanvasがある限りレンダリングし続ける)
  const [timer, setTimer] = useState<number>(0);

  // マウント時一回だけ実行
  useEffect(() => {
    (async () => {
      // mapRendererを定義．基本的に全ての描写をこれが担当する
      const mapRenderer = new MapRenderer(canvasRef.current!, mapGenerator);
      // 1秒に1回レンダリングするタイマーを設定
      mapRenderer.render();
      setTimer(window.setInterval(mapRenderer.render.bind(mapRenderer), 1000));
    })();
    // canvasが消えたらタイマーを止める．
    return () => clearInterval(timer);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}

// mapGeneratorの情報がフォーマットされた状態
type RoadInfo = {
  coords: Array<Vector2d>; // 長さ２
};
type BuildingInfo = {
  coords: Array<Vector2d>;
  fileInfo: FileInfo;
};

class MapRenderer {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.Camera;
  scale: number;
  roadInfoList: RoadInfo[];
  buildingInfoList: BuildingInfo[];
  buildingList: THREE.Group[];
  roadList: THREE.Group[];
  mapGenerator: MapGenerator;

  constructor(canvas: HTMLCanvasElement, mapGenerator: MapGenerator) {
    this.mapGenerator = mapGenerator;
    // MapGeneratorの座標を拡大する倍率
    this.scale = 60;
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(1000));

    // TODO 光と格闘中 (綺麗な陰影がつかない。...)
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const pointlight = new THREE.PointLight(0xffffff, 10, 50, 1.0);
    pointlight.position.set(-1000, 700, -1000);
    this.scene.add(pointlight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    this.scene.add(directionalLight);
    const directionalLightFromRight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLightFromRight.position.set(-1000, 1, -1000);
    this.scene.add(directionalLightFromRight);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      100,
      10000
    );
    // cameraの初期設定
    this.camera.position.set(1000, 1000, 1000);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // building, roadの情報
    this.buildingInfoList = [];
    this.roadInfoList = [];

    // 後でthis.sceneから削除したいので、オブジェクトのリストを保持しておく。
    this.buildingList = [];
    this.roadList = [];
  }

  // MapGeneratorから道とビルの情報を取得
  extractMapInfo() {
    //　レンダリングごとに増えてしまうのを防ぐため初期化
    this.roadInfoList = [];
    this.buildingInfoList = [];
    // pathが指定されていない時は何もしない。
    if (typeof this.mapGenerator.rootDistrict === "undefined") return;
    let nodes: Array<District | Building> = [this.mapGenerator.rootDistrict];
    let absPositions: Array<Vector2d> = [new Vector2d(0, 0)];
    // nodeは，現在見ている地区または建物
    let node: District | Building;
    let absPosition: Vector2d;

    while (nodes.length > 0) {
      node = nodes.shift()!;
      absPosition = absPositions.shift()!;
      let absVertices = node.vertices.map((vertex) => {
        return vertex.add(absPosition); // vertex + absPosition
      });
      THREE.PointLight;

      // nodeがDistrictの時は、Routeの取得と座標情報の更新と、子nodeの追加
      if (node instanceof District) {
        let district: District = node;
        for (let route of district.routes) {
          let absStartPoint = route.start.add(absPosition),
            absEndPoint = route.end.add(absPosition);
          this.roadInfoList.push({
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
      // nodeがbuildingの時に、roadInfoを追加
      if (node instanceof Building) {
        let building: Building = node;
        this.buildingInfoList.push({
          fileInfo: building.fileInfo,
          coords: absVertices,
        });
      }
    }
  }

  // TODO 後でグラデーションを取り込む時に変更が起こる。
  // シーンに道とビルの追加
  private updateSceneObject() {
    // Sceneのbuildingがある場合に削除;
    if (this.buildingList.length) {
      this.scene.remove(...this.buildingList);
      this.buildingList.map((b) => {
        b.clear();
      });
    }
    //　Sceneのroadがある時に削除
    if (this.roadList.length) {
      this.scene.remove(...this.roadList);
      this.buildingList.map((road) => {
        road.clear();
      });
    }

    // buildingをリストに追加
    this.buildingList = this.buildingInfoList.map((buildingInfo) =>
      createBuildingFrom4Coordinate(
        buildingInfo.coords.map((c) => c.times(this.scale)), // TODO Scaleを変数に
        // componentInfo.height || 100,
        buildingInfo.fileInfo?.lineCount || 100,
        "Gradation"
      )
    );

    // roadを追加
    this.roadList = this.roadInfoList.map((roadInfo) =>
      createRoadFromStartToEnd(
        roadInfo.coords[0].times(this.scale), // TODO Scaleを変数に
        roadInfo.coords[1].times(this.scale), // TODO Scaleを変数に
        8,
        "DashedCenterLine"
      )
    );

    if (this.buildingList.length) this.scene.add(...this.buildingList);
    if (this.roadList.length) this.scene.add(...this.roadList);
  } // updateComponent End

  // RoadInfoList, BuildingInfoListから座標を集める
  // 一番　マイナスの座標から、一番プラスの座標まで(第三象限 -> 第一象限)
  private cameraPositioning() {
    const xcoords: number[] = [];
    const zcoords: number[] = [];

    // x座標とy座標のリストを生成
    // 道のx座標とy座標を取得
    for (let roadInfo of this.roadInfoList) {
      roadInfo.coords.map((c) => {
        xcoords.push(c.x * this.scale);
        zcoords.push(c.z * this.scale);
      });
    }
    //　ビルの4点座標を取得
    for (let buildingInfo of this.buildingInfoList) {
      buildingInfo.coords.map((c) => {
        xcoords.push(c.x * this.scale);
        zcoords.push(c.z * this.scale);
      });
    }

    const xmax = Math.max(...xcoords);
    const xmin = Math.min(...xcoords);
    const zmax = Math.max(...zcoords);
    const zmin = Math.min(...zcoords);

    // TODO 後でカメラ位置の調整をする。
    // TODO 後で高さも考える。
    this.camera.position.set(xmin - 200, 600, zmin - 200);
    this.camera.lookAt(new THREE.Vector3(xmax, 0, zmax));
  } // cameraPositioning End

  render(): void {
    console.log("render");
    console.log(this.scene.children);

    // MapGeneratorから道(this.roadInfoList)とビル(this.buildingInfoList)の情報を取得
    this.extractMapInfo();
    // this.sceneに道とビルの追加
    this.updateSceneObject();
    // 道(this.roadInfoList)とビル(this.buildingInfoList)の情報からカメラの位置を調整。
    this.cameraPositioning();
    this.renderer.render(this.scene, this.camera);
  }
}
