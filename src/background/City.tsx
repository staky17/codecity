import * as THREE from "three";

import React, { useState, useEffect, useRef } from "react";
import { Vector2d, MapGenerator, District, Building } from "./mapGenerator";

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

export const City = ({ mapGenerator }: { mapGenerator: MapGenerator }) => {
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
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
    shadowLight.position.set(-200, 300, 100);
    scene.add(shadowLight);
    const shadowLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    shadowLight2.position.set(200, 300, 100);
    scene.add(shadowLight2);

    /////////////////////// From here
    // mapGeneratorはフォルダが指定されていないと，rootDistrictがundefinedである．その場合はなにもしない．
    if (typeof mapGenerator.rootDistrict === "undefined") return;

    let nodes: Array<District | Building> = [mapGenerator.rootDistrict];
    let absPositions: Array<Vector2d> = [new Vector2d(0, 0)]; // 親地区の絶対座標が格納されている
    // nodeは，現在見ている地区または建物
    let node: District | Building;
    let absPosition: Vector2d;

    while (nodes.length > 0) {
      node = nodes.shift()!; // ノード(建物または地区)を一つ取り出す
      absPosition = absPositions.shift()!; // 親の絶対座標が獲得できる

      // 親に対しての相対位置なのを，絶対座標に置き換える．addなのはVector2dクラスを自前で作っているから．
      // javascriptにはoverride機能がないので，メソッドとしてベクトル演算できるようにしてある．
      let absVertices = node.vertices.map((vertex) => {
        return vertex.add(node.base).add(absPosition); // vertex + node.base + absPosition
      });

      if (node instanceof District) {
        // 地区ならば
        let district: District = node;

        // *** 3Dで表示する場合はここから地区に対する描画処理を書く ***
        // 地区を二次元マップに描写する(absVerticesが描画する絶対座標．[Vector2d(x, z), Vector2d(x, z), ...])という形で格納されている．
        // *** ここまで地区に対する描画処理 ***

        // 地区なら子供（地区または建物）がいるはずなので，その子供をnodesに追加．
        nodes = nodes.concat(
          Object.keys(district.children).map((key) => district.children[key])
        );
        // 相対座標を絶対座標に直すためにabsPositionを計算してabsPositionnsに追加．
        absPositions = absPositions.concat(
          Object.keys(district.children).map((_) => {
            return district.base.add(absPosition);
          })
        );
      } else {
        // 建物ならば
        let building: Building = node;
        // *** ここから建物に対する描画処理 ***
        // 建物を二次元マップに描写する

        // *** ここまで建物に対する描画処理 ***
      }
    }

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
