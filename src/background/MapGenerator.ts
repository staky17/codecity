export class Vector2d {
  public x: number;
  public z: number;
  constructor(x: number, z: number) {
    this.x = x;
    this.z = z;
  }
  add(other: Vector2d) {
    return new Vector2d(this.x + other.x, this.z + other.z);
  }
  sub(other: Vector2d) {
    return new Vector2d(this.x - other.x, this.z - other.z);
  }
  times(k: number) {
    return new Vector2d(this.x * k, this.z * k);
  }
  dot(other: Vector2d) {
    return this.x * other.x + this.z * other.z;
  }
  cross(other: Vector2d) {
    return this.x * other.z - this.z * other.x;
  }
  size() {
    return Math.sqrt(this.x ** 2 + this.z ** 2);
  }
  theta() {
    return Math.atan2(this.z, this.x);
  }
}

// 最大の要素のインデックスを返す．
function argmax(a: Array<number>, start: number, end: number) {
  let index = 0;
  let value = -Infinity;
  for (let i = start; i < end; i++) {
    if (value < a[i]) {
      value = a[i];
      index = i;
    }
  }
  return index;
}
// 最小の要素のインデックスを返す．
function argmin(a: Array<number>, start: number, end: number) {
  let index = 0;
  let value = Infinity;
  for (let i = start; i < end; i++) {
    if (value > a[i]) {
      value = a[i];
      index = i;
    }
  }
  return index;
}

// 点vertex1に対して，vertex2とvertex3を結ぶ千文が時計回り(1)か半時計回り(-1)か同一直線(0)か判定する
function clockwise(
  vector1: Vector2d,
  vector2: Vector2d,
  vector3: Vector2d
): number {
  let d2 = vector2.sub(vector1);
  let d3 = vector3.sub(vector1);
  if (d2.x * d3.z < d3.x * d2.z) return 1;
  else if (d2.x * d3.z > d3.x * d2.z) return -1;
  return 0;
}

function isCrossingSegment(
  vector1: Vector2d,
  vector2: Vector2d,
  vector3: Vector2d,
  vector4: Vector2d
) {
  return (
    clockwise(vector1, vector3, vector4) *
      clockwise(vector2, vector3, vector4) <
      0 &&
    clockwise(vector3, vector1, vector2) *
      clockwise(vector4, vector1, vector2) <
      0
  );
}

// Mapに描写されるものはMapObjectです．
// 建物や地区の基底クラスです．
// 建物と地区に共通する部分を書く．
class MapObject {
  public name: string; // 名前
  public vertices: Array<Vector2d>; // 現在の頂点の配列を持ちます（反時計回りor時計回りに頂点を並べたもの）
  public base: Vector2d;
  public force: Vector2d; // そのMapObjectが現在受けている力ベクトル

  constructor(name: string, vertices: Array<Vector2d>, basePoint: Vector2d) {
    this.name = name;
    this.vertices = vertices;
    this.base = basePoint;
    this.force = new Vector2d(0, 0);
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

  crossingSegmentCount(vector1: Vector2d, vector2: Vector2d): number {
    let count = 0;
    for (let i = 0; i < this.vertices.length; i++)
      if (
        isCrossingSegment(
          vector1,
          vector2,
          this.vertices[i].add(this.base),
          this.vertices[(i + 1) % this.vertices.length].add(this.base)
        )
      )
        count++;
    return count;
  }

  containPoint(vector: Vector2d): boolean {
    const infinityPoint = new Vector2d(10 ** 9, 10 ** 9);
    return this.crossingSegmentCount(vector, infinityPoint) % 2 === 1;
  }

  // 衝突しているか？
  isOverlaped(other: District | Building): boolean {
    for (let i = 0; i < other.vertices.length; i++)
      if (
        this.crossingSegmentCount(
          other.vertices[i].add(other.base),
          other.vertices[(i + 1) % other.vertices.length].add(other.base)
        )
      )
        return true;
    for (let vertex of other.vertices)
      if (this.containPoint(vertex.add(other.base))) return true;

    for (let vertex of this.vertices)
      if (other.containPoint(vertex.add(this.base))) return true;

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
    const baseSub = this.base.sub(other.base); // this.base - other.base
    const theta = baseSub.theta();
    const distance = baseSub.size();
    this.force.x +=
      (k * weightRatio * Math.cos(theta)) / Math.max(distance, low);
    this.force.z +=
      (k * weightRatio * Math.sin(theta)) / Math.max(distance, low);
    return true;
  }

  effectForce(alpha: number = 0.8, k: number = 5): void {
    for (let _ = 0; _ < k; _++) {
      this.base = this.base.add(this.force);
      this.force.times(alpha);
    }
  }
}

// 地区クラス
export class District extends MapObject {
  public children: { [name: string]: District | Building } = {}; // 辞書オブジェクト{ "名前": District | Building }
  constructor(name: string, base: Vector2d) {
    // 親地区の重心を{0, 0}としたときの相対的な位置．
    const vertices: Array<Vector2d> = [
      // 3つ頂点を持つ大きさ0のセグメント
      new Vector2d(0, 0),
      new Vector2d(0, 0),
      new Vector2d(0, 0),
    ];
    super(name, vertices, base);
  }
  // 子供の位置調整を行い，自らのverticesを更新する．
  // 子供たちが全く重ならなくなったら，各子供についてその子供が建物ならばactiveにする．

  getChildrenAsList(): Array<District | Building> {
    return Object.keys(this.children).map(
      (childName) => this.children[childName]
    );
  }

  optimize(): void {
    const children = this.getChildrenAsList();

    // 全ての子供のbaseを変更する
    console.log("OPTIMIZE in " + this.name);

    let optimized = true;
    for (let i = 0; i < 100 && optimized; i++) {
      // 力を初期化する
      for (let child of children) child.force = new Vector2d(0, 0);

      // ぶつかりから，力を更新する
      optimized = false;
      for (let i = 0; i < children.length; i++) {
        for (let j = i + 1; j < children.length; j++) {
          optimized ||= children[i].addForce(children[j]);
          optimized ||= children[j].addForce(children[i]);
        }
      }

      // 力を加える
      for (let child of children) child.effectForce();
    }

    // 中心にする
    let center = new Vector2d(0, 0);
    for (let child of children) {
      center = center.add(child.base); // center += child.base
    }
    center = center.times(1 / children.length); // center /= childDistrict.length

    for (let child of children) {
      child.base = child.base.sub(center);
    }
  }

  // 子供の頂点から自分の頂点を計算する
  updateVertices(): void {
    console.log("UPDATE VERTICES in " + this.name);

    // 子の頂点をbase + verticesで求めて全てpointsに追加
    let points: Array<Vector2d> = [];
    for (let child of this.getChildrenAsList()) {
      for (let vertex of child.vertices) {
        points.push(vertex.add(child.base)); // child.vertex + child.base
      }
    }
    // x座標でソートする
    points = points.sort((a, b) => a.x - b.x);

    // pointsを含む凸多角形の外周の頂点を得る
    let bottomVertices: Array<Vector2d> = [];
    let topVertices: Array<Vector2d> = [];

    // 凸多角形の下側を求めていく
    let i = 0;
    let thetas: Array<number>;
    while (i + 1 < points.length) {
      bottomVertices.push(points[i]);
      thetas = points.map((_point) => _point.sub(points[i]).theta());
      i = argmax(thetas, i + 1, points.length);
    }
    // 凸多角形の上側を求めていく
    i = 0;
    while (i + 1 < points.length) {
      thetas = points.map((_point) => _point.sub(points[i]).theta());
      i = argmin(thetas, i + 1, points.length);
      topVertices.push(points[i]);
    }

    this.vertices = bottomVertices.concat(topVertices.reverse());
  }
}

// 建物クラス
export class Building extends MapObject {
  public height: number;
  public active: boolean; // 追加した時点では表示しない．追加された後，建物同士の位置が調整されて，この建物の位置が確定したらactivateされて表示する．
  constructor(
    name: string,
    vertices: Array<Vector2d>,
    base: Vector2d,
    height: number
  ) {
    super(name, vertices, base);
    this.height = height;
    this.active = false;
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
    this.rootDistrict = new District(
      pathList[pathList.length - 1],
      new Vector2d(0, 0)
    );
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
          new Vector2d(Math.random() - 0.5, Math.random() - 0.5)
        );
      districts.push(districts[d].children[districtName] as District);
    }

    let buildingName = relativePath[relativePath.length - 1];
    districts[d].children[buildingName] = new Building(
      buildingName,
      [
        new Vector2d(-0.5, -0.5),
        new Vector2d(-0.5, +0.5),
        new Vector2d(+0.5, +0.5),
        new Vector2d(+0.5, -0.5),
      ],
      new Vector2d(Math.random() - 0.5, Math.random() - 0.5),
      1
    );

    // rootから新しく建物を追加したdistrictまでを，逆順でオプティマイズする
    // [rootDistrict, aDistrict, bDistrict, cDistrict]
    for (let d = districts.length - 1; d >= 0; d--) {
      // 地区を子(地区)から順番に位置を調整する
      districts[d].optimize();
      // 自分自身の頂点を書き換える．
      districts[d].updateVertices();
    }
  }
}
