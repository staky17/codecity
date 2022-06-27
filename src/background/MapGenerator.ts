// 点vertex1に対して，vertex2とvertex3を結ぶ千文が時計回り(1)か半時計回り(-1)か同一直線(0)か判定する
function clockwise(
  vertex1: Vertex2d,
  vertex2: Vertex2d,
  vertex3: Vertex2d
): number {
  let dx2 = vertex2.x - vertex1.x;
  let dz2 = vertex2.z - vertex1.z;
  let dx3 = vertex3.x - vertex1.x;
  let dz3 = vertex3.z - vertex1.z;
  if (dx2 * dz3 < dx3 * dz2) return 1;
  else if (dx2 * dz3 > dx3 * dz2) return -1;
  return 0;
}

function isCrossingSegment(
  vertex1: Vertex2d,
  vertex2: Vertex2d,
  vertex3: Vertex2d,
  vertex4: Vertex2d
) {
  return (
    clockwise(vertex1, vertex3, vertex4) *
      clockwise(vertex2, vertex3, vertex4) <
      0 &&
    clockwise(vertex3, vertex1, vertex2) *
      clockwise(vertex4, vertex1, vertex2) <
      0
  );
}

// Mapに描写されるものはMapObjectです．
// 建物や地区の基底クラスです．
// 建物と地区に共通する部分を書く．
class MapObject {
  public name: string; // 名前
  public vertices: Array<Vertex2d>; // 現在の頂点の配列を持ちます（反時計回りor時計回りに頂点を並べたもの）
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
    throw new Error("Not Implemented Error!!");
  }

  crossingSegmentCount(vertex1: Vertex2d, vertex2: Vertex2d): number {
    let count = 0;
    for (let i = 0; i < this.vertices.length; i++)
      if (
        isCrossingSegment(
          vertex1,
          vertex2,
          this.vertices[i],
          this.vertices[(i + 1) % this.vertices.length]
        )
      )
        count++;
    return count;
  }

  containPoint(vertex: Vertex2d): boolean {
    const infinityPoint = { x: 10 ** 9, z: 10 ** 9 } as Vertex2d;
    return this.crossingSegmentCount(vertex, infinityPoint) % 2 === 1;
  }

  // 衝突しているか？
  isOverlaped(other: District | Building): boolean {
    for (let i = 0; i < other.vertices.length; i++)
      if (
        this.crossingSegmentCount(
          other.vertices[i],
          other.vertices[(i + 1) % other.vertices.length]
        )
      )
        return true;
    for (let vertex of other.vertices)
      if (this.containPoint(vertex)) return true;

    for (let vertex of this.vertices)
      if (other.containPoint(vertex)) return true;

    return false;
  }

  // 自身に力を加える
  addForce(
    other: District | Building,
    k: number = 0.1,
    low: number = 1
  ): boolean {
    if (this.isOverlaped(other) === false) return false;

    const weightRatio = Math.log(1 + other.area() / this.area());
    const thisCenter = this.barycenter();
    const otherCenter = other.barycenter();
    const dx = thisCenter.x - otherCenter.x;
    const dz = thisCenter.z - otherCenter.z;
    const theta = Math.atan2(dz, dx);
    const distance = Math.sqrt(dx ** 2 + dz ** 2);
    this.force.x +=
      (k * weightRatio * Math.cos(theta)) / Math.max(distance, low);
    this.force.z +=
      (k * weightRatio * Math.sin(theta)) / Math.max(distance, low);
    return true;
  }

  effectForce(alpha: number = 0.8, k: number = 5): void {
    for (let _ = 0; _ < k; _++) {
      for (let vertex of this.vertices) {
        vertex.x += this.force.x;
        vertex.z += this.force.z;
      }
      this.force.x *= alpha;
      this.force.z *= alpha;
    }
  }
}

// 地区クラス
export class District extends MapObject {
  public children: { [name: string]: District | Building } = {}; // 辞書オブジェクト{ "名前": District | Building }
  constructor(name: string, x: number, z: number) {
    // 親地区の重心を{0, 0}としたときの相対的な位置．
    const vertices: Array<Vertex2d> = [
      // 3つ頂点を持つ大きさ0のセグメント
      { x: x, z: z },
      { x: x, z: z },
      { x: x, z: z },
    ];
    super(name, vertices);
  }
  // 子供の位置調整を行い，自らのverticesを更新する．
  // 子供たちが全く重ならなくなったら，各子供についてその子供が建物ならばactiveにする．

  getChildDistrices(): Array<District | Building> {
    return Object.keys(this.children).map(
      (childName) => this.children[childName]
    );
  }

  barycenter(): Vertex2d {
    // 全ての子供の頂点を変更する
    // 全ての頂点の重心を(0, 0)にするように設定する
    const childDistricts = this.getChildDistrices();
    let x = 0,
      z = 0;
    for (let child of childDistricts) {
      const barecenter = child.barycenter();
      x += barecenter.x / childDistricts.length;
      z += barecenter.z / childDistricts.length;
    }
    return { x: x, z: z };
  }

  optimize(): boolean {
    // 全ての子供の頂点を変更する
    console.log("OPTIMIZE in " + this.name);
    const childDistricts = this.getChildDistrices();

    // 力を初期化する
    for (let district of childDistricts)
      district.force = { x: 0, z: 0 } as Vertex2d;

    // ぶつかりから，力を更新する
    let optimized = false;
    for (let i = 0; i < childDistricts.length; i++) {
      for (let j = i + 1; j < childDistricts.length; j++) {
        optimized ||= childDistricts[i].addForce(childDistricts[j]);
        optimized ||= childDistricts[j].addForce(childDistricts[i]);
      }
    }

    // 力を加える
    for (let district of childDistricts) district.effectForce();

    return optimized;
  }

  centering(): void {
    console.log("CENTERING in", this.name);
    const childDistricts = this.getChildDistrices();

    let barycenter = this.barycenter();

    for (let child of childDistricts) {
      for (let vertex of child.vertices) {
        vertex.x -= barycenter.x;
        vertex.z -= barycenter.z;
      }
    }
  }

  // 子供の頂点から自分の頂点を計算する
  updateVertices(maxVertexNumber: number = 8): void {
    console.log("UPDATE VERTICES in " + this.name);
    const childDistricts = this.getChildDistrices();
    let newVertices: Array<Vertex2d> = new Array(maxVertexNumber).fill({
      x: 0,
      z: 0,
    });

    for (let child of childDistricts) {
      for (let vertex of child.vertices) {
        let index = Math.floor(
          ((Math.atan2(vertex.z, vertex.x) + Math.PI) / (2 * Math.PI)) *
            maxVertexNumber
        );

        if (
          newVertices[index].x ** 2 + newVertices[index].z ** 2 <
          vertex.x ** 2 + vertex.z ** 2
        )
          newVertices[index] = vertex;
      }
    }

    newVertices = newVertices
      .filter((vertex) => {
        return !(vertex.x === 0 && vertex.z === 0);
      })
      .map((vertex) => {
        let currentBarycenter = this.barycenter();
        return {
          x: vertex.x + currentBarycenter.x,
          z: vertex.z + currentBarycenter.z,
        };
      });
    this.vertices = newVertices;
  }
}

// 建物クラス
export class Building extends MapObject {
  public height: number;
  public active: boolean; // 追加した時点では表示しない．追加された後，建物同士の位置が調整されて，この建物の位置が確定したらactivateされて表示する．
  constructor(name: string, vertices: Array<Vertex2d>, height: number) {
    super(name, vertices);
    this.height = height;
    this.active = false;
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
    let districts = [this.rootDistrict];
    let d = 0;
    for (d = 0; d < relativePath.length - 1; d++) {
      districtName = relativePath[d];
      if (typeof districts[d].children[districtName] === "undefined")
        districts[d].children[districtName] = new District(
          districtName,
          Math.random() - 0.5,
          Math.random() - 0.5
        );
      districts.push(districts[d].children[districtName] as District);
    }

    let buildingName = relativePath[relativePath.length - 1];
    let x = Math.random() - 0.5;
    let z = Math.random() - 0.5;
    districts[d].children[buildingName] = new Building(
      buildingName,
      [
        { x: x - 0.5, z: z - 0.5 },
        { x: x - 0.5, z: z + 0.5 },
        { x: x + 0.5, z: z + 0.5 },
        { x: x + 0.5, z: z - 0.5 },
      ],
      1
    );

    // rootから新しく建物を追加したdistrictまでを，逆順でオプティマイズする
    // [rootDistrict, aDistrict, bDistrict, cDistrict]
    for (let d = districts.length - 1; d >= 0; d--) {
      // 地区を子(地区)から順番に位置を調整する
      let needOptimize = true;
      for (let i = 0; i < 100 && needOptimize; i++) {
        // 10回調整する
        needOptimize = districts[d].optimize();
      }
      // 地区の子の全ての頂点の重心が[0,0]になるように調整する
      districts[d].centering();
      // 自分自身の頂点を書き換える．
      districts[d].updateVertices();
    }
  }
}
