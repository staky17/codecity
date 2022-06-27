import * as THREE from "three";

// Under Construction
export class SignBoard extends THREE.Group {
  constructor({
    filename,
    width,
    height,
    depth,
  }: {
    filename: string;
    width: number;
    height: number;
    depth: number;
  }) {
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
      40
    );
    if (canvasForTexture !== undefined) {
      const canvasTexture = new THREE.CanvasTexture(canvasForTexture);
      const scaleMaster = 20;
      this.createSignBoard(
        geometry_background,
        canvasTexture,
        {
          x: scaleMaster,
          y: scaleMaster * (canvasHeight / canvasWidth),
          z: 3,
        },
        { x: 50, y: 400, z: 100 }
      );
    }
  }

  // boxGeometryのメッシュを作成
  private createSignBoard = (
    geometry_background: THREE.BoxGeometry,
    texture: THREE.CanvasTexture,
    scale: { x: number; y: number; z: number },
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
    signBoardMesh.scale.set(scale.x, scale.y, scale.z);
    signBoardMesh.position.set(position.x, position.y, position.z);
    this.add(signBoardMesh);
  };
}

const createCanvasForTexture = (
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  fontSize: number
) => {
  // 貼り付けるcanvasを作成。
  const canvasForText = document.createElement("canvas");
  const ctx = canvasForText.getContext("2d");
  if (ctx === null) {
    return;
  }

  const width =
    canvasWidth > ctx.measureText(text).width
      ? canvasWidth
      : ctx.measureText(text).width;
  // console.log(width);
  ctx.canvas.width = width;
  ctx.canvas.height = canvasHeight;
  // 白背景を描く
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "black";
  ctx.font = `${fontSize}px serif`;
  ctx.fillText(
    text,
    // x方向の余白/2をx方向開始時の始点とすることで、横方向の中央揃えをしている。
    (width - ctx.measureText(text).width) / 2,
    // y方向のcanvasの中央に文字の高さの半分を加えることで、縦方向の中央揃えをしている。
    canvasHeight / 2 + ctx.measureText(text).actualBoundingBoxAscent / 2
  );
  return canvasForText;
};
