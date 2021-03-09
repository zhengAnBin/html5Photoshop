<template>
  <!-- nav -->
  <el-row>
    <el-col 
      v-for="item in menuList" 
      v-bind:key="item.name"
      :span="1"
      class="menuItem"
    >
      <span v-if="!item.children" class="el-dropdown" @click="item.onClick">
        <i :class="{[`${item.icon}`]: item.icon}" class="el-icon--right"></i>
      </span>
      <el-dropdown trigger='click' v-else>
        <span>
          <i :class="{[`${item.icon}`]: item.icon}" class="el-icon--right"></i>
        </span>
        <template #dropdown v-if="item.children">
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="child in item.children" 
              v-bind:key="child.name"
              @click="child.onClick"
            >{{ child.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>
    <el-col class="menuItem" span="1">
      <div class="el-dropdown">
        <div class="center-box">
          前景色：
          <el-color-picker  
            v-model="color.backgroundColor" 
            size="mini"
          />
        </div>
      </div>
    </el-col>
    <el-col class="menuItem" span="1">
      <div class="el-dropdown">
        <div class="center-box">
          背景色：
          <el-color-picker 
            v-model="color.foregroundColor" 
            size="mini"
          />
        </div>
      </div>
    </el-col>
  </el-row>

  <!-- document -->
  <div id='layer'></div>

  <!-- model -->
  <el-dialog title="新建文档" v-model="dialogFormVisible">
    <el-form v-model="form">
      <el-form-item label="宽度">
        <el-input autocomplete="off" v-model="form.width"></el-input>
      </el-form-item>
      <el-form-item label="高度">
        <el-input autocomplete="off" v-model="form.height"></el-input>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type">
          <el-option label="白色" value="white" />
          <el-option label="黑色" value="black" />
          <el-option label="透明" value="transparent" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="newDocument">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">

import { defineComponent, ref, reactive, watch, onMounted } from 'vue'
import { initShape, setPalette, getPalette, createLayer, setShapeType } from './handle'

export default defineComponent({
  name: 'App',
  setup(){

    const dialogFormVisible = ref(false)

    const form = ref({
      width: 500,
      height: 500,
      type: 'white'
    })

    const [ backgroundColor, foregroundColor ] = getPalette()
    const color = reactive({
      backgroundColor,
      foregroundColor
    })

    watch(color, (current) => {
      setPalette('background', current.backgroundColor)
      setPalette('foreground', current.foregroundColor)
    })

    let canvas: HTMLCanvasElement, layerIndex: number

    const menuList = ref([
      {
        name: '新建',
        icon: 'el-icon-plus',
        onClick: () => {
          dialogFormVisible.value = true
        }
      },
      {
        name: '选框工具',
        icon: 'el-icon-full-screen',
        children: [{
          name: '矩形',
          onClick: () => {
            if(!canvas) { return ; }
            setShapeType('rect dottedLine')

            const layer = document.getElementById('layer') as HTMLElement
            layer.style.cursor = 'crosshair'
          }
        }, {
          name: '圆形',
          onClick: () => {
            if(!canvas) { return ; }
            setShapeType('ellipse dottedLine')

            const layer = document.getElementById('layer') as HTMLElement
            layer.style.cursor = 'crosshair'
          }
        }]
      }
    ])

    // 创建文档
    const newDocument = () => {
      const formResult = form.value

      const { layer, layerIndex: index } = createLayer(
        formResult.width, 
        formResult.height,
        formResult.type as any,
        document.getElementById('layer') as HTMLElement,
      )

      canvas = layer
      layerIndex = index
      dialogFormVisible.value = false
      
      // TODO: 触发时机?
      initShape(canvas, layerIndex)
    }

    onMounted(() => newDocument())
    
    return {
      menuList,
      dialogFormVisible,
      form,
      newDocument,
      color
    }
  }
})
</script>
 
<style>
  *{
    margin: 0;
    padding: 0;
  }
  #app {
    height: 100vh;
    width: 100%;
  }
  .menuItem{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px;
    cursor: pointer;
    padding-left: 5px;
  }
  body {
    background: #1D1E22;
  }
  #layer {
    width: 100%;
    height: calc(100vh - 30px);
    position: relative;
  }
  .center-layer{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .center-box {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>