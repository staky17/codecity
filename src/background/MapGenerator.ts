// Mapに描写されるものはMapObjectです．
// 建物や地区の基底クラスです．
// 建物と地区に共通する部分を書く．
class MapObject {
  public name: string; // 名前
  public vertices: Array<Vertex2d>; // 頂点の配列を持ちます（反時計回りor時計回りに頂点を並べたもの）
  public force: Vertex2d; // そのMapObjectが現在受けている力ベクトル

  constructor(name: string, vertices: Array<Vertex2d>) {
    this.name = name;
    this.vertices = vertices;
    this.force = { x: 0, z: 0 };
  }

  area(): number {
    // ポリゴンの面積を導出
    let outer = 0;
    for (let i = 0; i < this.vertices.length - 1; i++) {
      outer +=
        this.vertices[i].x * this.vertices[i + 1].z -
        this.vertices[i + 1].x * this.vertices[i].z;
    }
    return Math.abs(outer) / 2;
  }

  barycenter(): Vertex2d {
    // 重心を導出
    let x = 0;
    let z = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      x += this.vertices[i].x / this.vertices.length;
      z += this.vertices[i].z / this.vertices.length;
    }
    return { x: x, z: z };
  }

  // 衝突しているか？
  // isOverlaped(other: District | Building): boolean {
  //
  // }

  // 反発するのか？
}

// 地区クラス
export class District extends MapObject {
  public children: { [name: string]: District | Building } = {}; // 辞書オブジェクト{ "名前": District | Building }
  constructor(name: string, x: number, z: number) {
    const vertices: Array<Vertex2d> = [
      // 3つ頂点を持つ大きさ0のセグメント
      { x: x, z: z },
      { x: x, z: z },
      { x: x, z: z },
    ];
    super(name, vertices);
  }

  // children
}

// 建物クラス
export class Building extends MapObject {
  public height: number;
  constructor(name: string, vertices: Array<Vertex2d>, height: number) {
    super(name, vertices);
    this.height = height;
  }
}

// MapGenerator
export class MapGenerator {
  public rootPath?: string;
  public rootDistrict?: District;

  // フォルダを選択した時にそのフォルダのパスを保存
  //  rootDistrictがマップのデータ
  initialize(path: string): void {
    this.rootPath = path;
    let pathList = path.split("/");
    this.rootDistrict = new District(pathList[pathList.length - 1], 0, 0);
  }

  // 建物を追加する
  addBuilding(fileInfo: FileInfo): void {
    // フォルダが選択されいない時は何もしない（そんなケースは存在しないはず）
    if (
      typeof this.rootPath === "undefined" ||
      typeof this.rootDistrict === "undefined"
    )
      return;

    // ルートディレクトリからのパスの配列 relativePath（最後の要素はファイル名）
    // /a/b/c/d -> ["a", "b", "c", "d"]
    // / -> []
    let relativePath = fileInfo.path
      .substring(this.rootPath.length)
      .split("/")
      .splice(1);

    let districtName;
    let currentDistrict = this.rootDistrict;
    for (let d = 0; d < relativePath.length - 1; d++) {
      districtName = relativePath[d];
      if (typeof currentDistrict.children[districtName] === "undefined")
        currentDistrict.children[districtName] = new District(
          districtName,
          Math.random() - 0.5,
          Math.random() - 0.5
        );
      currentDistrict = currentDistrict.children[districtName] as District;
    }

    let buildingName = relativePath[relativePath.length - 1];
    let x = Math.random() - 0.5;
    let z = Math.random() - 0.5;
    currentDistrict.children[buildingName] = new Building(
      buildingName,
      [
        { x: x - 0.5, z: z - 0.5 },
        { x: x - 0.5, z: z + 0.5 },
        { x: x + 0.5, z: z + 0.5 },
        { x: x + 0.5, z: z - 0.5 },
      ],
      1
    );
  }
}
