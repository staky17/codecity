import React, { useEffect, useState, useRef } from "react";
import { MapGenerator, District, Building } from "./mapGenerator";

// 親からmapGeneratorを受け取るための型定義
interface Props {
  mapGenerator: MapGenerator;
}

const viewPath = (
  context: CanvasRenderingContext2D,
  vertices: Array<Vertex2d>
) => {
  // 建物を二次元マップに描写する
  context.beginPath();
  let lastVertex = vertices[vertices.length - 1];
  context.moveTo(lastVertex.x * 20 + 250, lastVertex.z * 20 + 250);
  for (let vertex of vertices) {
    context.lineTo(vertex.x * 20 + 250, vertex.z * 20 + 250);
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

    // 地区と建物を順に見ていく
    // nodesには，見るべき地区と建物が追加されていきます．キューになっている．
    let nodes: Array<District | Building> = [props.mapGenerator.rootDistrict];
    // nodeは，現在見ている地区または建物
    let node: District | Building;

    while (nodes.length > 0) {
      node = nodes.shift()!;
      if (node instanceof District) {
        // 地区ならば
        let district: District = node;

        // 地区を二次元マップに描写する
        context.fillStyle = "red";
        viewPath(context, district.vertices);
        context.stroke();

        // 地区なら子供がいるはずなので，その子供をnodesに追加．
        nodes = nodes.concat(
          Object.keys(district.children).map((key) => district.children[key])
        );
      } else {
        // 建物ならば
        let building: Building = node;
        // 建物を二次元マップに描写する
        context.fillStyle = "blue";
        viewPath(context, building.vertices);
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
