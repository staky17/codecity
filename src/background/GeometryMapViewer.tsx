import React, { useEffect, useState, useRef } from "react";
import { MapGenerator, District, Building } from "./mapGenerator";

// 親からmapGeneratorを受け取るための型定義
interface Props {
  mapGenerator: MapGenerator;
}

// 頂点集合からパスを生成する
const viewPath = (
  context: CanvasRenderingContext2D,
  vertices: Array<Vertex2d>
) => {
  context.beginPath();
  let lastVertex = vertices[vertices.length - 1];
  context.moveTo(lastVertex.x * 50 + 250, lastVertex.z * 50 + 250);
  for (let vertex of vertices) {
    context.lineTo(vertex.x * 50 + 250, vertex.z * 50 + 250);
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

    if (canvasRef.current !== null)
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

    console.log(props.mapGenerator.rootDistrict);

    // 地区と建物を順に見ていく
    // nodesには，見るべき地区と建物が追加されていきます．キューになっている．
    let nodes: Array<District | Building> = [props.mapGenerator.rootDistrict];
    let absPositions: Array<Vertex2d> = [{ x: 0, z: 0 }]; // 親地区の絶対座標が格納されている
    // nodeは，現在見ている地区または建物
    let node: District | Building;
    let absPosition: Vertex2d;

    while (nodes.length > 0) {
      node = nodes.shift()!;
      absPosition = absPositions.shift()!; // 親の絶対座標が獲得できる

      // 親に対しての相対位置なのを，絶対座標に置き換える．
      let absVertices = node.vertices.map((vertex) => {
        return {
          x: vertex.x + absPosition.x,
          z: vertex.z + absPosition.z,
        } as Vertex2d;
      });

      if (node instanceof District) {
        // 地区ならば
        let district: District = node;

        // 地区を二次元マップに描写する
        context.strokeStyle = "#ff000080";
        viewPath(context, absVertices);
        context.stroke();

        // 地区なら子供がいるはずなので，その子供をnodesに追加．
        nodes = nodes.concat(
          Object.keys(district.children).map((key) => district.children[key])
        );

        absPositions = absPositions.concat(
          Object.keys(district.children).map((_) => {
            let relPosition = district.barycenter();
            return {
              x: relPosition.x + absPosition.x,
              z: relPosition.z + absPosition.z,
            };
          })
        );
      } else {
        // 建物ならば
        let building: Building = node;
        // 建物を二次元マップに描写する
        context.fillStyle = "#0000cd80";
        viewPath(context, absVertices);
        context.fill();
      }
    }
  };
  // 1000msに一回呼び出す．
  setInterval(render, 1000);

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
        width: 500,
        height: 500,
        background: "#ffffff",
      }}
    ></canvas>
  );
};
