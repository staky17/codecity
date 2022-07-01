import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

export type BaseRoadSettings = {
  width: number;
  length: number;
  color?: number;
};

export type RoadSettings = BaseRoadSettings & {
  radian?: number;
  highlightColor?: number;
};

// No rotate Plane
class BaseRoad extends THREE.Mesh<THREE.BufferGeometry, THREE.Material> {
  constructor({ width, length, color }: BaseRoadSettings) {
    const geometryBaseRoad = new THREE.PlaneGeometry(width, length);
    const materialBaseRoad = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
    });
    super(geometryBaseRoad, materialBaseRoad);
  }
}

// Rotation
export class Road extends THREE.Group {
  private road: BaseRoad;

  constructor({ width, length, radian = 0, color = 0xb0c4de }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    this.road = new BaseRoad({ width, length: length, color });

    this.add(this.road);
    this.rotation.x = -Math.PI / 2; // Don't Change
    this.rotation.z = radian;
  }
  dispose() {
    this.road.material.dispose();
    this.road.geometry.dispose();
  }
}

export class RoadWithCenterLine extends THREE.Group {
  private road: BaseRoad;
  private geometryCenterLine: THREE.BufferGeometry;
  private materialCenterLine: THREE.Material;
  constructor({
    width,
    length,
    radian = 0,
    color = 0xb0c4de,
    highlightColor = 0xffffff,
  }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    this.road = this.road = new BaseRoad({ width, length, color });

    this.geometryCenterLine = new THREE.PlaneGeometry(width / 8, length);
    this.materialCenterLine = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });

    const centerline = new THREE.Mesh(
      this.geometryCenterLine,
      this.materialCenterLine
    );
    centerline.position.set(0, 0, 0.1);

    this.add(this.road, centerline);
    this.rotation.x = -Math.PI / 2; // Don't Change
    this.rotation.z = radian;
  }
  dispose() {
    this.geometryCenterLine.dispose();
    this.materialCenterLine.dispose();
    this.road.material.dispose();
    this.road.geometry.dispose();
  }
}

export class RoadWithDashedCenterLine extends THREE.Group {
  public road: BaseRoad;
  public geometryCenterLine: THREE.BufferGeometry;
  public materialCenterLine: THREE.Material;
  constructor({
    width,
    length,
    radian = 0,
    // color = 0xb0c4de,
    color = 0xb0c4de,
    highlightColor = 0xffffff,
  }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    const dashLength = 10;

    this.road = new BaseRoad({ width, length, color });

    this.geometryCenterLine = new THREE.PlaneGeometry(width / 8, dashLength);
    this.materialCenterLine = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });

    // lengthの半分
    //　 Dash長は固定値
    const centerlineDashs = [];
    for (let i = 0; i < Math.floor(length / dashLength) - 1; i++) {
      if (i % 2 === 0) {
        const centerline = new THREE.Mesh(
          this.geometryCenterLine,
          this.materialCenterLine
        );
        centerline.position.set(0, dashLength * i + dashLength, 0);
        centerlineDashs.push(centerline);
      }
    }

    const dashGroup = new THREE.Group();
    dashGroup.add(...centerlineDashs);
    dashGroup.position.set(0, -length / 2, 0.1);

    this.add(this.road, dashGroup);
    this.rotation.x = -Math.PI / 2; // Don't Change
    this.rotation.z = radian;
  }
  dispose() {
    this.geometryCenterLine.dispose();
    this.materialCenterLine.dispose();
    this.road.material.dispose();
    this.road.geometry.dispose();
  }
}

export type Coordinate2D = {
  x: number;
  z: number;
};

/* createRoadFromStartToEnd
// 任意の2点間に道を作る関数
// @Usage
// const r1 = createRoadFromStartToEnd(
//   { x: 100, z: 100 },
//   { x: 300, z: 300 },
//   80
// );
// scene.add(r1);
*/
export function createRoadFromStartToEnd(
  start: Coordinate2D,
  end: Coordinate2D,
  width: number,
  lineType: "NoLine" | "CenterLine" | "DashedCenterLine"
  // priority が追加されるかも。
) {
  let length = Math.sqrt((end.x - start.x) ** 2 + (end.z - start.z) ** 2);
  // 道を少し伸ばして切れ目を消す。
  length += width * 0.8;
  const rad = Math.atan2(end.x - start.x, end.z - start.z);

  let road: Road | RoadWithCenterLine | RoadWithDashedCenterLine;

  switch (lineType) {
    case "NoLine":
      road = new Road({
        width: width,
        length: length,
        radian: rad,
      });
      road.position.set((start.x + end.x) / 2, 0, (start.z + end.z) / 2);
      return road;

    case "DashedCenterLine":
      road = new RoadWithDashedCenterLine({
        width: width,
        length: length,
        radian: rad,
      });
      road.position.set((start.x + end.x) / 2, 1, (start.z + end.z) / 2);
      return road;

    case "CenterLine":
      road = new RoadWithCenterLine({
        width: width,
        length: length,
        radian: rad,
      });
      road.position.set((start.x + end.x) / 2, 2, (start.z + end.z) / 2);
      return road;
  }
}
