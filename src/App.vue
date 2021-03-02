<template>
  <el-row>
    <el-col 
      v-for="item in menuList" 
      v-bind:key="item.name"
      :span="1"
      class="menuItem"

    >
      <span v-if="!item.children" class="el-dropdown" @click="item.onClick">
          {{ item.name }}<i :class="{[`${item.icon}`]: item.icon}" class="el-icon--right"></i>
        </span>
      <el-dropdown trigger='click' v-else>
        <span>
          {{ item.name }}<i :class="{[`${item.icon}`]: item.icon}" class="el-icon--right"></i>
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
  </el-row>

  <div id='layer'></div>

  <el-dialog title="收货地址" v-model="dialogFormVisible">
    <el-form v-model="form">
      <el-form-item label="width">
        <el-input autocomplete="off" v-model="form.width"></el-input>
      </el-form-item>
      <el-form-item label="height">
        <el-input autocomplete="off" v-model="form.height"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmNew">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Shape } from './handle/handle.shape'


export default defineComponent({
  name: 'App',
  setup(){

    const dialogFormVisible = ref(false)

    const form = ref({
      width: 500,
      height: 500
    })

    let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D

    const menuList = ref([
      {
        name: '新建',
        icon: 'el-icon-plus',
        onClick: () => {
          dialogFormVisible.value = true
        }
      },
      {
        name: '图形',
        icon: 'el-icon-arrow-down',
        children: [{
          name: '矩形',
          onClick: () => {
            if(canvas) {
              const utilRect = new Shape(canvas, ctx)
              utilRect.init()
            }
          }
        }, {
          name: '圆形',
          onClick: () => {
            
          }
        }]
      }
    ])

    const confirmNew = () => {
      dialogFormVisible.value = false
      canvas = document.createElement('canvas') as HTMLCanvasElement
      canvas.width = form.value.width
      canvas.height = form.value.height
      canvas.className = 'centerCSS'
      ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      document.getElementById('layer')?.appendChild(canvas)
    }

    return {
      menuList,
      dialogFormVisible,
      form,
      confirmNew
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
  }
  body {
    background: #1D1E22;
  }
  #layer {
    width: 100%;
    height: calc(100vh - 30px);
    position: relative;
  }

  .centerCSS{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>