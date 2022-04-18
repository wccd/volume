----------app.vue---------
  <script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref, onMounted } from "vue";
import { Draw } from './ts/draw'
const cav = ref()
const isMobile = ref()

isMobile.value = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

let draw: any
onMounted(() => {
  let canvas = cav.value;
  canvas.width = 300
  canvas.height = 300
  let ctx:CanvasRenderingContext2D = canvas.getContext('2d')
  draw = new Draw({
    ctx,
    canvasWidth: 300,
    canvasHeight: 300,
    iconWidth: 50,
    iconHeight: 50,
    duration: 3,
    barWidth: 200,
    barHeight: 6,
    ballDuration: 1
  });
  draw.draw()
})

const clickCanvas = (e: MouseEvent) => {
  if(e.buttons != 1) return
  let x = e.offsetX,
      y = e.offsetY;
  draw.iconMouseDown({x, y})
  document.onmouseup = () => {
    document.onmouseup = null
    draw.iconMouseUp({x, y})
  }
}
const touchCanvas = (e: TouchEvent) => {
  const iconWidth = 50;
  let canvas = cav.value,
      canvasHeight = canvas.height;
  let x = iconWidth / 2,
      y = iconWidth / 2 + canvasHeight / 2;
  draw.iconMouseDown({x, y})
  document.ontouchend = () => {
    document.ontouchend = null
    draw.iconMouseUp({x, y})
  }
}
const asd = (e: MouseEvent) => {
  e.preventDefault()
  draw.finalClean()
}


const forcePower = ref()
const forceAngle = ref()
const maxPower = () => {
  forcePower.value = !forcePower.value
  draw.hackData('icon', {
    power: forcePower.value,
  })
}
const maxAngle = () => {
  forceAngle.value = !forceAngle.value
  draw.hackData('icon', {
    angle: forceAngle.value,
  })
}
</script>

<template>
  <div class="bg"></div>
  <div class="menu" style="top: 10px">
    <p class="menu-title">说明：</p>
    <p class="menu-content">{{ isMobile ? '长按按钮蓄力，松开发射小球' : '在喇叭icon上按住鼠标左键蓄力，松开发射小球。右键可以强制终止动画' }}</p>
  </div>
  <div class="menu" style="top: 150px">
    <p class="menu-title">作弊器：</p>
    <div class="btn" :class="{'active': forcePower}" style="top: 30px; left: 0" @click="maxPower">设置最大力气</div>
    <div class="btn" :class="{'active': forceAngle}" style="top: 70px; left: 0" @click="maxAngle">设置最匹配角度</div>
  </div>
  <canvas @mousedown="clickCanvas" @contextmenu="asd" class="wcanvas" ref="cav"></canvas>
  <div class="mobile-btn btn" v-if="isMobile" @touchstart="touchCanvas">长按蓄力</div>
</template>

<style lang="stylus"> 
  html,body,div,p
    padding 0
    margin 0
    user-select none
  .bg
    width 100vw
    height 100vh
    background #000
  .wcanvas
    position absolute
    left 20px
    top 300px
  .btn
    padding 8px 10px
    height 32px
    color #fff
    font-size 14px
    background #878787
    text-align center
    cursor pointer
    box-sizing border-box
    margin-bottom 10px
  .btn.active
    background #027ffe
  .menu
    position absolute
    left 20px
    top 20px
    width 200px
    height 200px
    .menu-title
      margin-bottom 10px
      font-size 16px
      font-width 700    
      color #fff
    .menu-content
      font-size 14px
      color #fff
  .mobile-btn
    position absolute
    bottom 20px
    left 50%
    background #666
    transform translateX(-50%)

</style>