import * as THREE from "three";

import { Coordinate2D } from "./Road";

export type BaseBuildingSettings = {
  width: number;
  height: number;
  depth: number;
  bodyColor?: number;
};

export type BuildingWithStripesSettings = BaseBuildingSettings & {
  stripeNum?: number;
  highlightColor?: number;
};

export type BuildingWithWindowsSettings = BaseBuildingSettings & {
  highlightColor?: number;
  verticalWindowNum?: number;
  horizontalWindowNum?: number;
};

export class BaseBuilding extends THREE.Group {
  constructor({
    width,
    height,
    depth,
    bodyColor = 0x8a2be2,
  }: BaseBuildingSettings) {
    super();
    const material_body = new THREE.MeshLambertMaterial({ color: bodyColor });
    const geometry_body = new THREE.BoxGeometry(width, height, depth);
    const body = new THREE.Mesh(geometry_body, material_body);
    body.position.set(0, height / 2, 0);
    this.add(body);
  }
}

export class BuildingWithStripes extends THREE.Group {
  constructor({
    width,
    height,
    depth,
    stripeNum = 6,
    bodyColor = 0x8a2be2,
    highlightColor = 0xdda0dd,
  }: BuildingWithStripesSettings) {
    super();

    const body = new BaseBuilding({ width, height, depth, bodyColor });

    const material_floor = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });
    const geometry_floor = new THREE.BoxGeometry(
      width * 1.025,
      height * 0.025,
      depth * 1.025
    );

    const stripes = [];
    for (let i = 1; i < stripeNum; i++) {
      const floor = new THREE.Mesh(geometry_floor, material_floor);
      floor.position.set(0, (i * height) / stripeNum, 0);
      stripes.push(floor);
    }

    const material_roof_circle = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });

    const geometry_roof_circle = new THREE.CylinderGeometry(
      ((width + depth) / 2) * 0.1,
      ((width + depth) / 2) * 0.1,
      height * 0.025,
      90
    );
    const roof_circle = new THREE.Mesh(
      geometry_roof_circle,
      material_roof_circle
    );
    roof_circle.position.set(width / 10, height, 0);
    this.add(body, ...stripes, roof_circle);
  }
}

export class BuildingWithWindows extends THREE.Group {
  constructor({
    width,
    height,
    depth,
    verticalWindowNum = 5,
    horizontalWindowNum = 5,
    bodyColor = 0x8a2be2,
    highlightColor = 0xdda0dd,
  }: BuildingWithWindowsSettings) {
    super();
    const body = new BaseBuilding({ width, height, depth, bodyColor });

    const material_window = new THREE.MeshLambertMaterial({
      color: highlightColor,
      transparent: false,
    });

    const windowLength_h = height / (2 * verticalWindowNum + 1);
    const windowLength_d = depth / (2 * horizontalWindowNum + 1);
    const windowLength_w = width / (2 * horizontalWindowNum + 1);
    const geometry_window_x = new THREE.BoxGeometry(
      width + 3,
      windowLength_h,
      windowLength_d
    );
    const geometry_window_z = new THREE.BoxGeometry(
      windowLength_w,
      windowLength_h,
      depth + 3
    );

    const windows = [];
    for (let i = 0; i < verticalWindowNum; i++) {
      for (let k = 0; k < horizontalWindowNum; k++) {
        const window_x = new THREE.Mesh(geometry_window_x, material_window);
        const window_z = new THREE.Mesh(geometry_window_z, material_window);
        window_z.position.set(
          windowLength_w * (2 * k + 3 / 2) - width / 2,
          windowLength_h * (2 * i + 3 / 2),
          -1
        );

        window_x.position.set(
          -1,
          windowLength_h * (2 * i + 3 / 2),
          windowLength_d * (2 * k + 3 / 2) - depth / 2
        );
        windows.push(window_x, window_z);
      }
    }

    this.add(body, ...windows);
  }
}

/*
calculateWidthDepthFrom4CoordinateとcalculateCenterPositionFrom4Coordinateのヘルパー関数
 */
function sortCoordinateXZValue(
  coordList: [Coordinate2D, Coordinate2D, Coordinate2D, Coordinate2D]
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

function calculateWidthDepthFrom4Coordinate(
  coordList: [Coordinate2D, Coordinate2D, Coordinate2D, Coordinate2D]
): { width: number; depth: number } {
  const [arrx, arrz] = sortCoordinateXZValue(coordList);

  // 前二つ、後ろ二つで平均(誤差対策)して、それらの差を出す。
  const calcLength = (arr: number[]) => {
    return Math.abs((arr[0] + arr[1]) / 2 - (arr[2] + arr[3]) / 2);
  };

  let width = calcLength(arrx);
  let depth = calcLength(arrz);
  console.log(width, depth);

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

function calculateCenterPositionFrom4Coordinate(
  coordList: [Coordinate2D, Coordinate2D, Coordinate2D, Coordinate2D]
) {
  const [arrx, arrz] = sortCoordinateXZValue(coordList);

  // 中心座標を出す
  // 4つのx(or z)座標の値の平均値
  const calcCenterPosition = (arr: number[]) => {
    return arr.reduce((s, e) => s + e, 0) / 4;
  };
  return { x: calcCenterPosition(arrx), z: calcCenterPosition(arrz) };
}