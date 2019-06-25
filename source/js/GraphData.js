/*

  frontend/js/GraphData.js

*/
'use strict';

class GraphData {
  constructor(data) {
    Object.assign(this, data);
    this.lastPoint = null;
    if(this.curves.length) {
      this.lastPoint = {
        x: this.curves[this.curves.length - 1].x,
        y: this.curves[this.curves.length - 1].y,
      };
    }
  }

  ChangeCurve(idx, obj) {
    const curve = Object.assign({}, this.curves[idx], obj);
    this.curves.splice(idx, 1, curve);
  }

  Add(idx, x, y) {
    if(idx < 0) {
      if(this.lastPoint) {
        const prevCurve = this.curves.length - 1;
        let x1 = (x - this.lastPoint.x) * 0.3;
        let y1 = (y - this.lastPoint.y) * 0.3;
        if(prevCurve >= 0) {
          x1 = (-this.curves[prevCurve].x2 + x1) / 2;
          y1 = (-this.curves[prevCurve].y2 + y1) / 2;
          this.ChangeCurve(prevCurve, { x2: -x1, y2: -y1 });
        }
        this.curves.push({
          sx: this.lastPoint.x,
          sy: this.lastPoint.y,
          dx: x,
          dy: y,
          x1: x1,
          y1: y1,
          type1: 'auto',
          x2: (this.lastPoint.x - x) * 0.3,
          y2: (this.lastPoint.y - y) * 0.3,
          type2: 'auto',
        });
      }
      this.lastPoint = { x, y };
      return;
    }
    const curve = this.curves[idx];
    let min = 1000;
    let minT = -1;
    let minPos = null;
    for(let i = 0; i <= 256; i++) {
      const t = i / 256;
      const pos = this.BezierPoint(curve, t);
      const l = Math.hypot(x - pos.x, y - pos.y);
      if(min > l) {
        min = l;
        minT = t;
        minPos = pos;
      }
    }
    const tangent = this.Tangent(curve, minT);
    const curve1 = Object.assign({}, curve, {
        dx: minPos.x,
        dy: minPos.y,
        x2: -tangent.x,
        y2: -tangent.y,
        type2: 'auto',
      });
      const curve2 = Object.assign({}, curve, {
        sx: minPos.x,
        sy: minPos.y,
        x1: tangent.x,
        y1: tangent.y,
        type1: 'auto',
      });
      this.curves.splice(idx, 1, curve1, curve2);
  }

  Remove(idx) {
    if(idx < 1) return;
    if(idx >= this.curves.length) return;
    const curve = Object.assign({}, this.curves[idx], {
      sx: this.curves[idx - 1].sx,
      sy: this.curves[idx - 1].sy,
      x1: this.curves[idx - 1].x1,
      y1: this.curves[idx - 1].y1,
    });
    this.curves.splice(idx - 1, 2, curve);
  }

  Clear() {
    this.curves = [];
    this.lastPoint = null;
  }

  BezierPoint(curve, t) {
    const tl = curve.dx - curve.sx;
    const rad1 = Math.atan2(curve.y1, curve.x1);
    const x1 = (Math.cos(rad1) * curve.influence1 * tl || curve.x1) + curve.sx;
    const y1 = (Math.sin(rad1) * curve.influence1 * tl || curve.y1) + curve.sy;
    const rad2 = Math.atan2(curve.y2, curve.x2);
    const x2 = (Math.cos(rad2) * curve.influence2 * tl || curve.x2) + curve.dx;
    const y2 = (Math.sin(rad2) * curve.influence2 * tl || curve.y2) + curve.dy;

    return {
      x: Math.pow(1 - t, 3) * curve.sx + 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3) * curve.dx,
      y: Math.pow(1 - t, 3) * curve.sy + 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3) * curve.dy,
    };
  }

  Tangent(curve, t) {
    const x1 = curve.x1 + curve.sx;
    const y1 = curve.y1 + curve.sy;
    const x2 = curve.x2 + curve.dx;
    const y2 = curve.y2 + curve.dy;
    const x = 3 * (3 * x1 + curve.dx - 3 * x2 - curve.sx) * Math.pow(t, 2) + 2 * 3 * (curve.sx - 2 * x1 + x2) * t + 3 * (x1 - curve.sx);
    const y = 3 * (3 * y1 + curve.dy - 3 * y2 - curve.sy) * Math.pow(t, 2) + 2 * 3 * (curve.sy - 2 * y1 + y2) * t + 3 * (y1 - curve.sy);
    if(Math.abs(x) < Math.pow(10, -8)) return { x: 0, y: y };
    const rad = Math.atan2(y, x);
    const l = Math.hypot(curve.sx - curve.dx, curve.sy - curve.dy);
    return {
      x: Math.cos(rad) * l * 0.3,
      y: Math.sin(rad) * l * 0.3,
    };
  }
}

export default GraphData;
