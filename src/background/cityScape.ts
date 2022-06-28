import * as THREE from "three";
import { BuildingWithStripes, BuildingWithWindows } from "./Building";
import { RoadWithCenterLine, RoadWithDashedCenterLine } from "./Road";

export function crossCity() {
  const b1 = new BuildingWithStripes({
    width: 100,
    height: 210,
    depth: 100,
    stripeNum: 10,
  });
  const b2 = new BuildingWithWindows({ width: 100, height: 180, depth: 100 });
  const b3 = new BuildingWithStripes({ width: 100, height: 105, depth: 100 });
  const b4 = new BuildingWithWindows({ width: 100, height: 180, depth: 100 });
  b1.position.set(50, 0, 250);
  b2.position.set(50, 0, 50);
  b3.position.set(300, 0, 50);
  b4.position.set(300, 0, 250);

  const roadx = new RoadWithDashedCenterLine({
    width: 90,
    length: 360,
    radian: Math.PI / 2,
    color: 0x696969,
  });
  roadx.position.set(180, 0, 150);
  const roadz = new RoadWithCenterLine({
    width: 100,
    length: 360,
    color: 0x696969,
  });
  roadz.position.set(175, 1, 180);

  const crosscity = new THREE.Group();
  crosscity.add(b1, b2, b3, b4, roadx, roadz);
  return crosscity;
}

export function bigCity(yoko: number, tate: number) {
  const crosscities = new THREE.Group();
  for (let i = 0; i < yoko; i++) {
    for (let j = 0; j < tate; j++) {
      const crosscity = crossCity();
      crosscity.position.set(360 * i, 0, 360 * j);
      crosscities.add(crosscity);
    }
  }
  return crosscities;
}
