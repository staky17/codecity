import React, { useEffect, useState, useRef } from "react";
import { Vector2d, MapGenerator, District, Building } from "./mapGenerator";

// 親からmapGeneratorを受け取るための型定義
interface Props {
  mapGenerator: MapGenerator;
}

// 頂点集合からパスを生成する
const viewPath = (
  context: CanvasRenderingContext2D,
  vertices: Array<Vector2d>
) => {
  context.beginPath();
  let lastVertex = vertices[vertices.length - 1];
  context.moveTo(lastVertex.x * 30 + 250, lastVertex.z * 30 + 250);
  for (let vertex of vertices) {
    context.lineTo(vertex.x * 30 + 250, vertex.z * 30 + 250);
  }
  context.closePath();
};

export default (props: Props) => {
  // Canvasに描画するので，contextをstateで管理
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  // canvasのDOMを参照するためのRef
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // render関数は呼ばれるたびにマップを描写
  const render = function (): void {
    // mapGeneratorはフォルダが指定されていないと，rootDistrictがundefinedである．その場合はなにもしない．
    if (
      typeof props.mapGenerator.rootDistrict === "undefined" ||
      context === null
    )
      return;

    // 描画する前にcanvasを綺麗にする
    if (canvasRef.current !== null)
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

    // 地区と建物を順に見ていく
    // nodesには，見るべき地区と建物が追加されていきます．キューになっている．
    let nodes: Array<District | Building> = [props.mapGenerator.rootDistrict];
    let absPositions: Array<Vector2d> = [new Vector2d(0, 0)]; // 親地区の絶対座標が格納されている
    // nodeは，現在見ている地区または建物
    let node: District | Building;
    let absPosition: Vector2d;

    // フォントを表示するための準備(three.jsならいらない)
    context.font = "12px serif";

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
        context.strokeStyle = "#ff000080";
        viewPath(context, absVertices);
        context.stroke();

        // フォルダ名を表示させます．
        let textWidth = context.measureText(district.name).width;
        context.fillStyle = "#ff0000c0";
        context.fillText(
          district.name,
          district.base.add(absPosition).x * 30 + 250 - textWidth / 2,
          district.base.add(absPosition).z * 30 + 250
        );

        // console.log("district", district);
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
        context.fillStyle = "#0000cd4f";
        viewPath(context, absVertices);
        context.fill();

        // ファイル名を表示させます．
        let textWidth = context.measureText(building.name).width;
        context.fillStyle = "#0000ffc0";
        context.fillText(
          building.name,
          building.base.add(absPosition).x * 30 + 250 - textWidth / 2,
          building.base.add(absPosition).z * 30 + 250
        );

        // *** ここまで建物に対する描画処理 ***
      }
    }
  };
  // 1000msに一回呼び出す．
  setInterval(render, 1000);
  // render();

  // contextを取得する
  useEffect(() => {
    let context = canvasRef.current?.getContext("2d") || null;
    setContext(context);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 500 + "px",
        height: 500 + "px",
        background: "#ffffff",
      }}
    ></canvas>
  );
};
