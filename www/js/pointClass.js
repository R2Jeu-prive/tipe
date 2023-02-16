class Point {
  constructor(x, y, dir = 0, id = 0) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.id = id;
  }

  IsNearPoint(trackPoint, dist = trackSemiWidthSquared) {
    return Math.pow((this.x - trackPoint.x), 2) + Math.pow((this.y - trackPoint.y), 2) < dist;
  }

  HasCrossedCheckPoint(checkPoint, directionVector) {
    return this.IsNearPoint(checkPoint) && (((this.x - checkPoint.x) * directionVector.x) + ((this.y - checkPoint.y) * directionVector.y) >= 0);
  }
}