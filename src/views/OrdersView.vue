<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Download } from '@element-plus/icons-vue'
import { appState } from '../data/repository'
import { currency, shortDate } from '../utils'
import type { Order, OrderStatus } from '../types'

const router=useRouter(),keyword=ref(''),status=ref('全部狀態'),dateRange=ref<[Date,Date]|null>(null),page=ref(1)
const pageSize=10
const labels:Record<OrderStatus,string>={pending:'待付款',processing:'待出貨',shipped:'已出貨',completed:'已完成',cancelled:'已取消',returned:'已退貨'}
const types:Record<OrderStatus,'warning'|'primary'|'success'|'info'|'danger'>={pending:'warning',processing:'primary',shipped:'primary',completed:'success',cancelled:'info',returned:'danger'}
const filtered=computed(()=>appState.orders.filter(o=>{
  const createdAt=new Date(o.createdAt)
  const inRange=!dateRange.value||(createdAt>=dateRange.value[0]&&createdAt<=new Date(dateRange.value[1].setHours(23,59,59,999)))
  return (!keyword.value||o.id.includes(keyword.value)||o.customerName.includes(keyword.value))&&(status.value==='全部狀態'||o.status===status.value)&&inRange
}))
const paged=computed(()=>filtered.value.slice((page.value-1)*pageSize,page.value*pageSize))
watch([keyword,status,dateRange],()=>{page.value=1})
const openOrder = (row: Order) => router.push(`/orders/${row.id}`)
function exportOrders(){
  const escape=(value:string|number)=>`"${String(value).replaceAll('"','""')}"`
  const rows=[['訂單編號','建立時間','會員','商品','金額','狀態'],...filtered.value.map(order=>[order.id,order.createdAt,order.customerName,order.items.map(item=>`${item.name} x${item.quantity}`).join(' / '),order.total,labels[order.status]])]
  const csv='\uFEFF'+rows.map(row=>row.map(escape).join(',')).join('\n')
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}))
  const link=document.createElement('a')
  link.href=url
  link.download=`orders-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>
<template>
  <section data-testid="orders-page">
    <Teleport to="#page-actions"><el-button :icon="Download" data-testid="export-orders" @click="exportOrders">匯出報表</el-button></Teleport>
    <div class="order-stats"><div v-for="x in [{l:'待付款',s:'pending'},{l:'待出貨',s:'processing'},{l:'配送中',s:'shipped'},{l:'本月完成',s:'completed'}]" :key="x.s"><span>{{x.l}}</span><strong>{{appState.orders.filter(o=>o.status===x.s).length}}</strong></div></div>
    <article class="table-panel"><div class="filters"><el-input v-model="keyword" :prefix-icon="Search" placeholder="搜尋訂單編號或會員" data-testid="order-search" clearable/><el-select v-model="status"><el-option label="全部狀態" value="全部狀態"/><el-option v-for="(label,key) in labels" :key="key" :label="label" :value="key"/></el-select><el-date-picker v-model="dateRange" type="daterange" start-placeholder="開始日期" end-placeholder="結束日期"/></div>
      <el-table :data="paged" @row-click="openOrder">
        <el-table-column prop="id" label="訂單編號" min-width="190"><template #default="{row}"><strong class="order-id">{{row.id}}</strong><small>{{shortDate(row.createdAt)}}</small></template></el-table-column>
        <el-table-column label="會員" min-width="150"><template #default="{row}"><div class="customer"><span>{{row.customerName.slice(0,1)}}</span><strong>{{row.customerName}}</strong></div></template></el-table-column>
        <el-table-column label="商品" min-width="190"><template #default="{row}">{{row.items[0].name}}<small v-if="row.items.length>1">另 {{row.items.length-1}} 項</small></template></el-table-column>
        <el-table-column label="金額" width="120"><template #default="{row}"><strong>{{currency(row.total)}}</strong></template></el-table-column>
        <el-table-column label="狀態" width="110"><template #default="{row}"><el-tag round :type="types[row.status as OrderStatus]">{{labels[row.status as OrderStatus]}}</el-tag></template></el-table-column>
        <el-table-column align="right" width="90"><template #default><el-button link type="primary">查看 →</el-button></template></el-table-column>
      </el-table><div class="table-footer"><span>共 {{filtered.length}} 筆訂單</span><el-pagination v-model:current-page="page" layout="prev, pager, next" :total="filtered.length" :page-size="pageSize"/></div>
    </article>
  </section>
</template>
<style scoped>
.order-stats{display:grid;grid-template-columns:repeat(4,1fr);background:#173425;color:white;border-radius:16px;margin-bottom:18px}.order-stats div{padding:20px 25px;display:flex;justify-content:space-between;align-items:center;border-right:1px solid #ffffff18}.order-stats div:last-child{border:0}.order-stats span{font-size:12px;color:#abc0b2}.order-stats strong{font-size:25px;color:#e7b36c}.table-panel{background:white;border:1px solid #e4e9e3;border-radius:16px;overflow:hidden}.filters{padding:18px;display:grid;grid-template-columns:1fr 160px 260px;gap:10px;border-bottom:1px solid #edf0ec}.order-id{display:block;color:#2b5e42}.el-table small{display:block;font-size:10px;color:#909991;margin-top:4px}.customer{display:flex;align-items:center;gap:9px}.customer span{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:#e8efe9;color:#35684a;font-weight:700}.table-footer{padding:15px 18px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#8b958e}:deep(.el-table__row){cursor:pointer}@media(max-width:800px){.filters{grid-template-columns:1fr}.order-stats{grid-template-columns:repeat(2,1fr)}.order-stats div:nth-child(2){border-right:0}}
</style>
