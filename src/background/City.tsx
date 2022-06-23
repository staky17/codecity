import * as THREE from "three";

import React, { useState, useEffect, useRef } from "react";

import { BuildingWithStripes } from "./BuildingWithStripes";
import {
  Road,
  createRoadFromStartToEnd,
  RoadWithDashedCenterline,
} from "./Road";

export const City = () => {
  const createBox = () => {
    const width = 2000;
    const height = 2000;
    const renderer: any = new THREE.WebGLRenderer({
      canvas: document.querySelector("#cityCanvas") as HTMLCanvasElement,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
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

    const crosscities = [];
    for (let i = 0; i < 1; i++) {
      for (let j = 0; j < 1; j++) {
        const crosscity = crossCity();
        crosscity.position.set(360 * i, 0, 360 * j);
        crosscities.push(crosscity);
      }
    }
    scene.add(...crosscities);

    tick();
    function tick() {
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
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

  const roadx = new RoadWithDashedCenterline({
    width: 90,
    length: 360,
    radian: Math.PI / 2,
  });
  roadx.position.set(180, 0, 150);
  const roadz = new Road({ width: 100, length: 360 });
  roadz.position.set(175, 1, 180);

  const crosscity = new THREE.Group();
  // crosscity.add(b1, b2, b3, b4, roadx, roadz);
  crosscity.add(roadx, roadz);
  return crosscity;
}
