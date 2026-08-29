<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataAnalysis, Goods, List, User, Discount, Bell, Search, Fold, Expand, RefreshLeft } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { appState, initializeData, resetData } from '../data/repository'

const route=useRoute(), router=useRouter(), auth=useAuthStore(), collapsed=ref(false), ready=ref(false),searchOpen=ref(false),searchKeyword=ref('')
const menu=[{path:'/dashboard',label:'營運總覽',icon:DataAnalysis},{path:'/products',label:'商品管理',icon:Goods},{path:'/orders',label:'訂單管理',icon:List},{path:'/customers',label:'會員管理',icon:User},{path:'/promotions',label:'促銷管理',icon:Discount}]
const title=computed(()=>route.meta.title as string || menu.find(item=>route.path.startsWith(item.path))?.label || '營運平台')
const searchResults=computed(()=>{
  const query=searchKeyword.value.trim().toLowerCase()
  if(!query)return []
  return [
    ...appState.products.filter(item=>item.name.toLowerCase().includes(query)||item.skus.some(sku=>sku.code.toLowerCase().includes(query))).map(item=>({label:item.name,meta:`商品 · ${item.category}`,path:`/products/${item.id}/edit`})),
    ...appState.orders.filter(item=>item.id.toLowerCase().includes(query)||item.customerName.toLowerCase().includes(query)).map(item=>({label:item.id,meta:`訂單 · ${item.customerName}`,path:`/orders/${item.id}`})),
    ...appState.customers.filter(item=>item.name.toLowerCase().includes(query)||item.email.toLowerCase().includes(query)).map(item=>({label:item.name,meta:`會員 · ${item.email}`,path:'/customers'})),
  ].slice(0,8)
})
function handleShortcut(event:KeyboardEvent){if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchOpen.value=true}}
onMounted(async()=>{document.addEventListener('keydown',handleShortcut);await initializeData();ready.value=true})
onBeforeUnmount(()=>document.removeEventListener('keydown',handleShortcut))
async function doReset(){await ElMessageBox.confirm('將清除目前瀏覽器中的操作，恢復預設展示資料。','重設 Demo 資料',{confirmButtonText:'確認重設',cancelButtonText:'取消',type:'warning'});await resetData();ElMessage.success('Demo 資料已恢復');await router.replace('/dashboard')}
function logout(){auth.logout();router.push('/login')}
async function openResult(path:string){searchOpen.value=false;searchKeyword.value='';await router.push(path)}
</script>

<template>
  <div v-if="ready" class="app-frame" :class="{collapsed}">
    <aside class="sidebar">
      <div class="sidebar-brand"><span class="brand-mark">商</span><div><strong>商流</strong><small>CommerceOS</small></div></div>
      <nav><router-link v-for="item in menu" :key="item.path" :to="item.path" :data-testid="`nav-${item.path.slice(1)}`"><el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span></router-link></nav>
      <div class="sidebar-foot"><button data-testid="reset-data" @click="doReset"><el-icon><RefreshLeft /></el-icon><span>重設 Demo 資料</span></button><small>Portfolio build · 2026</small></div>
    </aside>
    <section class="workspace">
      <header class="topbar">
        <button class="icon-button" aria-label="切換側邊欄" @click="collapsed=!collapsed"><el-icon><component :is="collapsed?Expand:Fold" /></el-icon></button>
        <button class="top-search" data-testid="global-search" @click="searchOpen=true"><el-icon><Search /></el-icon><span>搜尋商品、訂單或會員</span><kbd>⌘ K</kbd></button>
        <div class="top-actions"><button class="icon-button"><el-icon><Bell /></el-icon><i></i></button><div class="profile" @click="logout"><span>SC</span><div><strong>{{ auth.user.name }}</strong><small>{{ auth.user.role }}</small></div></div></div>
      </header>
      <main class="content"><div class="page-heading"><div><p>營運管理平台</p><h1>{{ title }}</h1></div><div id="page-actions"></div></div><router-view /></main>
    </section>
    <el-dialog v-model="searchOpen" title="全域搜尋" width="560" @closed="searchKeyword=''">
      <el-input v-model="searchKeyword" :prefix-icon="Search" size="large" autofocus placeholder="輸入商品、SKU、訂單或會員" data-testid="global-search-input"/>
      <div class="search-results">
        <button v-for="result in searchResults" :key="`${result.path}-${result.label}`" @click="openResult(result.path)"><strong>{{result.label}}</strong><span>{{result.meta}}</span></button>
        <p v-if="searchKeyword&&!searchResults.length">找不到符合的資料</p>
        <p v-else-if="!searchKeyword">輸入關鍵字開始搜尋</p>
      </div>
    </el-dialog>
  </div>
  <div v-else class="boot-loader"><span></span><p>正在準備你的營運工作台…</p></div>
</template>

<style scoped>
.app-frame{min-height:100vh;display:grid;grid-template-columns:246px 1fr;background:#f4f6f3;transition:.2s}.app-frame.collapsed{grid-template-columns:78px 1fr}.sidebar{position:sticky;top:0;height:100vh;background:#173425;color:#dce8df;padding:24px 18px;display:flex;flex-direction:column;overflow:hidden}.sidebar-brand{display:flex;align-items:center;gap:12px;padding:0 8px 28px;white-space:nowrap}.brand-mark{display:grid;place-items:center;min-width:38px;height:38px;border-radius:12px;background:#e7b36c;color:#173425;font-weight:900}.sidebar-brand div{display:grid}.sidebar-brand strong{font-size:18px}.sidebar-brand small{font-size:10px;color:#8ea899;letter-spacing:.08em}.sidebar nav{display:grid;gap:6px}.sidebar nav a{height:48px;padding:0 14px;display:flex;align-items:center;gap:13px;border-radius:11px;color:#a9beaf;text-decoration:none;white-space:nowrap;font-size:14px}.sidebar nav a:hover,.sidebar nav a.router-link-active{color:white;background:#ffffff12}.sidebar nav a.router-link-active{box-shadow:inset 3px 0 #e7b36c}.sidebar nav .el-icon{font-size:19px}.sidebar-foot{margin-top:auto;display:grid;gap:16px;white-space:nowrap}.sidebar-foot button{display:flex;align-items:center;gap:12px;border:0;background:transparent;color:#9db2a4;padding:12px;cursor:pointer}.sidebar-foot small{color:#678071;padding:0 12px}.collapsed .sidebar-brand div,.collapsed .sidebar nav span,.collapsed .sidebar-foot span,.collapsed .sidebar-foot small{display:none}.workspace{min-width:0}.topbar{height:72px;padding:0 34px;display:flex;align-items:center;gap:20px;background:white;border-bottom:1px solid #e7ebe6;position:sticky;top:0;z-index:10}.icon-button{position:relative;width:38px;height:38px;border:0;border-radius:10px;background:transparent;color:#5b675f;cursor:pointer}.icon-button:hover{background:#f0f3ef}.top-search{height:40px;max-width:430px;flex:1;display:flex;align-items:center;gap:10px;padding:0 13px;border:1px solid #e1e5e0;border-radius:10px;background:white;color:#9aa29c;font-size:13px;cursor:pointer}.top-search kbd{margin-left:auto;background:#f1f3f0;border:0;padding:3px 7px;border-radius:5px}.top-actions{margin-left:auto;display:flex;align-items:center;gap:12px}.top-actions i{position:absolute;width:7px;height:7px;background:#d86b4a;border-radius:50%;top:7px;right:7px}.profile{display:flex;gap:10px;align-items:center;border-left:1px solid #e5e8e4;padding-left:18px;cursor:pointer}.profile>span{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#dce9df;color:#285b3f;font-weight:800;font-size:12px}.profile div{display:grid}.profile strong{font-size:13px}.profile small{font-size:11px;color:#929a94}.content{padding:30px 34px 50px;max-width:1560px;margin:auto}.page-heading{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px}.page-heading p{font-size:12px;color:#7a867e;margin:0 0 4px}.page-heading h1{font-size:27px;margin:0;color:#1f2d24}.search-results{display:grid;gap:7px;margin-top:14px}.search-results button{display:flex;justify-content:space-between;align-items:center;padding:13px 14px;border:1px solid #e2e7e2;border-radius:11px;background:white;text-align:left;cursor:pointer}.search-results button:hover{background:#eef5ef;border-color:#bfd0c3}.search-results span,.search-results p{font-size:12px;color:#7e8981}.boot-loader{height:100vh;display:grid;place-content:center;text-align:center;color:#5f6c63}.boot-loader span{margin:auto;width:38px;height:38px;border:3px solid #d8e2da;border-top-color:#285b3f;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:900px){.app-frame{grid-template-columns:78px 1fr}.sidebar-brand div,.sidebar nav span,.sidebar-foot span,.sidebar-foot small{display:none}.top-search{display:none}.content{padding:24px 20px}.profile div{display:none}}
</style>
