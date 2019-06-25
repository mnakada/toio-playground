<template>
  <el-container>
    <div class="drop-area" :class="[{'is-drag': isDrag }]" @dragleave.prevent.capture="isDrag=false" @dragover.prevent.capture="isDrag=true" @drop.prevent.capture="ImportFile">
      <el-header height="50px">
        <el-row>
          <el-col span="12">
            <h3>
              {{ config.description }} Ver.{{ config.version }}
            </h3>
          </el-col>
          <el-col span="12">
            <div class="well">
              <ElForm :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="40%" label-position="left" @validate="Validated">
                <input @change="ImportFile" id="import" type="file" accept=".tpf" style="display:none">
                <ElButton class="file-button" type="default" @click="Import" plain size="small">
                  Import file
                </ElButton>
                <ElButton class="file-button" type="default" @click="exportModal = true" :disabled="!graph" plain size="small">
                  Export file
                </ElButton>
                <ElButton class="file-button" type="default" @click="Clear" :disabled="!graph" plain size="small">
                  Clear
                </ElButton>
                <ElButton class="file-button" type="default" @click="Run" :disabled="!graph" plain size="small">
                  Run
                </ElButton>
                <ElDialog title="Export file" :visible.sync="exportModal" :show-close="false">
                  <ElFormItem label="file name" prop="exportFile">
                    <ElInput type="text" name="exportFile" v-model="ruleForm.exportFile" size="small" />
                  </ElFormItem>
                  <div slot="footer" class="dialog-footer">
                    <ElButton type="default" @click="exportModal = false">
                      Cancel
                    </ElButton>
                    <ElButton type="danger" @click="Export" plain>
                      Export
                    </ElButton>
                  </div>
                </ElDialog>
              </ElForm>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <trajectory :data="trajectory" color="red" />
        <top-view :data="graph" color="blue" handle-color="#eee" curve="position" />
      </el-main>
    </div>
  </el-container>
</template>

<script>
  import GraphData from '../js/GraphData';
  import TopView from './TopView.vue';
  import Trajectory from './Trajectory.vue';
  import { Container, Header, Main, Row, Col, Button, Form, FormItem, Dialog, Input } from 'element-ui';
  import 'element-ui/lib/theme-chalk/container.css';
  import 'element-ui/lib/theme-chalk/header.css';
  import 'element-ui/lib/theme-chalk/aside.css';
  import 'element-ui/lib/theme-chalk/main.css';
  import 'element-ui/lib/theme-chalk/row.css';
  import 'element-ui/lib/theme-chalk/col.css';
  import 'element-ui/lib/theme-chalk/button.css';
  import 'element-ui/lib/theme-chalk/form.css';
  import 'element-ui/lib/theme-chalk/dialog.css';
  import 'element-ui/lib/theme-chalk/input.css';

  export default {
    components: {
      TopView,
      Trajectory,
      ElContainer: Container,
      ElHeader: Header,
      ElMain: Main,
      ElRow: Row,
      ElCol: Col,
      ElButton: Button,
      ElForm: Form,
      ElFormItem: FormItem,
      ElDialog: Dialog,
      ElInput: Input,
    },
    data() {
      return {
        config: {
          description: null,
          version: null,
        },
        graph:null,
        trajectory: {
          position: [],
          area: {
            x: 0,
            y: 0,
            width: 500,
            height: 500,
          },
        },
        isDrag: false,
        exportModal: false,
        ruleForm: {
          exportFile: 'Untitled.tpf',
        },
        rules: {
          exportFile: [
            { required: true, type: 'string', min: 5, message: '5文字以上でファイル名を入れてください。', trigger: [ 'blur', 'change' ] },
            { pattern: /^.+\.tpf$/, message: '拡張子を.tpfにしてください。', trigger: [ 'blur', 'change' ] },
          ],
        },
        ruleValid: {
          exportFile: true,
        },
      };
    },
    computed: {
      rulesValid() {
        for(const v in this.ruleValid) {
          if(!this.ruleValid[v]) return false;
        }
        return true;
      },
    },
    mounted() {
      this.graph = new GraphData({
        curves: [],
        area: {
          x: 0,
          y: 0,
          width: 500,
          height: 500,
        },
      });
      this.reader = new FileReader();
      this.importElement = document.getElementById('import');
      Socket.on('config', (config) => {
        this.config = config;
      });
      Socket.on('move', (data) => {
        this.trajectory.position.push(data);
      });
      Socket.on('button', (data) => {
        this.graph.Add(-1, data.x, data.y);
      });
    },
    methods: {
      Validated(prop, valid) {
        this.ruleValid[prop] = valid;
      },
      Import() {
        this.importElement.click();
      },
      ImportFile(ev) {
        this.isDrag = false;
        const fileList = ev.target.files || ev.dataTransfer.files;
        if(fileList.length !== 1) return;

        this.reader.onloadend = (e) => {
          if(e.target.readyState === FileReader.DONE) {
            this.graph = new GraphData(JSON.parse((new TextDecoder).decode(this.reader.result)));
          }
          ev.target.value = null;
        };
        this.reader.readAsArrayBuffer(fileList[0]);
      },
      Export() {
        this.exportModal = false;
        const el = document.createElement('a');
        el.href = URL.createObjectURL(new Blob([JSON.stringify(this.graph, null, 2)], { type: 'text/plain' }));
        el.download = this.ruleForm.exportFile;
        el.style.display = 'none';
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
      },
      Clear() {
        this.graph.Clear();
        this.$set(this.trajectory, 'position', []);
        this.$set(this.trajectory, 'point', []);
      },
      Run() {
        this.$set(this.trajectory, 'position', []);
        this.$set(this.trajectory, 'point', []);
        const pathElements = document.querySelectorAll('#top-view svg .curves path');
        let totalLength = 0;
        const length = [0];
        for(const el of pathElements) {
          totalLength += el.getTotalLength();
          length.push(totalLength);
        }

        const rpm = 150;
        const tick = 0.1;
        const speed = rpm / 60 * 12.5 * Math.PI; // mm/sec

        const position = [];
        let t = 0;
        let i = 0;
        for(let n = 0; n <= totalLength; n += speed * tick) {
          if(n > length[i + 1]) i++;
          const pos = pathElements[i].getPointAtLength(n - length[i]);
          position.push({time: t, x: pos.x , y: pos.y });
          t += tick;
        }
        Socket.emit('run', position);
      },
    },
  };
</script>

<style scoped>
  .contents-area {
    width: 100vw;
    height: 100vh;
  }

  .drop-area {
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
  }

  .drop-area.is-drag {
    box-shadow: rgba(64, 64, 64, 1) 0px 0px 200px 10px inset, rgba(64, 64, 64, 0) 0px 0px 0px 2px inset;
    opacity: 1;
    visibility: visible;

  }

  .el-header {
    background-color: #00AECA;
    line-height: 30px;
    color: #f0f0f0;
    user-select: none;
  }

  .well {
    margin: 8px;
    float: right;
  }

  .el-main {
    height: calc(100vh - 50px);
    width: 100%;
    padding: 0px;
    user-select: none;
  }

</style>
