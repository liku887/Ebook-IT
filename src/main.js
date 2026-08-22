import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// 全局错误处理：捕获未处理的错误，显示恢复界面
window.addEventListener('error', (e) => {
  console.error('全局错误:', e.error || e.message)
  showErrorRecovery(e.error || e.message)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('未处理的Promise错误:', e.reason)
  showErrorRecovery(e.reason)
})

function showErrorRecovery(err) {
  // 避免重复显示
  if (document.getElementById('error-recovery')) return
  const el = document.createElement('div')
  el.id = 'error-recovery'
  el.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#f8fafc;font-family:sans-serif;'
  el.innerHTML = `
    <div style="background:white;padding:32px 40px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:480px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
      <h2 style="margin:0 0 8px;font-size:18px;color:#1e293b;">页面加载遇到问题</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#64748b;">可能是本地编辑数据损坏导致，可以尝试清除本地数据后重新加载。</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="location.reload()" style="padding:8px 20px;border:1px solid #cbd5e1;border-radius:8px;background:white;color:#475569;cursor:pointer;font-size:14px;">重新加载</button>
        <button id="btn-clear-data" style="padding:8px 20px;border:none;border-radius:8px;background:#ef4444;color:white;cursor:pointer;font-size:14px;">清除本地数据并重新加载</button>
      </div>
      <pre style="margin-top:16px;font-size:11px;color:#94a3b8;text-align:left;max-height:120px;overflow:auto;">${String(err).substring(0, 300)}</pre>
    </div>
  `
  document.body.appendChild(el)
  document.getElementById('btn-clear-data').onclick = () => {
    localStorage.clear()
    location.reload()
  }
}

const app = createApp(App)

// Vue 组件错误捕获
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue错误:', err, info)
  showErrorRecovery(err)
}

app.use(router).mount('#app')
