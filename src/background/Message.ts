import * as THREE from "three";

export const createMessage = (message: Message, timer: number) => {
  // キャンバスのサイズを定義．
  const canvasWidth = 600;
  const canvasHeight = 200;

  let sentences = message.text.split("\n");

  // マテリアル用の仮想DOMを作成
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d")!;

  context.beginPath();
  context.moveTo(canvasHeight * 0.25, 0);
  context.arcTo(0, 0, 0, canvasHeight * 0.25, canvasHeight * 0.25);
  context.lineTo(0, canvasHeight * 0.5);
  context.arcTo(
    0,
    canvasHeight * 0.75,
    canvasHeight * 0.25,
    canvasHeight * 0.75,
    canvasHeight * 0.25
  );

  context.lineTo(canvasWidth * 0.5 - canvasHeight * 0.125, canvasHeight * 0.75);
  context.lineTo(canvasWidth * 0.5, canvasHeight);
  context.lineTo(canvasWidth * 0.5 + canvasHeight * 0.125, canvasHeight * 0.75);

  context.arcTo(
    canvasWidth,
    canvasHeight * 0.75,
    canvasWidth,
    canvasHeight * 0.5,
    canvasHeight * 0.25
  );
  context.arcTo(
    canvasWidth,
    0,
    canvasWidth - canvasHeight * 0.25,
    0,
    canvasHeight * 0.25
  );
  context.lineTo(canvasHeight * 0.25, 0);
  context.closePath();
  context.fillStyle = "#ffffffe0";
  context.fill();

  let fontSize: number = 0;
  for (fontSize = canvasWidth / 20; fontSize >= 0; fontSize--) {
    context.font = fontSize + "px sans serif";
    let maxWidth = Math.max(
      ...sentences.map((sentence) => context.measureText(sentence).width)
    );
    if (maxWidth < canvasWidth - canvasHeight * 0.125) break;
  }

  context.fillStyle = "#4f4f4f";
  for (let i = 0; i < sentences.length; i++) {
    context.fillText(
      sentences[i],
      canvasWidth / 2 - context.measureText(sentences[i]).width / 2,
      (canvasHeight * 0.75 - fontSize * sentences.length) / 2 +
        fontSize * (i + 0.85)
    );
  }
  const spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas),
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
};
