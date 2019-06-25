<template>
  <div id="top-view" class="graph" v-if="data">
    <bezier-curve-editor :scale="scale" :point-s="pointS" :point-d="pointD" :handle-s="handleS" :handle-d="handleD" :color="color" :handle-color="handleColor" @drag="Drag" @drop="Drop" @move="Move" @release="Release" @add="Add" @remove="Remove" @resize="Resize" />
  </div>
</template>

<script>
  import BezierCurveEditor from './BezierCurveEditor.vue';

  export default {
    components: {
      BezierCurveEditor,
    },
    props: {
      data: {
        type: Object,
        required: true,
      },
      color: {
        type: String,
        default: 'black',
      },
      handleColor: {
        type: String,
        default: 'white',
      },
    },
    data() {
      return {
        width: 100,
        height: 100,
        dragIndex: null,
      };
    },
    computed: {
      scale() {
        const scale = {};
        if(this.width / this.data.area.width < this.height / this.data.area.height) {
          scale.x = this.width / this.data.area.width;
          scale.y = scale.x;
          scale.offsetX = 0;
          scale.offsetY = (this.height - this.data.area.height * scale.y) / 2;
        } else {
          scale.y = this.height / this.data.area.height;
          scale.x = scale.y;
          scale.offsetY = 0;
          scale.offsetX = (this.width - this.data.area.width * scale.x) / 2;
        }
        return scale;
      },
      pointS() {
        const pointS = [];
        if(!this.data.curves.length && this.data.lastPoint) {
          pointS.push(this.data.lastPoint);
        }
        for(const curve of this.data.curves) {
          pointS.push({
            x: curve.sx,
            y: curve.sy,
          });
        }
        return pointS;
      },
      pointD() {
        const pointD = [];
        for(const curve of this.data.curves) {
          pointD.push({
            x: curve.dx,
            y: curve.dy,
          });
        }
        return pointD;
      },
      handleS() {
        const handleS = [];
        for(const curve of this.data.curves) {
          const x1 = curve.x1;
          const y1 = curve.y1;
          handleS.push({
            x: curve.sx + x1,
            y: curve.sy + y1,
          });
        }
        return handleS;
      },
      handleD() {
        const handleD = [];
        for(const curve of this.data.curves) {
          const x2 = curve.x2;
          const y2 = curve.y2;
          handleD.push({
            x: curve.dx + x2,
            y: curve.dy + y2,
          });
        }
        return handleD;
      },
    },
    methods: {
      Resize(width, height) {
        this.width = width;
        this.height = height;
      },
      Drag(idx) {
        this.dragIndex = idx;
      },
      Move(ev) {
        if(this.dragIndex === null) return;
        const item = this.dragIndex.charAt(0);
        const idx = parseInt(this.dragIndex.substr(1));
        const nx = (ev.offsetX - this.scale.offsetX) / this.scale.x;
        const ny = (ev.offsetY - this.scale.offsetY) / this.scale.y;
        if(item === 'p') {
          if(idx < this.data.curves.length) {
            this.data.ChangeCurve(idx, {sx: nx, sy: ny});
          }
          if(idx > 0) {
            this.data.ChangeCurve(idx - 1, {dx: nx, dy: ny});
          }
        }
        if(item === 's') {
          const x1 = nx - this.data.curves[idx].sx;
          const y1 = ny - this.data.curves[idx].sy;
          this.data.ChangeCurve(idx,  {x1, y1 });
          if((this.data.curves[idx].type1 === 'auto') && (idx > 0)) {
            const x2 = this.data.curves[idx - 1].dx - nx;
            const y2 = this.data.curves[idx - 1].dy - ny;
            this.data.ChangeCurve(idx - 1, { x2, y2 });
          }
        }
        if(item === 'd') {
          const x2 = nx - this.data.curves[idx].dx;
          const y2 = ny - this.data.curves[idx].dy;
          this.data.ChangeCurve(idx, {x2, y2 });
          if((this.data.curves[idx].type2 === 'auto') && (idx < this.data.curves.length - 1)) {
            const x1 = this.data.curves[idx + 1].sx - nx;
            const y1 = this.data.curves[idx + 1].sy - ny;
            this.data.ChangeCurve(idx + 1, {x1, y1 });
          }
        }
      },
      Drop(ev) {
        if(this.dragIndex === null) return;
        this.Move(ev);
        this.dragIndex = null;
      },
      Release() {
        this.dragIndex = null;
      },
      Add(idx, ev) {
        const x = (ev.offsetX - this.scale.offsetX) / this.scale.x;
        const y = (ev.offsetY - this.scale.offsetY) / this.scale.y;
        this.data.Add(idx, x, y);
      },
      Remove(idx) {
        this.data.Remove(idx);
      },
    },
  };
</script>

<style scoped>
  .graph {
    height: calc(100% - 60px);
    width: calc(100% - 10px);
    border: 1px solid #888;
    box-sizing: border-box;
    margin: 5px;
    position: fixed;
  }
</style>
