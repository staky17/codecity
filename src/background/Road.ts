import * as THREE from "three";

type BaseRoadSettings = {
  width: number;
  length: number;
  color: number;
  opacity: number;
};

type RoadSettings = {
  width: number;
  length: number;
  radian?: number;
  color?: number;
  highlightColor?: number;
  opacity?: number;
};

// No rotate Plane
class BaseRoad extends THREE.Mesh {
  constructor({ width, length, color, opacity }: BaseRoadSettings) {
    const geometryBaseRoad = new THREE.PlaneGeometry(width, length);
    const materialBaseRoad = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
    });
    super(geometryBaseRoad, materialBaseRoad);
  }
}

// Rotation
export class Road extends THREE.Group {
  constructor({
    width,
    length,
    radian = 0,
    color = 0x808080,
    opacity = 1,
  }: // highlightColor = 0xffffff,
  RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    const road = new BaseRoad({ width, length: length, color, opacity });

    this.add(road);
    this.rotation.x = -Math.PI / 2; // Don't Change
    this.rotation.z = radian;
  }
}

export class RoadWithCenterLine extends THREE.Group {
  constructor({
    width,
    length,
    radian = 0,
    color = 0x808080,
    highlightColor = 0xffffff,
    opacity = 1,
  }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    const geometryMainRoad = new THREE.PlaneGeometry(width, length);
    const materialMainRoad = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
    });
    const road = new THREE.Mesh(geometryMainRoad, materialMainRoad);

    const geometryCenterLine = new THREE.PlaneGeometry(width / 8, length);
    const materialCenterLine = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });

    const centerline = new THREE.Mesh(geometryCenterLine, materialCenterLine);
    centerline.position.set(0, 0, 0.1);

    this.add(road, centerline);
    this.rotation.x = -Math.PI / 2; // Don't Change
    this.rotation.z = radian;
  }
}

export class RoadWithDashedCenterLine extends THREE.Group {
  constructor({
    width,
    length,
    radian = 0,
    color = 0x808080,
    highlightColor = 0xffffff,
    opacity = 1,
  }: RoadSettings) {
    super();
    console.assert(
      -Math.PI * 2 < radian && radian < Math.PI * 2,
      "Use radian!"
    );

    const dashLength = 10;

    const road = new BaseRoad({ width, length, color, opacity });

    const geometryCenterLine = new THREE.PlaneGeometry(width / 8, dashLength);
    const materialCenterLine = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });

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
    dashGroup.position.set(0, -length / 2, 0.1);
    // dashGroup.position.set(0, 0, 0);

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
  width: number,
  lineType: "NoLine" | "CenterLine" | "DashedCenterLine"
) {
  const length = Math.sqrt((end.x - start.x) ** 2 + (end.z - start.z) ** 2);
  const rad = Math.atan2(end.x - start.x, end.z - start.z);

  let road: THREE.Group;

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
