document.addEventListener('DOMContentLoaded', ()=>{
  const URL = 'http://localhost:5001/api/cars'
  const token = localStorage.getItem('jwtToken')
  if(!token){ window.location.href = 'login.html'; return }
  const userId = localStorage.getItem('userId')
  // account menu wiring
  const accountBtn = document.getElementById('accountBtn')
  const accountDropdown = document.getElementById('accountDropdown')
  const accountAvatar = document.getElementById('accountAvatar')
  const accountName = document.getElementById('accountName')
  const accountLogout = document.getElementById('accountLogout')

  function decodeNameFromToken(){
    try{
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      const decoded = JSON.parse(jsonPayload)
      return decoded?.user?.username || decoded?.username || 'User'
    }catch(e){ return 'User' }
  }

  accountAvatar.textContent = (decodeNameFromToken()||'U').charAt(0).toUpperCase()
  accountName.textContent = decodeNameFromToken()
  accountBtn.addEventListener('click', ()=> accountDropdown.style.display = accountDropdown.style.display === 'block' ? 'none':'block')
  accountLogout.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('jwtToken'); localStorage.removeItem('userId'); window.location.href='login.html' })
  // account details modal
  const accountDetails = document.getElementById('accountDetails')
  const accountBackdrop = document.getElementById('accountBackdrop')
  const modalAvatar = document.getElementById('modalAvatar')
  const modalName = document.getElementById('modalName')
  const modalEmail = document.getElementById('modalEmail')
  const modalJoined = document.getElementById('modalJoined')
  const modalListings = document.getElementById('modalListings')
  const closeModal = document.getElementById('closeModal')

  async function loadAccount(){
    try{
      const res = await fetch('/api/users/current', { headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } })
      if(!res.ok) throw new Error('no')
      const data = await res.json()
      modalName.textContent = data.username || 'User'
      modalEmail.textContent = data.email || ''
      modalAvatar.textContent = (data.username||'U').charAt(0).toUpperCase()
      modalJoined.textContent = new Date(data.createdAt || data?.iat*1000 || Date.now()).toLocaleDateString()
      // listings count
      const listRes = await fetch('/api/cars', { headers: { Authorization: `Bearer ${token}` } })
      if(listRes.ok){ const list = await listRes.json(); modalListings.textContent = list.filter(c=>String(c.user_id)===String(userId)).length }
    }catch(e){ console.warn('account load fail', e) }
  }

  accountDetails.addEventListener('click', (e)=>{ e.preventDefault(); accountDropdown.style.display='none'; accountBackdrop.style.display='flex'; loadAccount() })
  closeModal.addEventListener('click', ()=> accountBackdrop.style.display='none')

  // Style toggle (alternate accent) — replaces dark/light theme toggle
  const themeToggle = document.getElementById('themeToggle')
  function applyAltStyle(){
    const on = localStorage.getItem('altStyle') === '1'
    document.body.classList.toggle('alt-style', on)
    if(themeToggle) themeToggle.textContent = on ? 'Style: Warm' : 'Style: Cool'
  }
  applyAltStyle()
  if(themeToggle) themeToggle.addEventListener('click', ()=>{
    const currently = localStorage.getItem('altStyle') === '1'
    localStorage.setItem('altStyle', currently ? '0' : '1')
    applyAltStyle()
  })

  // Animated modal open/close + focus trap
  function showModal(){ accountBackdrop.classList.add('show'); accountBackdrop.classList.remove('hide'); const modal = accountBackdrop.querySelector('.account-modal'); modal.classList.add('show'); modal.classList.remove('hide'); // focus
    const focusable = modal.querySelectorAll('a,button,input'); if(focusable[0]) focusable[0].focus();
  }
  function hideModal(){ const modal = accountBackdrop.querySelector('.account-modal'); modal.classList.remove('show'); modal.classList.add('hide'); accountBackdrop.classList.remove('show'); accountBackdrop.classList.add('hide'); }
  accountDetails.addEventListener('click', (e)=>{ e.preventDefault(); accountDropdown.style.display='none'; showModal(); loadAccount() })
  closeModal.addEventListener('click', ()=> hideModal())
  accountBackdrop.addEventListener('click', (e)=>{ if(e.target === accountBackdrop) hideModal() })
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') hideModal() })

  const searchInput = document.getElementById('searchInput')
  const sortSelect = document.getElementById('sortSelect')
  const addNewBtn = document.getElementById('addNewBtn')
  const listContainer = document.getElementById('listContainer')
  const addFormContainer = document.getElementById('addFormContainer')

  // Listing area will be hidden for dashboard-only view (guarded)
  if(listContainer){ listContainer.innerHTML = ''; listContainer.style.display = 'none' }

  // legacy fixed-header removed — dashboard uses a centered hero layout

  // ---- Dashboard summaries ----
  const totalListingsEl = document.getElementById('totalListings')
  const myListingsEl = document.getElementById('myListings')
  const totalValueEl = document.getElementById('totalValue')
  const selectedCarEl = document.getElementById('selectedCar')
  const accNameInline = document.getElementById('accNameInline')
  const accEmailInline = document.getElementById('accEmailInline')
  const openCarsPage = document.getElementById('openCarsPage')

  if(openCarsPage) openCarsPage.addEventListener('click', ()=> window.location.href = 'cars.html')

  // add new listing button (reuse existing flow)
  if(addNewBtn) addNewBtn.addEventListener('click', ()=> window.location.href = 'cars.html#add')

  async function loadDashboardSummary(){
    try{
      const res = await fetch('/api/cars', { headers: { Authorization: `Bearer ${token}` } })
      if(!res.ok) throw new Error('Failed')
      const list = await res.json()
      const total = Array.isArray(list) ? list.length : 0
      const my = Array.isArray(list) ? list.filter(c=> String(c.user_id) === String(userId)).length : 0
      const value = Array.isArray(list) ? list.reduce((s,c)=> s + (Number(c.price)||0), 0) : 0
      if(totalListingsEl) totalListingsEl.textContent = total
      if(myListingsEl) myListingsEl.textContent = my
      if(totalValueEl) totalValueEl.textContent = `$${value.toLocaleString()}`
    }catch(e){ console.warn('summary load failed', e) }
  }

  async function loadAccountInline(){
    try{
      const r = await fetch('/api/users/current', { headers: { Authorization: `Bearer ${token}` } })
      if(!r.ok) return
      const u = await r.json()
      if(accNameInline) accNameInline.textContent = u.username || ''
      if(accEmailInline) accEmailInline.textContent = u.email || ''
    }catch(e){ console.warn(e) }
  }

  loadDashboardSummary()
  loadAccountInline()

  let cache = []

  // No listings displayed in dashboard view; car-related handlers removed

  function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

  // load last selected car from localStorage (set by Cars page when a user previews a car)
  function populateSelectedCar(){
    try{
      const raw = localStorage.getItem('selectedCar')
      if(!raw) return
      const car = JSON.parse(raw)
      if(!car) return
      const title = escapeHtml(car.carname || car.title || 'Car')
      const price = car.price ? `$${Number(car.price).toLocaleString()}` : '—'
      const contact = []
      if(car.contactEmail) contact.push('Email: '+escapeHtml(car.contactEmail))
      if(car.contactPhone) contact.push('Phone: '+escapeHtml(car.contactPhone))
      const img = car.base64 ? `<img src="${car.base64}" style="max-width:160px;border-radius:8px;display:block;margin-top:8px"/>` : ''
      selectedCarEl.innerHTML = `<div><strong>${title}</strong> — ${price}</div><div class="small-muted">${contact.join(' • ')}</div>${img}`
    }catch(e){ console.warn('selected car parse fail', e) }
  }

  populateSelectedCar()

  // entrance animations for dashboard sections
  function animateDashboard(){
    const hero = document.querySelector('.dashboard-hero')
    const stats = document.querySelector('.stats-row')
    const sel = document.querySelector('.selected-card')
    if(hero) hero.classList.add('fade-up')
    if(stats){
      stats.classList.add('stagger-enter')
      // trigger stagger after a tick
      setTimeout(()=> stats.classList.add('show'), 80)
    }
    if(sel) sel.classList.add('scale-in')
  }
  // small delay so content looks lively
  setTimeout(animateDashboard, 120)

  // Note: Add Listing now navigates to Cars page (#add) to use the full create flow there.

  // delegate edit/delete from listContainer (only if present)
  if(listContainer) listContainer.addEventListener('click', async (e)=>{
    const editId = e.target.getAttribute('data-edit')
    const delId = e.target.getAttribute('data-delete')
    if(editId){
      // open add form prefilled
      const car = cache.find(c=>String(c._id)===String(editId))
      if(!car) return
  if(String(car.user_id) !== String(userId)) { alert('Not allowed'); return }
      addFormContainer.style.display = 'block'
      addFormContainer.innerHTML = `...` // quick placeholder - reuse the add form path or open cars.html edit
      // For brevity, redirect to cars.html with hash to edit
      window.location.href = `cars.html#edit=${editId}`
    }
    if(delId){
      if(!confirm('Delete this listing?')) return
      try{
        const res = await fetch(`${URL}/${delId}`, { method:'DELETE', headers: { Authorization: `Bearer ${token}` } })
        if(!res.ok) throw new Error('Delete failed')
        await fetchCars()
      }catch(err){ console.error(err); listContainer.insertAdjacentHTML('afterbegin', `<div class="alert-error alert-inline">Delete failed</div>`) }
    }
  })

  // search/sort not used on dashboard-only view
})
