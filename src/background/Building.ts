import * as THREE from "three";

import { Coordinate2D } from "./Road";

import { extColors } from "./textureColors";

export type BaseBuildingSettings = {
  width: number;
  height: number;
  depth: number;
  ext?: string;
  filename?: string;
  bodyColor?: number;
};

export class BuildingWithGradation extends THREE.Mesh<
  THREE.BufferGeometry,
  THREE.Material[]
> {
  constructor({
    width,
    height,
    depth,
    ext = "others", // 拡張子がないファイルはothersになるが、拡張子があるファイルの中でextColorsにないものもothersにしたい。
    filename = "",
  }: BaseBuildingSettings) {
    // 拡張子がextCororsになければ、othersを付与
    ext = Object.keys(extColors).includes(ext) ? ext : "others";
    console.log(ext);

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = createMaterial(extColors[ext], width, height);

    super(geometry, material);
  }
}

/*
calculateWidthDepthFrom4Coordinate と
calculateCenterPositionFrom4Coordinateのヘルパー関数
 */
function sortCoordinateXZValue(
  coordList: Coordinate2D[]
): [number[], number[]] {
  const descendingOrder = (a: number, b: number) => {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  };
  let arrx = coordList.map((c) => c.x).sort(descendingOrder);
  let arrz = coordList.map((c) => c.z).sort(descendingOrder);

  return [arrx, arrz];
}

/* 4座標から幅と奥行きを得る
// usage
const result1 = calculateWidthDepthFrom4Coordinate(
    [
      {x:1,z:2},
      {x:2,z:2},
      {x:1,z:4},
      {x:2,z:4},
    ]
)
// {"width": 1,"depth": 2}
*/

function calculateWidthDepthFrom4Coordinate(coordList: Coordinate2D[]): {
  width: number;
  depth: number;
} {
  const [arrx, arrz] = sortCoordinateXZValue(coordList);

  // 前二つ、後ろ二つで平均(誤差対策)して、それらの差を出す。
  const calcLength = (arr: number[]) => {
    return Math.abs((arr[0] + arr[1]) / 2 - (arr[2] + arr[3]) / 2);
  };

  // 道と被らないように少し小さくする。
  let width = calcLength(arrx) * 0.9;
  let depth = calcLength(arrz) * 0.9;

  return { width, depth };
}

/* 4座標から中心座標を得る
// Usage
const result = calculateCenterPositionFrom4Coordinate(
  [
    {x:1,z:2},
    {x:2,z:2},
    {x:1,z:4},
    {x:2,z:4},
  ]
)
// => {"x": 1.5,"z": 3}
*/

function calculateCenterPositionFrom4Coordinate(coordList: Coordinate2D[]) {
  const [arrx, arrz] = sortCoordinateXZValue(coordList);

  // 中心座標を出す
  // 4つのx(or z)座標の値の平均値
  const calcCenterPosition = (arr: number[]) => {
    return arr.reduce((s, e) => s + e, 0) / 4;
  };

  return { x: calcCenterPosition(arrx), z: calcCenterPosition(arrz) };
}

// 4座標からビルを作成する。
export function createBuildingFrom4Coordinate(
  coordList: Coordinate2D[],
  height: number,
  filename?: string,
  ext?: string
) {
  const { x, z } = calculateCenterPositionFrom4Coordinate(coordList);
  const { width, depth } = calculateWidthDepthFrom4Coordinate(coordList);
  const baseBuildingSettings: BaseBuildingSettings = {
    width,
    depth,
    height,
  };
  let building: THREE.Mesh<THREE.BufferGeometry, THREE.Material[]>;

  building = new BuildingWithGradation({
    ...baseBuildingSettings,
    ext: ext || "others",
  });
  building.position.set(x, 0, z);
  return building;
}

// マテリアルをcanvasを使って作成(textureImages使ってないです！)
function createMaterial(
  extColor: [string, string],
  width: number,
  height: number
) {
  // キャンバスのサイズを定義．
  const canvasWidth = width;
  const canvasHeight = height;

  // マテリアル用の仮想DOMを作成
  let canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d")!;

  // グラデーションで塗る．
  const color = context.createLinearGradient(0, 0, 0, canvasHeight);
  color.addColorStop(0.0, extColor[0]);
  color.addColorStop(1.0, extColor[1]);
  context.fillStyle = color;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  // 横線を入れる．
  context.fillStyle = extColor[1] + "80";
  for (let i = 0; i < Math.floor(canvasHeight) / 8; i++) {
    context.fillRect(0, canvasHeight - (i * 8 - 4), canvasWidth, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);

  // 建物の横はcanvasから作成したテクスチャを貼る
  const m1 = new THREE.MeshLambertMaterial({
    map: texture,
  });
  // 建物の上側は一色にする
  const m2 = new THREE.MeshLambertMaterial({
    color: extColor[0],
  });
  // boxは6面なので，マテリアルの6個の配列を渡す（Three.jsはマテリアルの配列をマテリアルとして処理できる）
  return [m1, m1, m2, m1, m1, m1];
}
