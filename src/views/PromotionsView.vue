<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Ticket, Present, Discount } from '@element-plus/icons-vue'
import { appState, promotionRepository } from '../data/repository'
import type { Promotion } from '../types'
const dialog=ref(false),editing=ref(false),form=reactive<Promotion>({id:'',name:'',type:'優惠券',code:'',discount:'',startAt:'2026-08-28',endAt:'2026-09-30',enabled:true})
const icons={優惠券:Ticket,滿額活動:Present,折扣活動:Discount}
const status=(x:Promotion)=>!x.enabled?'停用':new Date(x.startAt)>new Date()?'未開始':new Date(x.endAt)<new Date()?'已結束':'進行中'
const active=computed(()=>appState.promotions.filter(x=>status(x)==='進行中').length)
function open(item?:Promotion){editing.value=!!item;Object.assign(form,item?JSON.parse(JSON.stringify(item)):{id:crypto.randomUUID(),name:'',type:'優惠券',code:'',discount:'',startAt:'2026-08-28',endAt:'2026-09-30',enabled:true});dialog.value=true}
async function save(){if(!form.name||!form.discount){ElMessage.warning('請完成活動名稱與優惠內容');return}await promotionRepository.save(JSON.parse(JSON.stringify(form)));dialog.value=false;ElMessage.success(editing.value?'活動已更新':'活動已建立')}
</script>
<template>
  <section data-testid="promotions-page">
    <Teleport to="#page-actions">
      <el-button type="primary" :icon="Plus" data-testid="new-promotion" @click="open()">
        新增活動
      </el-button>
    </Teleport><div class="promo-banner">
      <div><span>ACTIVE CAMPAIGNS</span><h2>{{ active }} 個促銷活動進行中</h2><p>透過優惠券、滿額回饋與折扣活動提升轉換。</p></div><div class="ticket-art">
        %
      </div>
    </div><div class="promo-grid">
      <article v-for="item in appState.promotions" :key="item.id" @click="open(item)">
        <header>
          <div class="promo-icon">
            <el-icon><component :is="icons[item.type]" /></el-icon>
          </div><el-switch v-model="item.enabled" @click.stop @change="promotionRepository.save(item)" />
        </header><el-tag size="small" effect="plain">
          {{ item.type }}
        </el-tag><h3>{{ item.name }}</h3><p>{{ item.discount }}</p><div class="code">
          <span>{{ item.code }}</span><strong>{{ status(item) }}</strong>
        </div><footer>{{ item.startAt }} — {{ item.endAt }}</footer>
      </article>
    </div><el-dialog v-model="dialog" :title="editing?'編輯促銷活動':'新增促銷活動'" width="520">
      <el-form label-position="top">
        <el-form-item label="活動名稱">
          <el-input v-model="form.name" data-testid="promotion-name" />
        </el-form-item><div class="two">
          <el-form-item label="活動類型">
            <el-select v-model="form.type">
              <el-option v-for="x in ['優惠券','滿額活動','折扣活動']" :key="x" :value="x" :label="x" />
            </el-select>
          </el-form-item><el-form-item label="活動代碼">
            <el-input v-model="form.code" data-testid="promotion-code" />
          </el-form-item>
        </div><el-form-item label="優惠內容">
          <el-input v-model="form.discount" placeholder="例如：滿 NT$2,000 折 NT$200" data-testid="promotion-discount" />
        </el-form-item><div class="two">
          <el-form-item label="開始日期">
            <el-date-picker v-model="form.startAt" type="date" value-format="YYYY-MM-DD" />
          </el-form-item><el-form-item label="結束日期">
            <el-date-picker v-model="form.endAt" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>
        </div>
      </el-form><template #footer>
        <el-button @click="dialog=false">
          取消
        </el-button><el-button type="primary" data-testid="save-promotion" @click="save">
          儲存活動
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>
<style scoped>.promo-banner{padding:27px 34px;background:linear-gradient(120deg,#183626,#2e6546);color:white;border-radius:17px;display:flex;justify-content:space-between;align-items:center;overflow:hidden}.promo-banner span{font-size:10px;color:#e5b36d;letter-spacing:.16em}.promo-banner h2{font-size:23px;margin:8px 0}.promo-banner p{margin:0;color:#adc0b4;font-size:13px}.ticket-art{font-size:80px;font-weight:900;color:#ffffff13;transform:rotate(10deg)}.promo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:18px}.promo-grid article{padding:21px;background:white;border:1px solid #e2e7e2;border-radius:16px;cursor:pointer;transition:.2s}.promo-grid article:hover{transform:translateY(-2px);box-shadow:0 12px 30px #1d3d2812}.promo-grid header{display:flex;justify-content:space-between;margin-bottom:17px}.promo-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#e4efe7;color:#2c6747;font-size:20px}.promo-grid h3{font-size:17px;margin:13px 0 7px}.promo-grid p{font-size:13px;color:#737e76;min-height:36px}.code{display:flex;justify-content:space-between;align-items:center;padding:11px;background:#f3f6f3;border-radius:10px;margin-top:16px}.code span{font-family:monospace;color:#2f6447}.code strong{font-size:11px;color:#b4772c}.promo-grid footer{font-size:10px;color:#939b95;margin-top:15px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:900px){.promo-grid{grid-template-columns:1fr 1fr}}@media(max-width:600px){.promo-grid{grid-template-columns:1fr}.two{grid-template-columns:1fr}}</style>
