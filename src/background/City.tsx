import * as THREE from "three";

import React, { useState, useEffect, useRef } from "react";

import { BuildingWithStripes } from "./BuildingWithStripes";
import {
  Road,
  createRoadFromStartToEnd,
  RoadWithDashedCenterLine,
} from "./Road";

export const City = () => {
  const createBox = () => {
    const WindowWidth = 2000;
    const WindowHeight = 2000;
    const renderer: any = new THREE.WebGLRenderer({
      canvas: document.querySelector("#cityCanvas") as HTMLCanvasElement,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WindowWidth, WindowHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      WindowWidth / WindowHeight,
      100,
      10000
    );

    // const camera = new THREE.OrthographicCamera(
    //   -width / 2,
    //   width / 2,
    //   height / 2,
    //   -height / 2,
    //   0.1,
    //   10000
    // );

    const axes = new THREE.AxesHelper(1000);
    scene.add(axes);

    camera.position.set(-400, 1000, -800);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const light = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(light);
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
    shadowLight.position.set(-200, 300, 100);
    scene.add(shadowLight);

    //

    // const crosscities = bigCity(4, 4);
    // scene.add(...crosscities);

    const road2 = createRoadFromStartToEnd(
      { x: 0, z: 0 },
      { x: 250, z: 200 },
      30,
      "NoLine"
    );
    scene.add(road2);

    const road3 = createRoadFromStartToEnd(
      { x: 30, z: 800 },
      { x: 20, z: 0 },
      50,
      "CenterLine"
    );
    scene.add(road3);

    const road = createRoadFromStartToEnd(
      { x: -200, z: 500 },
      { x: 300, z: 100 },
      80,
      "DashedCenterLine"
    );
    scene.add(road);

    function tick() {
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  };

  useEffect(() => {
    createBox();
  }, []);
  return <canvas id="cityCanvas" />;
};

function crossCity() {
  const b1 = new BuildingWithStripes({
    width: 100,
    height: 210,
    depth: 100,
    stripeNum: 10,
  });
  const b2 = new BuildingWithStripes({ width: 100, height: 180, depth: 100 });
  const b3 = new BuildingWithStripes({ width: 100, height: 105, depth: 100 });
  const b4 = new BuildingWithStripes({ width: 100, height: 180, depth: 100 });
  b1.position.set(50, 0, 250);
  b2.position.set(50, 0, 50);
  b3.position.set(300, 0, 50);
  b4.position.set(300, 0, 250);

  const roadx = new RoadWithDashedCenterLine({
    width: 90,
    length: 360,
    radian: Math.PI / 2,
  });
  roadx.position.set(180, 0, 150);
  const roadz = new RoadWithDashedCenterLine({ width: 100, length: 360 });
  roadz.position.set(175, 1, 180);

  const crosscity = new THREE.Group();
  crosscity.add(b1, b2, b3, b4, roadx, roadz);
  crosscity.add(roadx, roadz);
  return crosscity;
}

function bigCity(yoko: number, tate: number) {
  const crosscities = [];
  for (let i = 0; i < yoko; i++) {
    for (let j = 0; j < tate; j++) {
      const crosscity = crossCity();
      crosscity.position.set(360 * i, 0, 360 * j);
      crosscities.push(crosscity);
    }
  }
  return crosscities;
}
