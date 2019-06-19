<template>
  <div>
    <svg class="graph-box" @mousemove="$emit('move', $event)" @mouseup="$emit('drop', $event)" :style="`width: ${width}px; height: ${height}px;`">
      <g class="area" :transform="`matrix(${scale.x}, 0, 0, ${scale.y}, ${scale.offsetX}, ${scale.offsetY})`">
        <g class="curves">
          <g v-for="(ps, idx) of pointS" :key="`curve-${idx}`">
            <path :d="`M${pointS[idx].x},${pointS[idx].y}C${handleS[idx].x},${handleS[idx].y},${handleD[idx].x},${handleD[idx].y},${pointD[idx].x},${pointD[idx].y}`" :stroke="color" vector-effect="non-scaling-stroke" />
          </g>
        </g>
        <g class="handle">
          <g v-for="(hs, idx) of handleS" :key="`handle-${idx}`">
            <g v-if="(handleS[idx].x !== pointS[idx].x) || (handleS[idx].y !== pointS[idx].y)">
              <line :x1="pointS[idx].x" :y1="pointS[idx].y" :x2="handleS[idx].x" :y2="handleS[idx].y" vector-effect="non-scaling-stroke" />
              <circle :cx="handleS[idx].x" :cy="handleS[idx].y" :r="3 / scale.x" :fill="handleColor" vector-effect="non-scaling-stroke" />
            </g>
            <g v-if="(handleD[idx].x !== pointD[idx].x) || (handleD[idx].y !== pointD[idx].y)">
              <line :x1="pointD[idx].x" :y1="pointD[idx].y" :x2="handleD[idx].x" :y2="handleD[idx].y" vector-effect="non-scaling-stroke" />
              <circle :cx="handleD[idx].x" :cy="handleD[idx].y" :r="3 / scale.x" :fill="handleColor" vector-effect="non-scaling-stroke" />
            </g>
          </g>
        </g>
        <g class="point">
          <circle v-if="pointS[0]" :cx="pointS[0].x" :cy="pointS[0].y" :r="4 / scale.x" :fill="color" vector-effect="non-scaling-stroke" />
          <g v-for="(point, idx) of pointD" :key="`point-${idx}`">
            <circle :cx="point.x" :cy="point.y" :r="4 / scale.x" :fill="color" vector-effect="non-scaling-stroke" />
          </g>
        </g>
        <g class="curves0">
          <g v-for="(ps, idx) of pointS" :key="`curve0-${idx}`">
            <path :d="`M${pointS[idx].x},${pointS[idx].y}C${handleS[idx].x},${handleS[idx].y},${handleD[idx].x},${handleD[idx].y},${pointD[idx].x},${pointD[idx].y}`" @mousemove="MouseMove('curve', idx, $event)" @mousedown="AddStart(idx, $event)" stroke="white" stroke-width="8" opacity="0" />
          </g>
        </g>
        <g class="handle0">
          <g v-for="(hs, idx) of handleS" :key="`handle0-${idx}`">
            <g v-if="(handleS[idx].x !== pointS[idx].x) || (handleS[idx].y !== pointS[idx].y)">
              <circle :cx="handleS[idx].x" :cy="handleS[idx].y" :r="8 / scale.x" @mousedown="$emit('drag', 's' + idx)" opacity="0" />
            </g>
            <g v-if="(handleD[idx].x !== pointD[idx].x) || (handleD[idx].y !== pointD[idx].y)">
              <circle :cx="handleD[idx].x" :cy="handleD[idx].y" :r="8 / scale.x" @mousedown="$emit('drag', 'd' + idx)" opacity="0" />
            </g>
          </g>
        </g>
        <g class="point0">
          <circle v-if="pointS[0]" :cx="pointS[0].x" :cy="pointS[0].y" :r="8 / scale.x" @mousedown="$emit('drag', 'p0')" @mousemove="MouseMove('point', 0, $event)" opacity="0" />
          <g v-for="(point, idx) of pointD" :key="`point0-${idx}`">
            <circle :cx="point.x" :cy="point.y" :r="8 / scale.x" @mousedown="$emit('drag', 'p' + (idx + 1))" @mousemove="MouseMove('point', idx + 1, $event)" @mouseleave="mouseOverIndex = -1" opacity="0" />
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
  export default {
    props: {
      scale: {
        type: Object,
        required: true,
      },
      pointS: {
        type: Array,
        required: true,
      },
      pointD: {
        type: Array,
        required: true,
      },
      handleS: {
        type: Array,
        required: true,
      },
      handleD: {
        type: Array,
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
        mouseOverIndex: -1,
        mouseOverType: '',
      };
    },
    created() {
      window.addEventListener('resize', this.Resize.bind(this));
      window.addEventListener('mouseup', this.Cancel.bind(this));
      window.addEventListener('keydown', this.KeyDown.bind(this));
    },
    mounted() {
      this.Resize();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.Resize.bind(this));
      window.removeEventListener('mouseup', this.Cancel.bind(this));
      window.removeEventListener('keydown', this.KeyDown.bind(this));
    },
    methods: {
      Resize() {
        this.width = this.$el.parentElement.clientWidth;
        this.height = this.$el.parentElement.clientHeight;
        this.$emit('resize', this.width, this.height);
      },
      Cancel() {
        if(this.addTimer) {
          clearTimeout(this.addTimer);
          this.addTimer = null;
        }
        this.$emit('release');
      },
      AddStart(idx, ev) {
        this.addTimer = setTimeout(() => {
          this.addTimer = null;
          this.$emit('add', idx, ev);
        }, 1000);
      },
      KeyDown(ev) {
        if((ev.key === 'Backspace') || (ev.key === 'Delete')) {
          if((this.mouseOverIndex < 0) || (this.mouseOverType !== 'point')) return;
          this.$emit('remove', this.mouseOverIndex);
          this.mouseOverIndex = -1;
          return;
        }
        if((ev.key === 'a') || (ev.key === 'A')) {
          if((this.mouseOverIndex < 0) || (this.mouseOverType !== 'curve')) return;
          this.$emit('add', this.mouseOverIndex, this.mouseOverEvent);
          this.mouseOverIndex = -1;
          return;
        }
      },
      MouseMove(type, idx, ev) {
        this.mouseOverIndex = idx;
        this.mouseOverType = type;
        this.mouseOverEvent = ev;
      },
    },
  };
</script>

<style scoped>
  .graph-box {
    position: absolute;
  }
  
  .curves {
    fill: none;
    stroke-width: 2px;
  }

  .handle {
    fill: none;
    stroke: #aaa;
    stroke-width: 1px;
  }

</style>
