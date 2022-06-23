import { colors } from "@mui/material";
import _ from "lodash";
import * as THREE from "three";

type RoadSettings = {
  width: number;
  length: number;
  radian?: number;
  color?: number;
  highlightColor?: number;
};

export class Road extends THREE.Group {
  constructor({
    width,
    length,
    radian = 0,
    color = 0xffffff,
    highlightColor = 0xffffff,
  }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    const geometryMainRoad = new THREE.PlaneGeometry(width, length);
    const geometryCenterLine = new THREE.PlaneGeometry(width / 8, length);

    const materialMainRoad = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
    });
    const materialCenterLine = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });

    const road = new THREE.Mesh(geometryMainRoad, materialMainRoad);
    const centerline = new THREE.Mesh(geometryCenterLine, materialCenterLine);
    centerline.position.set(0, 0.1, 0);

    this.add(road, centerline);
    this.rotation.x = -Math.PI / 2; // Don't Change
    this.rotation.z = radian;
  }
}

export class RoadWithDashedCenterline extends THREE.Group {
  constructor({
    width,
    length,
    radian = 0,
    color = 0xffffff,
    highlightColor = 0xffffff,
  }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    const dashLength = 10;
    const geometryMainRoad = new THREE.PlaneGeometry(width, length);
    const geometryCenterLine = new THREE.PlaneGeometry(width / 8, dashLength);

    const materialMainRoad = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
    });
    const materialCenterLine = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });

    const road = new THREE.Mesh(geometryMainRoad, materialMainRoad);

    // lengthの半分
    //　 Dash長は固定値

    const centerlineDashs = [];
    for (let i = 0; i < Math.floor(length / dashLength) - 1; i++) {
      if (i % 2 === 0) {
        const centerline = new THREE.Mesh(
          geometryCenterLine,
          materialCenterLine
        );
        centerline.position.set(0, dashLength * i + dashLength, 0);
        centerlineDashs.push(centerline);
      }
    }

    const dashGroup = new THREE.Group();
    dashGroup.add(...centerlineDashs);
    dashGroup.position.set(0, -length / 2, 0);

    // const centerline = new THREE.Mesh(geometryCenterLine, materialCenterLine);
    // centerline.position.set(0, 0.1, 0);

    this.add(road, dashGroup);
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

  const road = new RoadWithDashedCenterline({
    width: width,
    length: length,
    radian: rad,
  });
  road.position.set((start.x + end.x) / 2, 0, (start.z + end.z) / 2);
  return road;
}
