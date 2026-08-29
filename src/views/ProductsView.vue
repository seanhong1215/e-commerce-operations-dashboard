<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, EditPen, MoreFilled } from '@element-plus/icons-vue'
import { appState, productRepository } from '../data/repository'
import { currency, shortDate } from '../utils'
import type { ProductStatus } from '../types'

const router=useRouter(), keyword=ref(''), category=ref('全部分類'), status=ref('全部狀態'), page=ref(1)
const pageSize=10
const statusMap:Record<ProductStatus,{label:string;type:'success'|'info'|'warning'}>={active:{label:'上架中',type:'success'},inactive:{label:'已下架',type:'info'},draft:{label:'草稿',type:'warning'}}
const filtered=computed(()=>appState.products.filter(item=>(!keyword.value||item.name.toLowerCase().includes(keyword.value.toLowerCase())||item.skus.some(s=>s.code.toLowerCase().includes(keyword.value.toLowerCase())))&&(category.value==='全部分類'||item.category===category.value)&&(status.value==='全部狀態'||item.status===status.value)))
const paged=computed(()=>filtered.value.slice((page.value-1)*pageSize,page.value*pageSize))
watch([keyword,category,status],()=>{page.value=1})
const stock=(id:string)=>appState.products.find(p=>p.id===id)?.skus.filter(s=>s.enabled).reduce((sum,s)=>sum+s.stock,0)??0
async function updateStatus(id:string,next:ProductStatus){await productRepository.setStatus(id,next);ElMessage.success(next==='active'?'商品已上架':'商品已下架')}
async function archive(id:string){await ElMessageBox.confirm('商品將保留在歷史訂單中，並改為下架狀態。','封存商品',{type:'warning'});await updateStatus(id,'inactive')}
</script>

<template>
  <section data-testid="products-page">
    <Teleport to="#page-actions"><el-button type="primary" :icon="Plus" data-testid="new-product" @click="router.push('/products/new')">新增商品</el-button></Teleport>
    <div class="summary-strip"><div><span>全部商品</span><strong>{{appState.products.length}}</strong></div><div><span>上架中</span><strong>{{appState.products.filter(x=>x.status==='active').length}}</strong></div><div><span>低庫存 SKU</span><strong class="warn">{{appState.products.flatMap(x=>x.skus).filter(x=>x.stock<=x.safetyStock).length}}</strong></div><div><span>總庫存</span><strong>{{appState.products.flatMap(x=>x.skus).reduce((s,x)=>s+x.stock,0)}}</strong></div></div>
    <article class="table-panel">
      <div class="filters"><el-input v-model="keyword" :prefix-icon="Search" placeholder="搜尋商品名稱或 SKU" clearable data-testid="product-search"/><el-select v-model="category"><el-option v-for="x in ['全部分類','服飾','包袋','生活']" :key="x" :label="x" :value="x"/></el-select><el-select v-model="status"><el-option label="全部狀態" value="全部狀態"/><el-option label="上架中" value="active"/><el-option label="已下架" value="inactive"/><el-option label="草稿" value="draft"/></el-select></div>
      <el-table :data="paged" row-key="id">
        <el-table-column label="商品" min-width="290"><template #default="{row}"><div class="product-cell"><img :src="row.image" alt=""><div><strong>{{row.name}}</strong><span>{{row.category}} · {{row.skus.length||1}} 個 SKU</span></div></div></template></el-table-column>
        <el-table-column label="售價" width="120"><template #default="{row}"><strong>{{currency(row.price)}}</strong></template></el-table-column>
        <el-table-column label="庫存" width="130"><template #default="{row}"><div class="stock-cell"><strong :class="{low:stock(row.id)<15}">{{stock(row.id)}}</strong><span>安全庫存 {{row.skus[0]?.safetyStock??0}}</span></div></template></el-table-column>
        <el-table-column label="狀態" width="110"><template #default="{row}"><el-tag round :type="statusMap[row.status as ProductStatus].type">{{statusMap[row.status as ProductStatus].label}}</el-tag></template></el-table-column>
        <el-table-column label="更新時間" width="140"><template #default="{row}">{{shortDate(row.updatedAt)}}</template></el-table-column>
        <el-table-column align="right" width="140"><template #default="{row}"><el-button circle :icon="EditPen" aria-label="編輯商品" @click="router.push(`/products/${row.id}/edit`)"/><el-dropdown trigger="click"><el-button circle :icon="MoreFilled"/><template #dropdown><el-dropdown-menu><el-dropdown-item v-if="row.status!=='active'" @click="updateStatus(row.id,'active')">上架</el-dropdown-item><el-dropdown-item v-else @click="updateStatus(row.id,'inactive')">下架</el-dropdown-item><el-dropdown-item divided @click="archive(row.id)">封存</el-dropdown-item></el-dropdown-menu></template></el-dropdown></template></el-table-column>
      </el-table><div class="table-footer"><span>顯示 {{filtered.length}} 筆商品</span><el-pagination v-model:current-page="page" layout="prev, pager, next" :total="filtered.length" :page-size="pageSize"/></div>
    </article>
  </section>
</template>
<style scoped>
.summary-strip{display:grid;grid-template-columns:repeat(4,1fr);background:white;border:1px solid #e4e9e3;border-radius:15px;margin-bottom:18px}.summary-strip div{padding:17px 22px;border-right:1px solid #edf0ec;display:flex;justify-content:space-between;align-items:center}.summary-strip div:last-child{border:0}.summary-strip span{font-size:12px;color:#7c867f}.summary-strip strong{font-size:20px}.summary-strip .warn{color:#ca6948}.table-panel{background:white;border:1px solid #e4e9e3;border-radius:16px;overflow:hidden}.filters{display:grid;grid-template-columns:minmax(220px,1fr) 160px 150px;gap:10px;padding:18px;border-bottom:1px solid #edf0ec}.product-cell{display:flex;align-items:center;gap:12px}.product-cell img{width:56px;height:48px;border-radius:10px;object-fit:cover}.product-cell div,.stock-cell{display:grid}.product-cell strong{font-size:13px}.product-cell span,.stock-cell span{font-size:11px;color:#8c958e}.stock-cell strong.low{color:#c65c41}.table-footer{padding:15px 18px;display:flex;align-items:center;justify-content:space-between;color:#8c958e;font-size:12px}@media(max-width:800px){.summary-strip{grid-template-columns:repeat(2,1fr)}.filters{grid-template-columns:1fr}.summary-strip div:nth-child(2){border-right:0}}
</style>
