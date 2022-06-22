import * as THREE from "three";

import React, { useState, useEffect, useRef } from "react";

// const { myAPI } = window;

export const Town = () => {
  const createBox = () => {
    const width = 1000;
    const height = 1000;
    const renderer: any = new THREE.WebGLRenderer({
      canvas: document.querySelector("#myCanvas") as HTMLCanvasElement,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera(85, width / height, 0.1, 10000);
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      10000
    );

    const axes = new THREE.AxesHelper(1000);
    scene.add(axes);

    camera.position.set(200, 800, -1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const light = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(light);
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
    shadowLight.position.set(200, 300, 200);
    scene.add(shadowLight);

    const b1 = new BuildingWithStripes({
      width: 100,
      height: 210,
      depth: 100,
      stripeNum: 10,
    });
    b1.position.set(-200, 90, 250);
    const b2 = new BuildingWithStripes({ width: 100, height: 180, depth: 100 });
    b2.position.set(-200, 90, 50);
    const b3 = new BuildingWithStripes({ width: 100, height: 105, depth: 100 });
    b3.position.set(100, 90, 50);
    const b4 = new BuildingWithStripes({ width: 100, height: 180, depth: 100 });
    b4.position.set(100, 90, 250);
    scene.add(b1, b2, b3, b4);

    const r1 = new Road({ width: 100, length: 1000, radian: Math.PI / 2 });
    r1.position.set(-80, 0, 300);
    scene.add(r1);

    tick();
    function tick() {
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    createBox();
  }, []);
  return <canvas id="myCanvas" />;
};

type BuildingWithStripesSettings = {
  width: number;
  height: number;
  depth: number;
  stripeNum?: number;
  bodyColor?: number;
  highlightColor?: number;
};

class BuildingWithStripes extends THREE.Group {
  constructor({
    width,
    height,
    depth,
    stripeNum = 6,
    bodyColor = 0x8a2be2,
    highlightColor = 0xdda0dd,
  }: BuildingWithStripesSettings) {
    super();
    const material_body = new THREE.MeshLambertMaterial({ color: bodyColor });
    const geometry_body = new THREE.BoxGeometry(width, height, depth);
    const body = new THREE.Mesh(geometry_body, material_body);
    body.position.set(0, height / 2, 0);

    const material_floor = new THREE.MeshLambertMaterial({
      color: highlightColor,
    });
    const geometry_floor = new THREE.BoxGeometry(
      width * 1.025,
      height * 0.025,
      depth * 1.025
    );

    // const stripeNum = 0;
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
      ((width + depth) * 0.1) / 2,
      ((width + depth) * 0.1) / 2,
      height * 0.025,
      90
    );
    const roof_circle = new THREE.Mesh(
      geometry_roof_circle,
      material_roof_circle
    );
    roof_circle.position.set(20, height, 0);
    this.add(body, ...stripes, roof_circle);
  }
}

type RoadSettings = {
  width: number;
  length: number;
  radian?: number;
};

class Road extends THREE.Group {
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
