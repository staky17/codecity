import * as THREE from "three";

import React, { useEffect, useState, useRef } from "react";
import { Vector2d, MapGenerator, District, Building } from "./mapGenerator";

// 親からmapGeneratorを受け取るための型定義
interface Props {
  mapGenerator: MapGenerator;
}

// カラーを定義
const colors: { [name: string]: [string, string] } = {
  night_fade: ["#a18cd1", "#fbc2eb"],
  rainy_ashville: ["#fbc2eb", "#a6c1ee"],
  amy_crisp: ["#a6c0fe", "#f68084"],
};
const colorNames = Object.keys(colors);

export default (props: Props) => {
  // canvasタグを参照する
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Timerを設置(このcanvasがある限りレンダリングし続ける)
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    (async () => {
      // mapRendererを定義．基本的に全ての描写をこれが担当する
      const mapRenderer = new MapRenderer(
        canvasRef.current!,
        props.mapGenerator
      );
      // 1秒に1回レンダリングするタイマーを設定
      mapRenderer.render();
      setTimer(window.setInterval(mapRenderer.render.bind(mapRenderer), 1000));
    })();
    // canvasが消えたらタイマーを止める．
    return () => clearInterval(timer);
  }, []);

  // innerWidthとinnerHeightを定義することで，画面いっぱいにタグを広げる
  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
    ></canvas>
  );
};

// マテリアルをcanvasを使って作成(textureImages使ってないです！)
function createMaterial(colorName: string, width: number, height: number) {
  // キャンバスのサイズを定義．
  const canvasWight = width;
  const canvasHeight = height * 8;

  // マテリアル用の仮想DOMを作成
  const canvas = document.createElement("canvas");
  canvas.width = canvasWight;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d")!;

  // グラデーションで塗る．
  const color = context.createLinearGradient(0, 0, 0, canvasHeight);
  color.addColorStop(0.0, colors[colorName][0]);
  color.addColorStop(1.0, colors[colorName][1]);
  context.fillStyle = color;
  context.fillRect(0, 0, canvasWight, canvasHeight);

  // 横線を入れる．
  context.fillStyle = colors[colorName][1] + "80";
  for (let i = 0; i < Math.floor(canvasHeight) / 8; i++) {
    context.fillRect(0, canvasHeight - (i * 8 - 4), canvasWight, 2);
  }

  // 建物の横はcanvasから作成したテクスチャを貼る
  const m1 = new THREE.MeshLambertMaterial({
    map: new THREE.CanvasTexture(canvas),
  });
  // 建物の上側は一色にする
  const m2 = new THREE.MeshLambertMaterial({
    color: colors[colorName][0],
  });

  // boxは6面なので，マテリアルの6個の配列を渡す（Three.jsはマテリアルの配列をマテリアルとして処理できる）
  return [m1, m1, m2, m1, m1, m1];
}

class MapRenderer {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public mapGenerator: MapGenerator;
  public viewObjects: { [name: string]: THREE.Mesh<any, any> };

  constructor(canvas: HTMLCanvasElement, mapGenerator: MapGenerator) {
    // レンダラーを作成
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // シーンを作成
    this.scene = new THREE.Scene();
    // this.scene.add(new THREE.AxesHelper(10));
    // 環境光
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    // 点光源
    const pointLight = new THREE.PointLight(0xffffff, 0.1, 0);
    pointLight.position.set(40, 1, 40);
    this.scene.add(pointLight);
    // 平行光源を2つ定義
    const directionalLightFromTop = new THREE.DirectionalLight(0xffffff, 0.2);
    this.scene.add(directionalLightFromTop);
    const directionalLightFromLeft = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLightFromLeft.position.set(-1, 0, 0);
    this.scene.add(directionalLightFromLeft);

    // カメラを作成
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.set(-30, 60, -30);
    this.camera.lookAt(10, 0, 10);

    // マップジェネレータを登録(this.renderがmapGeneratorを見て街を描写する)
    this.mapGenerator = mapGenerator;

    // すでに追加されているMeshをここに（新しくMeshを追加すると処理が重くなるので，すでに追加されたMeshは使いまわして処理を軽くする）
    this.viewObjects = {};
  }
  // マップを表示する
  // MapGeneratorを参照していない
  render(): void {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let box = this.viewObjects[`box${i}_${j}`];
        if (typeof box === "undefined") {
          // なければMeshを作る．
          const height = 6 + Math.random() * 10;

          const geometry = new THREE.BoxGeometry(4, height, 4);

          box = new THREE.Mesh(
            geometry,
            createMaterial(
              colorNames[Math.floor(Math.random() * colorNames.length)],
              4,
              height
            )
          );
          box.position.set(i * 8, height / 2, j * 8);

          // 作ったらオブジェクト管理用の辞書とシーンに追加する
          this.viewObjects[`box${i}_${j}`] = box;
          this.scene.add(box);
        }
      }
    }
    // オブジェクトを更新し終えたら表示
    this.renderer.render(this.scene, this.camera);
  }
}
