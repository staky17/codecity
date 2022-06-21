import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

export const App = () => {
  const createBox = () => {
    const width = 500;
    const height = 500;
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#myCanvas") as HTMLCanvasElement,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(500, 500, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const material = new THREE.MeshNormalMaterial();

    const buildings = [];
    for (let i = -5; i < 5; i++) {
      for (let k = -5; k < 5; k++) {
        const height = Math.random() * 100;
        const geometry = new THREE.BoxGeometry(10, height, 10);
        const building = new THREE.Mesh(geometry, material);

        building.position.set(10 * i, height / 2, 10 * k);
        buildings.push(building);
      }
    }

    const materialGroup = new THREE.Group();
    materialGroup.add(...buildings);

    scene.add(materialGroup);

    tick();
    function tick() {
      // materialGroup.rotation.y += 0.01;
      // materialGroup.rotation.x -= 0.01;
      // materialGroup.rotation.z -= 0.01;

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    createBox();
  }, []);
  return (
    <>
      <canvas id="myCanvas" />
    </>
  );
};
