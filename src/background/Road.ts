import * as THREE from "three";

type RoadSettings = {
  width: number;
  length: number;
  radian?: number;
};

export class Road extends THREE.Group {
  constructor({ width, length, radian = 0 }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    const geometryMainRoad = new THREE.PlaneGeometry(width, length);
    const geometryCenterLine = new THREE.PlaneGeometry(width / 8, length);

    const materialMainRoad = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
    });
    const materialCenterLine = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: false,
    });

    const road = new THREE.Mesh(geometryMainRoad, materialMainRoad);
    const centerline = new THREE.Mesh(geometryCenterLine, materialCenterLine);
    centerline.position.set(0, 0.1, 0);

    this.add(road, centerline);
    this.rotation.x = -Math.PI / 2; // Don't Change
    this.rotation.z = radian;
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
  width: number
) {
  const length = Math.sqrt((end.x - start.x) ** 2 + (end.z - start.z) ** 2);
  const cos = (end.x - start.x) / length;
  const rad = Math.acos(cos);

  const road = new Road({ width: width, length: length, radian: rad });
  road.position.set((start.x + end.x) / 2, 0, (start.z + end.z) / 2);
  return road;
}
