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

// 直線(vector1とvector2を通る)と線分(vector3とvector4を端点とする)が交差しているか判定する．
function isCrossingSegmentAndLine(
  vector1: Vector2d,
  vector2: Vector2d,
  vector3: Vector2d,
  vector4: Vector2d
) {
  return (
    ((vector1.x - vector2.x) * (vector3.z - vector1.z) +
      (vector1.z - vector2.z) * (vector1.x - vector3.x)) *
      ((vector1.x - vector2.x) * (vector4.z - vector1.z) +
        (vector1.z - vector2.z) * (vector1.x - vector4.x)) <
    0
  );
}
// 線分(vector1とvector2を端点とする)と線分(vector3とvector4を端点とする)が交差しているか判定する．
function isCrossingSegment(
  vector1: Vector2d,
  vector2: Vector2d,
  vector3: Vector2d,
  vector4: Vector2d
) {
  return (
    isCrossingSegmentAndLine(vector1, vector2, vector3, vector4) &&
    isCrossingSegmentAndLine(vector3, vector4, vector1, vector2)
  );
}

// 与えられた領域vectorsの周が線分(vector1とvector2を端点とする)と何回重なるか調べる．
function crossingSegmentCount(
  vectors: Array<Vector2d>,
  vector1: Vector2d,
  vector2: Vector2d
): number {
  let count = 0;
  for (let i = 0; i < vectors.length; i++)
    if (
      isCrossingSegment(
        vector1,
        vector2,
        vectors[i],
        vectors[(i + 1) % vectors.length]
      )
    )
      count++;
  return count;
}

// 与えられた半直線(origin, derection)と線分(vector1とvector2を端点とする)の交点があるか調べる．
// あればorigin + k * directionのkを返す．
function crossingPointBetweenSegmentAndHalfLine(
  origin: Vector2d,
  direction: Vector2d,
  vector1: Vector2d,
  vector2: Vector2d
): number | null {
  if (
    isCrossingSegmentAndLine(origin, origin.add(direction), vector1, vector2) &&
    direction.x * (vector2.z - vector1.z) -
      direction.z * (vector2.x - vector1.x) !==
      0
  ) {
    let k =
      ((origin.z - vector1.z) * (vector2.x - vector1.x) -
        (origin.x - vector1.x) * (vector2.z - vector1.z)) /
      (direction.x * (vector2.z - vector1.z) -
        direction.z * (vector2.x - vector1.x));
    if (k >= 0) return k;
  }
  return null;
}

// 与えられた半直線(origin, derection)と多角形vectorsの交点があるか調べる．
// あれば到達までの最短のkを返す
function crossingHalfLine(
  origin: Vector2d,
  direction: Vector2d,
  vectors: Array<Vector2d>
): number | null {
  let mink: number | null = null;
  let k: number | null = null;
  for (let i = 0; i < vectors.length; i++) {
    k = crossingPointBetweenSegmentAndHalfLine(
      origin,
      direction,
      vectors[i],
      vectors[(i + 1) % vectors.length]
    );
    if (k !== null && (mink === null || mink > k)) {
      mink = k;
    }
  }
  return mink;
}

// 与えられた領域vectorsが点vectorを含んでいるか判定する．
function containPoint(vectors: Array<Vector2d>, vector: Vector2d): boolean {
  const infinityPoint = new Vector2d(10 ** 9, 10 ** 9);
  return crossingSegmentCount(vectors, vector, infinityPoint) % 2 === 1;
}

// 与えられた2つの頂点集合vectors1, vectors2が重なっているかを判定する．
function isOverlaped(vectors1: Array<Vector2d>, vectors2: Array<Vector2d>) {
  for (let i = 0; i < vectors2.length; i++)
    if (
      crossingSegmentCount(
        vectors1,
        vectors2[i],
        vectors2[(i + 1) % vectors2.length]
      ) > 0
    )
      return true;
  for (let vector of vectors2) if (containPoint(vectors1, vector)) return true;
  for (let vector of vectors1) if (containPoint(vectors2, vector)) return true;
  return false;
}

// 与えられた頂点集合から外周を得る
function perimeter(vectors: Array<Vector2d>) {
  let bottomVertices: Array<Vector2d> = [];
  let topVertices: Array<Vector2d> = [];

  vectors = vectors.sort((a, b) => a.x - b.x);

  // 凸多角形の下側を求めていく
  let i = 0;
  let thetas: Array<number>;
  while (i + 1 < vectors.length) {
    bottomVertices.push(vectors[i]);
    thetas = vectors.map((_vector) => _vector.sub(vectors[i]).theta());
    i = argmax(thetas, i + 1, vectors.length);
  }
  // 凸多角形の上側を求めていく
  i = 0;
  while (i + 1 < vectors.length) {
    thetas = vectors.map((_vector) => _vector.sub(vectors[i]).theta());
    i = argmin(thetas, i + 1, vectors.length);
    topVertices.push(vectors[i]);
  }

  return bottomVertices.concat(topVertices.reverse());
}

// 最も近い点を求める
function getNeighborhoodVectorIndex(
  vectors: Array<Vector2d>,
  vector: Vector2d
): number {
  // vectors1とvectors2それぞれで，互いに最も近い頂点番号
  let v, minv;
  minv = Infinity;
  let argmin = -1;
  for (let i = 0; i < vectors.length; i++) {
    v = vectors[i].sub(vector).size();
    if (v < minv) {
      minv = v;
      argmin = i;
    }
  }
  return argmin;
}

// 与えられた2つの凸集合の間を通る直線の通る2点を求める．
function getSeparateLine(
  vectors1: Array<Vector2d>,
  vectors2: Array<Vector2d>,
  baseVector1: Vector2d,
  baseVector2: Vector2d
): [Vector2d, Vector2d] | null {
  // 各ペアに対して，そのペアのオブジェクト同士の最も近い点の番号
  let vectors1Neighborhood = getNeighborhoodVectorIndex(vectors1, baseVector2);
  let vectors2Neighborhood = getNeighborhoodVectorIndex(vectors2, baseVector1);

  // 分離軸の基準点を計算
  let origin = vectors1[vectors1Neighborhood]
    .add(vectors2[vectors2Neighborhood])
    .times(1 / 2);

  // vectors1の中で，vectors2と最も近い点の一つ前の点と後ろの点
  let nearVectors1Neighborhoods = [
    (vectors1Neighborhood + vectors1.length - 1) % vectors1.length,
    (vectors1Neighborhood + 1) % vectors1.length,
  ];

  // vectors1の中で，vectors2と最も近い点の一つ前の点と後ろの点
  let nearVectors2Neighborhoods = [
    (vectors2Neighborhood + vectors2.length - 1) % vectors2.length,
    (vectors2Neighborhood + 1) % vectors2.length,
  ];

  let separateLines: Array<[Vector2d, Vector2d]> = [];
  for (let v1id of nearVectors1Neighborhoods) {
    let direction = vectors1[v1id].sub(vectors1[vectors1Neighborhood]);
    if (
      !isCrossingSegmentAndLine(
        origin,
        direction.add(origin),
        vectors2[vectors2Neighborhood],
        vectors2[nearVectors2Neighborhoods[0]]
      ) &&
      !isCrossingSegmentAndLine(
        origin,
        direction.add(origin),
        vectors2[vectors2Neighborhood],
        vectors2[nearVectors2Neighborhoods[1]]
      )
    )
      separateLines.push([origin, direction]);
  }
  for (let v2id of nearVectors2Neighborhoods) {
    let direction = vectors2[v2id].sub(vectors2[vectors2Neighborhood]);
    if (
      !isCrossingSegmentAndLine(
        origin,
        direction.add(origin),
        vectors1[vectors1Neighborhood],
        vectors1[nearVectors1Neighborhoods[0]]
      ) &&
      !isCrossingSegmentAndLine(
        origin,
        direction.add(origin),
        vectors1[vectors1Neighborhood],
        vectors1[nearVectors1Neighborhoods[1]]
      )
    )
      separateLines.push([origin, direction]);
  }
  if (separateLines.length > 0) {
    return separateLines.sort(
      (a, b) => b[1].sub(b[0]).size() - a[1].sub(a[0]).size()
    )[0];
  }
  return null;
}

// 線分(vector2とvector3を端点とする)と、点(vector1)からその直線に引いた垂線が交わるかどうか
function isCrossingSegmentAndPerpendicularLine(
  vector1: Vector2d,
  vector2: Vector2d,
  vector3: Vector2d
): boolean {
  const t =
    vector1.sub(vector2).dot(vector3.sub(vector2)) /
    vector3.sub(vector2).size();
  return 0 <= t && t <= vector3.sub(vector2).size();
}

// 直線(vector2とvector3を通る)と、点(vector1)からその直線に引いた垂線の交点
function projection(
  vector1: Vector2d,
  vector2: Vector2d,
  vector3: Vector2d
): Vector2d {
  const t =
    vector1.sub(vector2).dot(vector3.sub(vector2)) /
    vector3.sub(vector2).size();
  return vector2.add(vector3.sub(vector2).times(t));
}

// 点(vector1)に対して直線(vector2とvector3を通る)と対称な点
function reflection(
  vector1: Vector2d,
  vector2: Vector2d,
  vector3: Vector2d
): Vector2d {
  return vector1.add(
    projection(vector1, vector2, vector3).sub(vector1).times(2)
  );
}

// set1がset2の上位集合である
function isSuperset(set1: Set<any>, set2: Set<any>) {
  for (var elem of set2) {
    if (!set1.has(elem)) {
      return false;
    }
  }
  return true;
}

// Mapに描写されるものはMapObjectです．
// 建物や地区の基底クラスです．
// 建物と地区に共通する部分を書く．
class MapObject {
  public name: string; // 名前
  public vertices: Array<Vector2d>; // 現在の頂点の配列を持ちます（反時計回りor時計回りに頂点を並べたもの）
  public base: Vector2d;
  public force: Vector2d; // そのMapObjectが現在受けている力ベクトル

  // デバッグ用にマーカーとライン弾けるようにした
  public debugMarkers: Array<{ point: Vector2d; color?: string }>;
  public debugLines: Array<{ start: Vector2d; end: Vector2d; color?: string }>;

  constructor(name: string, vertices: Array<Vector2d>, basePoint: Vector2d) {
    this.name = name;
    this.vertices = vertices;
    this.base = basePoint;
    this.force = new Vector2d(0, 0);

    // デバッグ用にマーカーとライン引けるようにした
    this.debugMarkers = [];
    this.debugLines = [];
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

  // 衝突しているか？
  isOverlaped(other: District | Building): boolean {
    return isOverlaped(
      this.vertices.map((vertex) => vertex.add(this.base)),
      other.vertices.map((vertex) => vertex.add(other.base))
    );
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

  getCenter(children?: Array<District | Building>): Vector2d {
    children = children || this.getChildrenAsList();

    let center = new Vector2d(0, 0);
    for (let child of children) {
      center = center.add(child.base); // center += child.base
    }
    center = center.times(1 / children.length); // center /= childDistrict.length
    return center;
  }

  optimize(): void {
    const children = this.getChildrenAsList();

    // 全ての子供のbaseを変更する
    console.log("OPTIMIZE in " + this.name);

    let optimized = true;
    for (let _ = 0; _ < 100 && optimized; _++) {
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
    let center = this.getCenter(children);
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
    // 頂点の集合から外周を得る
    this.vertices = perimeter(points);
  }

  // 道を生成する
  generateRoads(): void {
    const children = this.getChildrenAsList();

    // 各オブジェクトの座標にbaseを追加して基準を合わせる．
    const childrenVertices: Vector2d[][] = children.map((child) => {
      return child.vertices.map((vertex) => {
        return vertex.add(child.base);
      });
    });

    // 間に建物や地区が存在しないような2つを列挙する
    const pairs: Array<[number, number]> = [];
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        // 二つのオブジェクトを囲うオブジェクトを計算

        // 他のオブジェクトと重なるかを探索する
        let neighboring = true;
        for (let k = 0; k < children.length; k++) {
          if (
            i !== k &&
            j !== k &&
            crossingSegmentCount(
              childrenVertices[k],
              children[i].base,
              children[j].base
            ) > 0
          ) {
            neighboring = false;
            break;
          }
        }
        if (neighboring === true) pairs.push([i, j]);
      }
    }

    let routeCandidates: Array<{
      dist1: Vector2d; // base + dist1で目的の場所まで
      dist2: Vector2d; // base + dist2で目的の場所まで
      dist1isOuter: boolean; // base + dist1が外周になっているか
      dist2isOuter: boolean; // base + dist2が外周になっているか
      base: Vector2d; // スタート地点
      active: boolean; // 道として表示する(true)，捨てるか(false)
      left: Set<Number>;
      right: Set<Number>;
    }> = [];
    let routes: Array<{ start: Vector2d; end: Vector2d }> = [];

    for (let pair of pairs) {
      // 分離線は必ず得られる
      let separateLine = getSeparateLine(
        childrenVertices[pair[0]],
        childrenVertices[pair[1]],
        children[pair[0]].base,
        children[pair[1]].base
      );
      if (separateLine === null) continue; // 得られないことはないはずだが得られなかった場合はなにもしない

      // 半直線とオブジェクトが重ならない
      // startからendの正数倍方向に向かった半直線
      let minkPositive: number | null = null;
      let minkNegative: number | null = null;
      let kPositive: number | null = null;
      let kNegative: number | null = null;
      let kPositiveOuter: number = 0;
      let kNegativeOuter: number = 0;

      // 外側の座標とぶつかるkを見つける
      kPositiveOuter =
        crossingHalfLine(separateLine[0], separateLine[1], this.vertices) || 0;
      kNegativeOuter =
        crossingHalfLine(
          separateLine[0],
          separateLine[1].times(-1),
          this.vertices
        ) || 0;

      // 内部の座標とぶつかるならばその中で最も小さいkを見つける
      for (let i = 0; i < children.length; i++) {
        kPositive = crossingHalfLine(
          separateLine[0],
          separateLine[1],
          childrenVertices[i]
        );
        if (
          kPositive !== null &&
          (minkPositive === null || minkPositive > kPositive)
        ) {
          minkPositive = kPositive;
        }
        kNegative = crossingHalfLine(
          separateLine[0],
          separateLine[1].times(-1),
          childrenVertices[i]
        );
        if (
          kNegative !== null &&
          (minkNegative === null || minkNegative > kNegative)
        ) {
          minkNegative = kNegative;
        }
      }
      routeCandidates.push({
        dist1: separateLine[1].times(
          minkPositive !== null ? minkPositive : kPositiveOuter
        ),
        dist2: separateLine[1].times(
          minkNegative !== null ? -minkNegative : -kNegativeOuter
        ),
        dist1isOuter: minkPositive === null,
        dist2isOuter: minkNegative === null,
        base: separateLine[0],
        active: false,
        left: new Set<number>(),
        right: new Set<number>(),
      });
    }

    // 線分の両端がouterであるものはルートとして確定させる
    for (let routeCandidate of routeCandidates) {
      if (routeCandidate.dist1isOuter && routeCandidate.dist2isOuter) {
        for (let i = 0; i < children.length; i++) {
          // オブジェクトが線分によって分けられている．
          let c = routeCandidate.base.add(routeCandidate.dist1);
          let p = routeCandidate.base.add(routeCandidate.dist2);
          let q = children[i].base;
          if (isCrossingSegmentAndPerpendicularLine(q, c, p)) {
            if ((p.x - c.x) * (q.z - c.z) - (p.z - c.z) * (q.x - c.x) > 0)
              // 反時計回り(pを下，qを上としたときに左に点がくる)
              routeCandidate.left.add(i);
            // 反時計回り(pを下，qを上としたときに右に点がくる)
            else routeCandidate.right.add(i);
          }
        }
        // アクティブな道で，同じ分け方をする道か，この道がさらに大きく分ける道があればそれを削除する
        for (let _routeCandidate of routeCandidates) {
          if (
            _routeCandidate.active === true &&
            ((isSuperset(routeCandidate.left, _routeCandidate.left) &&
              isSuperset(routeCandidate.right, _routeCandidate.right)) ||
              (isSuperset(routeCandidate.left, _routeCandidate.right) &&
                isSuperset(routeCandidate.right, _routeCandidate.left)))
          )
            _routeCandidate.active = false;
        }
        routeCandidate.active = true;
        console.log(routeCandidate);
      }
    }

    // 線分の両端がouterであるものはルートとして確定させる
    for (let routeCandidate of routeCandidates) {
      if (
        (routeCandidate.dist1isOuter && !routeCandidate.dist2isOuter) ||
        (!routeCandidate.dist1isOuter && routeCandidate.dist2isOuter)
      ) {
        for (let i = 0; i < children.length; i++) {
          // オブジェクトが線分によって分けられている．
          let c = routeCandidate.base.add(routeCandidate.dist1);
          let p = routeCandidate.base.add(routeCandidate.dist2);
          let q = children[i].base;
          if (isCrossingSegmentAndPerpendicularLine(q, c, p)) {
            if ((p.x - c.x) * (q.z - c.z) - (p.z - c.z) * (q.x - c.x) > 0)
              // 反時計回り(pを下，qを上としたときに左に点がくる)
              routeCandidate.left.add(i);
            // 反時計回り(pを下，qを上としたときに右に点がくる)
            else routeCandidate.right.add(i);
          }
        }
        // アクティブな道で，同じ分け方をする道か，この道がさらに大きく分ける道があればそれを削除する
        for (let _routeCandidate of routeCandidates) {
          if (
            _routeCandidate.active === true &&
            ((isSuperset(routeCandidate.left, _routeCandidate.left) &&
              isSuperset(routeCandidate.right, _routeCandidate.right)) ||
              (isSuperset(routeCandidate.left, _routeCandidate.right) &&
                isSuperset(routeCandidate.right, _routeCandidate.left)))
          )
            _routeCandidate.active = false;
        }
        routeCandidate.active = true;
        console.log(routeCandidate);
      }
    }

    // 各線分を引く
    for (let routeCandidate of routeCandidates) {
      if (routeCandidate.active)
        this.debugLines.push({
          start: routeCandidate.base.add(routeCandidate.dist1),
          end: routeCandidate.base.add(routeCandidate.dist2),
          color: "#00c000",
        });
    }
  }
}

// 建物クラス
export class Building extends MapObject {
  public fileInfo: FileInfo;
  public active: boolean; // 追加した時点では表示しない．追加された後，建物同士の位置が調整されて，この建物の位置が確定したらactivateされて表示する．
  constructor(
    name: string,
    vertices: Array<Vector2d>,
    base: Vector2d,
    fileInfo: FileInfo,
  ) {
    super(name, vertices, base);
    this.fileInfo = fileInfo;
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
    let width = 1;
    let height = 1;
    districts[d].children[buildingName] = new Building(
      buildingName,
      [
        new Vector2d(-width / 2, -height / 2),
        new Vector2d(-width / 2, +height / 2),
        new Vector2d(+width / 2, +height / 2),
        new Vector2d(+width / 2, -height / 2),
      ],
      new Vector2d(Math.random() - 0.5, Math.random() - 0.5),
      fileInfo
    );

    // rootから新しく建物を追加したdistrictまでを，逆順でオプティマイズする
    // [rootDistrict, aDistrict, bDistrict, cDistrict]
    for (let d = districts.length - 1; d >= 0; d--) {
      // デバッグ用の点や線は削除する
      districts[d].debugMarkers = [];
      districts[d].debugLines = [];
      // 地区を子(地区)から順番に位置を調整する
      districts[d].optimize();
      // 自分自身の頂点を書き換える．
      districts[d].updateVertices();
      // 道を引く
      districts[d].generateRoads();
    }
  }
}
