<template>
  <div v-if="data" class="graph">
    <svg class="graph-box" :style="`width: ${width}px; height: ${height}px;`">
      <g>
        <g class="area" :transform="`matrix(${scale.x}, 0, 0, ${scale.y}, ${scale.offsetX}, ${scale.offsetY})`">
          <rect x="45" y="45" width="410" height="410" fill="#e0ffe0" />
          <g class="dots" v-for="(pos, idx) of data.position" :key="`dots-${idx}`" :fill="color">
            <circle :cx="pos.x" :cy="pos.y" r="1" />
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
  export default {
    props: {
      data: {
        type: Object,
        required: true,
      },
      color: {
       type: String,
        default: 'black',
      },
    },
    data() {
      return {
        width: 100,
        height: 100,
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
    },
    created() {
      window.addEventListener('resize', this.Resize.bind(this));
    },
    mounted() {
      this.Resize();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.Resize.bind(this));
    },
    methods: {
      Resize() {
        this.width = this.$el.clientWidth;
        this.height = this.$el.clientHeight;
        this.$emit('resize', this.width, this.height);
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
