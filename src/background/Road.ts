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
