import * as THREE from "three";

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
  floorNum?: number;
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

// export class BuildingWithWindows extends THREE.Group {
//   constructor({
//     width,
//     height,
//     depth,
//     floorNum = 6,
//     bodyColor = 0x8a2be2,
//     highlightColor = 0xdda0dd,
//   }: BuildingWithWindowsSettings) {
//     super();
//     const body = new BaseBuilding({ width, height, depth, bodyColor });

//     const windowWidth = 10;
//     // const windowHeight =

//     const material_window = new THREE.MeshLambertMaterial({
//       color: highlightColor,
//     });
//     const geometry_window = new THREE.PlaneGeometry(windowWidth, length);
//     const window = new THREE.Mesh(geometry_window, material_window);
//   }
// }
