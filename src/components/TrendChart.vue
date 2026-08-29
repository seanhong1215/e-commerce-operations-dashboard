<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
const props=defineProps<{labels:string[];values:number[]}>()
const host=ref<HTMLElement>(), chart=ref<echarts.ECharts>()
function render(){if(!host.value)return;chart.value??=echarts.init(host.value);chart.value.setOption({grid:{left:8,right:12,top:18,bottom:24,containLabel:true},tooltip:{trigger:'axis',backgroundColor:'#173425',borderWidth:0,textStyle:{color:'#fff'}},xAxis:{type:'category',data:props.labels,boundaryGap:false,axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#8b958e',fontSize:11}},yAxis:{type:'value',splitLine:{lineStyle:{color:'#edf0ec'}},axisLabel:{color:'#8b958e',formatter:(v:number)=>`${v/1000}k`}},series:[{type:'line',data:props.values,smooth:true,symbol:'circle',symbolSize:7,lineStyle:{color:'#2d6a49',width:3},itemStyle:{color:'#2d6a49',borderColor:'#fff',borderWidth:2},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#5b997355'},{offset:1,color:'#5b997305'}])}}]})}
const resize=()=>chart.value?.resize()
onMounted(()=>{render();window.addEventListener('resize',resize)})
watch(()=>props.values,render)
onBeforeUnmount(()=>{window.removeEventListener('resize',resize);chart.value?.dispose()})
</script>
<template><div ref="host" class="trend-chart" data-testid="trend-chart"></div></template>
<style scoped>.trend-chart{height:280px;width:100%}</style>
