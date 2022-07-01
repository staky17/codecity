import * as THREE from "three";

export type SignBoardType = {
  filename: string;
  signBoardColor: string;
  width: number;
  height: number;
  depth: number;
  XPosition: number;
  YPosition: number;
  ZPosition: number;
};

// Under Construction
export class SignBoard extends THREE.Group {
  constructor({
    filename,
    signBoardColor = "#ffffff",
    width,
    height,
    depth,
    XPosition,
    YPosition,
    ZPosition,
  }: SignBoardType) {
    super();

    // 背景のGeometry
    const geometry_background = new THREE.BoxGeometry(width, height, depth);

    // canvasの縦横(小さすぎるとぼやける)
    const canvasWidth = 500;
    const canvasHeight = 50;

    const canvasForTexture = createCanvasForTexture(
      canvasWidth,
      canvasHeight,
      filename,
      signBoardColor,
      40
    );
    if (canvasForTexture !== undefined) {
      const canvasTexture = new THREE.CanvasTexture(canvasForTexture);
      this.createSignBoard(geometry_background, canvasTexture, {
        x: XPosition,
        y: YPosition,
        z: ZPosition,
      });
    }
  }

  // boxGeometryのメッシュを作成
  private createSignBoard = (
    geometry_background: THREE.BoxGeometry,
    texture: THREE.CanvasTexture,
    position: { x: number; y: number; z: number }
  ) => {
    const material = [
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial({ map: texture }),
    ];

    const signBoardMesh = new THREE.Mesh(geometry_background, material);
    signBoardMesh.position.set(position.x, position.y, position.z);
    this.add(signBoardMesh);
  };
}

const createCanvasForTexture = (
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  signBoardColor: string,
  fontSize: number
) => {
  // 貼り付けるcanvasを作成。
  const canvasForText = document.createElement("canvas");
  const ctx = canvasForText.getContext("2d");
  if (ctx === null) {
    return;
  }

  ctx.canvas.width = canvasWidth;
  ctx.canvas.height = canvasHeight;
  // 看板の背景の設定
  ctx.fillStyle = signBoardColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // 看板テキストの設定
  ctx.fillStyle = "black";
  ctx.font = `${fontSize}px serif`;
  ctx.fillText(
    text,
    // x方向の余白/2をx方向開始時の始点とすることで、横方向の中央揃えをしている。
    (canvasWidth - ctx.measureText(text).width) / 2,
    // y方向のcanvasの中央に文字の高さの半分を加えることで、縦方向の中央揃えをしている。
    canvasHeight / 2 + ctx.measureText(text).actualBoundingBoxAscent / 2
  );
  return canvasForText;
};
