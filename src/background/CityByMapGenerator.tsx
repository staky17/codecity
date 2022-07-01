import * as THREE from "three";

import React, { useEffect, useRef, useState } from "react";
import { createBuildingFrom4Coordinate } from "./Building";
import { Vector2d, MapGenerator, District, Building } from "./mapGenerator";
import {
  createRoadFromStartToEnd,
  Road,
  RoadWithCenterLine,
  RoadWithDashedCenterLine,
} from "./Road";

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
  buildingList: THREE.Mesh<THREE.BufferGeometry, THREE.Material[]>[];
  roadList: Array<Road | RoadWithCenterLine | RoadWithDashedCenterLine>;
  mapGenerator: MapGenerator;

  constructor(canvas: HTMLCanvasElement, mapGenerator: MapGenerator) {
    this.mapGenerator = mapGenerator;
    // MapGeneratorの座標を拡大する倍率
    this.scale = 60;
    this.scene = new THREE.Scene();
    // this.scene.add(new THREE.AxesHelper(1000));

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pointlight = new THREE.PointLight(0xffffff, 1, 50, 1.0);
    pointlight.position.set(0, 70, -500);
    this.scene.add(pointlight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    this.scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight2.position.set(-1, 0, 0);
    // directionalLight2.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(directionalLight2);

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
      2000
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

  // シーンに道とビルの追加
  private updateSceneObject() {
    // Sceneのbuildingがある場合に削除;
    if (this.buildingList.length) {
      this.scene.remove(...this.buildingList);
      this.buildingList.map((b) => {
        b.geometry.dispose();
        b.material.forEach((m) => m.dispose());
      });
    }
    //　Sceneのroadがある時に削除
    if (this.roadList.length) {
      this.scene.remove(...this.roadList);
      this.roadList.map((road) => {
        road.dispose();
      });
    }

    // buildingをリストに追加
    this.buildingList = this.buildingInfoList.map((buildingInfo) => {
      const coords = buildingInfo.coords.map((c) => c.times(this.scale));
      // 画像などの時はライン数０
      const lines = buildingInfo.fileInfo?.lineCount || 0;
      // 最低25の高さを与える（ペシャンコ対策)
      let height = Math.max(lines, 25);
      // 500を超えると増分にログをつける。
      if (height > 500) height = 500 + Math.log(height - 500);

      return createBuildingFrom4Coordinate(
        coords,
        height,
        buildingInfo.fileInfo.path,
        buildingInfo.fileInfo.ext
      );
    });

    // roadを追加
    this.roadList = this.roadInfoList.map((roadInfo) =>
      createRoadFromStartToEnd(
        roadInfo.coords[0].times(this.scale),
        roadInfo.coords[1].times(this.scale),
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
    const ycoords: number[] = [];

    // x座標とy座標のリストを生成
    // 道のx座標とy座標を取得
    for (let roadInfo of this.roadInfoList) {
      roadInfo.coords.forEach((c) => {
        xcoords.push(c.x * this.scale);
        zcoords.push(c.z * this.scale);
      });
    }
    //　ビルの4点座標を取得
    for (let buildingInfo of this.buildingInfoList) {
      buildingInfo.coords.forEach((c) => {
        xcoords.push(c.x * this.scale);
        zcoords.push(c.z * this.scale);
      });
      ycoords.push(buildingInfo.fileInfo.lineCount || 100);
    }

    // 描画空間のx,zの最大値、最小値を取得
    const xmax = Math.max(...xcoords);
    const xmin = Math.min(...xcoords);
    const zmax = Math.max(...zcoords);
    const zmin = Math.min(...zcoords);
    // 描画空間の高さの最大値を取得
    const ymax = Math.max(...ycoords);

    // カメラ位置の調整
    this.camera.position.set(xmin - 200, ymax + 25, zmin - 200);
    this.camera.lookAt(new THREE.Vector3(xmax, 0, zmax));
  } // cameraPositioning End

  render(): void {
    // MapGeneratorから道(this.roadInfoList)とビル(this.buildingInfoList)の情報を取得
    this.extractMapInfo();
    // this.sceneに道とビルの追加
    this.updateSceneObject();
    // 道(this.roadInfoList)とビル(this.buildingInfoList)の情報からカメラの位置を調整。
    this.cameraPositioning();
    this.renderer.render(this.scene, this.camera);
  }
}
