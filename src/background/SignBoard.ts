// import * as THREE from "three";
// import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
// import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// Under Construction
// export class SignBoard extends THREE.Group {
//   constructor(filename: string) {
//     super();

//     const font = fontload();

//     // テキストメッシュ
//     const textMesh = new THREE.Mesh(
//       new TextGeometry(`TextGeometry Scene`, {
//         font: font, // フォントを指定 (FontLoaderで読み込んだjson形式のフォント)
//         size: 10, // 文字のサイズを指定
//         height: 1, // 文字の厚さを指定
//       }),
//       new THREE.MeshBasicMaterial({
//         color: `#ccc`, // 文字の色
//       })
//     );
//     textMesh.position.set(-0.75, 0, 0); // Meshの位置を設定
//     textMesh.scale.set(0.01, 0.01, 0.01);
//   }
// }

// async function fontload() {
//   const fontLoader = new FontLoader();
//   const font = await fontLoader.load(
//     `/fonts/droid_sans_mono_regular.typeface.json`
//   );
//   return font;
// }
