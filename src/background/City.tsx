import * as THREE from "three";

import React, { useState, useEffect, useRef } from "react";

import {
  BuildingWithStripes,
  BaseBuilding,
  BuildingWithWindows,
} from "./Building";
import {
  Road,
  createRoadFromStartToEnd,
  RoadWithDashedCenterLine,
} from "./Road";

export const City = () => {
  const createBox = () => {
    const WindowWidth = 1500;
    const WindowHeight = 1500;
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
    camera.position.set(-800, 600, -1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const light = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(light);
    // const shadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // shadowLight.position.set(-200, 300, 100);
    // scene.add(shadowLight);
    const shadowLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    shadowLight2.position.set(200, 300, 100);
    scene.add(shadowLight2);

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
