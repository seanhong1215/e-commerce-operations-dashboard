<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Lock, TrendCharts } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const email = ref('admin@commerce.demo')
const password = ref('demo2026')
const loading = ref(false)
async function submit() {
  loading.value = true
  try { await auth.login(email.value, password.value); await router.push('/dashboard'); ElMessage.success('歡迎回來，營運管理員') }
  catch (error) { ElMessage.error((error as Error).message) }
  finally { loading.value = false }
}
</script>

<template>
  <main class="login-page">
    <section class="login-story">
      <div class="brand-lockup"><span class="brand-mark">商</span><span>商流 CommerceOS</span></div>
      <div class="story-copy">
        <p class="eyebrow">OPERATIONS, IN FLOW</p>
        <h1>讓每一筆訂單，<br><em>順流而行。</em></h1>
        <p>從商品、庫存到出貨，用清楚的數據和流程，掌握商店每天的節奏。</p>
      </div>
      <div class="story-metric"><el-icon><TrendCharts /></el-icon><div><strong>+18.6%</strong><span>本月營業額成長</span></div></div>
    </section>
    <section class="login-panel">
      <div class="login-card">
        <span class="demo-chip">面試展示模式</span>
        <h2>歡迎回來</h2><p>登入你的營運工作台</p>
        <el-form label-position="top" @submit.prevent="submit">
          <el-form-item label="電子郵件"><el-input v-model="email" size="large" data-testid="email" /></el-form-item>
          <el-form-item label="密碼"><el-input v-model="password" size="large" type="password" show-password data-testid="password" /></el-form-item>
          <button class="primary-action" type="submit" :disabled="loading" data-testid="login-submit">
            <el-icon><Lock /></el-icon>{{ loading ? '登入中…' : '進入營運平台' }}<el-icon><ArrowRight /></el-icon>
          </button>
        </el-form>
        <div class="demo-note"><strong>Demo 帳號已預填</strong><span>資料只保存在這個瀏覽器，可隨時重設。</span></div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page{min-height:100vh;display:grid;grid-template-columns:1.08fr .92fr;background:#f6f7f2}.login-story{position:relative;padding:44px 7vw;color:#f8f5ec;background:radial-gradient(circle at 68% 24%,#547761 0,transparent 30%),linear-gradient(145deg,#172b21,#234b35);overflow:hidden}.login-story:after{content:'';position:absolute;width:420px;height:420px;border:1px solid #ffffff1c;border-radius:50%;right:-120px;bottom:-160px;box-shadow:0 0 0 70px #ffffff08,0 0 0 140px #ffffff05}.brand-lockup{display:flex;align-items:center;gap:12px;font-weight:700;letter-spacing:.03em}.brand-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#e9b872;color:#213b2c}.story-copy{position:absolute;top:46%;transform:translateY(-50%);max-width:650px}.eyebrow{color:#e9b872;font-size:12px;letter-spacing:.24em;font-weight:700}.story-copy h1{font-size:clamp(44px,5vw,74px);line-height:1.16;margin:20px 0;font-weight:700}.story-copy em{font-style:normal;color:#e9b872}.story-copy>p:last-child{max-width:480px;color:#cbd9d0;font-size:17px;line-height:1.8}.story-metric{position:absolute;left:7vw;bottom:48px;display:flex;gap:14px;align-items:center}.story-metric>.el-icon{font-size:26px;color:#e9b872}.story-metric div{display:grid}.story-metric strong{font-size:20px}.story-metric span{font-size:13px;color:#9fb1a6}.login-panel{display:grid;place-items:center;padding:40px}.login-card{width:min(430px,100%)}.demo-chip{display:inline-block;padding:7px 11px;border-radius:20px;background:#e6efe8;color:#2d6746;font-size:12px;font-weight:700}.login-card h2{font-size:36px;margin:24px 0 8px}.login-card>p{color:#778079;margin:0 0 34px}.primary-action{width:100%;height:52px;border:0;border-radius:12px;background:#285b3f;color:white;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;cursor:pointer;box-shadow:0 10px 28px #285b3f38}.primary-action:hover{background:#1d4931}.demo-note{display:grid;gap:5px;margin-top:24px;padding:16px;border:1px solid #dfe6df;border-radius:12px;background:white;font-size:13px}.demo-note span{color:#7b847e}@media(max-width:860px){.login-page{grid-template-columns:1fr}.login-story{display:none}.login-panel{min-height:100vh}}
</style>
