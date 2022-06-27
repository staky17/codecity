import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import fontJson from "three/examples/fonts/droid/droid_serif_regular.typeface.json";

// Under Construction
export class SignBoard extends THREE.Group {
  constructor(filename: string) {
    super();

    const font = new FontLoader().parse(fontJson);

    // テキストメッシュ
    const textMesh = new THREE.Mesh(
      new TextGeometry(filename, {
        font: font, // フォントを指定 (FontLoaderで読み込んだjson形式のフォント)
        size: 10, // 文字のサイズを指定
        height: 1, // 文字の厚さを指定
      }),
      new THREE.MeshBasicMaterial({
        color: `#ccc`, // 文字の色
      })
    );
    textMesh.position.set(500, 500, 100); // Meshの位置を設定
    textMesh.scale.set(-10, 10, 10);

    this.add(textMesh);
  }
}
