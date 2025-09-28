document.addEventListener("DOMContentLoaded", () => {
  const carForm = document.getElementById("car-form");
  const carsList = document.getElementById("carsList");
  const URL = "http://localhost:5001/api/cars";

  const token = localStorage.getItem("jwtToken");
  if(!token){ window.location.href = 'login.html'; return }
  // account menu wiring (same as dashboard)
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
  if(accountAvatar) accountAvatar.textContent = (decodeNameFromToken()||'U').charAt(0).toUpperCase()
  if(accountName) accountName.textContent = decodeNameFromToken()
  if(accountBtn) accountBtn.addEventListener('click', ()=> accountDropdown.style.display = accountDropdown.style.display === 'block' ? 'none':'block')
  if(accountLogout) accountLogout.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('jwtToken'); localStorage.removeItem('userId'); window.location.href='login.html' })

  // account modal wiring
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
      const listRes = await fetch('/api/cars', { headers: { Authorization: `Bearer ${token}` } })
      if(listRes.ok){ const list = await listRes.json(); modalListings.textContent = list.filter(c=>String(c.user_id)===String(localStorage.getItem('userId'))).length }
    }catch(e){ console.warn('account load fail', e) }
  }

  if(accountDetails) accountDetails.addEventListener('click', (e)=>{ e.preventDefault(); accountDropdown.style.display='none'; accountBackdrop.style.display='flex'; loadAccount() })
  if(closeModal) closeModal.addEventListener('click', ()=> accountBackdrop.style.display='none')

  // Theme toggle
  // Style toggle (uses same alt-style as dashboard)
  const themeToggle = document.getElementById('themeToggle')
  function applyAltStyle(){ const on = localStorage.getItem('altStyle') === '1'; document.body.classList.toggle('alt-style', on); if(themeToggle) themeToggle.textContent = on ? 'Style: Warm' : 'Style: Cool' }
  applyAltStyle()
  if(themeToggle) themeToggle.addEventListener('click', ()=>{ const cur = localStorage.getItem('altStyle') === '1'; localStorage.setItem('altStyle', cur ? '0' : '1'); applyAltStyle() })

  // Animated modal open/close
  function showModal(){ accountBackdrop.classList.add('show'); accountBackdrop.classList.remove('hide'); const modal = accountBackdrop.querySelector('.account-modal'); modal.classList.add('show'); modal.classList.remove('hide'); const focusable = modal.querySelectorAll('a,button,input'); if(focusable[0]) focusable[0].focus(); }
  function hideModal(){ const modal = accountBackdrop.querySelector('.account-modal'); modal.classList.remove('show'); modal.classList.add('hide'); accountBackdrop.classList.remove('show'); accountBackdrop.classList.add('hide'); }
  if(accountDetails) accountDetails.addEventListener('click', (e)=>{ e.preventDefault(); accountDropdown.style.display='none'; showModal(); loadAccount() })
  if(closeModal) closeModal.addEventListener('click', ()=> hideModal())
  accountBackdrop.addEventListener('click', (e)=>{ if(e.target === accountBackdrop) hideModal() })
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') hideModal() })

  // animate cards on render
  const animateCards = ()=>{ carsList.classList.add('stagger-enter'); setTimeout(()=> carsList.classList.add('show'), 80) }

  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const fileInput = document.getElementById('carFile');
  const filePreview = document.getElementById('filePreview');
  const cancelEditBtn = document.getElementById('cancelEdit');
  const submitBtn = document.getElementById('submitBtn');
  const formAlert = document.getElementById('formAlert');
  const openDashboardBtn = document.getElementById('openDashboardBtn')

  let cache = [];
  let favorites = new Set(JSON.parse(localStorage.getItem('favorites')||'[]'))
  const myListingsFilterBtn = document.getElementById('myListingsFilter')
  const favoritesFilterBtn = document.getElementById('favoritesFilter')
  let showOnlyMine = false
  let showOnlyFavs = false

  function showAlert(message, type='success'){
    formAlert.innerHTML = `<div class="alert-inline ${type==='success'? 'alert-success':'alert-error'}">${message}</div>`
    setTimeout(()=> formAlert.innerHTML = '', 3500)
  }

  const fetchCars = async () => {
    try {
      const response = await fetch(URL, { headers: { Authorization: `Bearer ${token}` } });
      if(!response.ok) throw new Error('Could not load cars')
      const cars = await response.json();
      cache = Array.isArray(cars) ? cars : [];
      renderCars(cache);
    } catch (error) {
      console.error("Error fetching cars:", error);
      showAlert('Failed to load cars', 'error')
    }
  };

  function renderCars(list){
    const q = searchInput.value?.toLowerCase()?.trim();
    let filtered = list.filter(c => {
      if(!q) return true;
      return [c.carname, c.model, c.make, String(c.year), String(c.price)].some(field => field && field.toString().toLowerCase().includes(q))
    })

  const sort = sortSelect.value
    if(sort === 'price_asc') filtered.sort((a,b)=>Number(a.price||0)-Number(b.price||0))
    if(sort === 'price_desc') filtered.sort((a,b)=>Number(b.price||0)-Number(a.price||0))

    const currentUserId = localStorage.getItem('userId')
  // apply filters
  if(showOnlyMine) filtered = filtered.filter(c=> String(c.user_id) === String(currentUserId))
  if(showOnlyFavs) filtered = filtered.filter(c=> favorites.has(String(c._id)))
    // render minimal centered cards: image + name + price badge + overlay actions
    carsList.innerHTML = filtered.map(car => {
      const imageSrc = car.base64 ? `data:image/jpg;base64,${car.base64}` : 'https://via.placeholder.com/400x260?text=No+Image'
      const priceLabel = car.price ? `$${Number(car.price).toLocaleString()}` : '—'
      return `
        <div class="car-card form-card car-min-card" data-id="${car._id}" style="position:relative;overflow:hidden">
          <div class="price-badge">${priceLabel}</div>
          <img class="car-image" src="${imageSrc}" alt="${escapeHtml(car.carname||'car')}">
          <div class="car-meta">
            <h5>${escapeHtml(car.carname||'Unnamed')}</h5>
          </div>
          <div class="card-overlay">
            <div class="actions">
              <button class="fav-btn" data-fav="${car._id}" title="Favorite">❤</button>
              <button class="btn btn-ghost" data-open="${car._id}">View</button>
            </div>
          </div>
        </div>
      `
    }).join('')
    // animate card entrance
    animateCards()
  }

  // Car detail modal wiring
  const carBackdrop = document.getElementById('carBackdrop')
  const closeCarModal = document.getElementById('closeCarModal')
  const detailName = document.getElementById('detailName')
  const detailPrice = document.getElementById('detailPrice')
  const detailMake = document.getElementById('detailMake')
  const detailYear = document.getElementById('detailYear')
  const detailContact = document.getElementById('detailContact')
  const detailAvatar = document.getElementById('detailAvatar')
  const detailEditLink = document.getElementById('detailEditLink')

  function showCarModal(car){
    if(!car) return
    detailName.textContent = car.carname || 'Unnamed'
    detailPrice.textContent = `$${car.price || '0'}`
    detailMake.textContent = `${car.make || '—'} / ${car.model || '—'}`
    detailYear.textContent = car.year || '—'
    detailContact.textContent = `${car.contactEmail || '—'} · ${car.contactPhone || '—'}`
    detailAvatar.style.background = `url(${car.base64 ? `data:image/jpg;base64,${car.base64}` : 'https://via.placeholder.com/400x260?text=No+Image'}) center/cover no-repeat`;
    // show edit link only for owner
    if(String(car.user_id) === String(localStorage.getItem('userId'))){ detailEditLink.style.display = 'inline-block'; detailEditLink.href = `cars.html#edit=${car._id}` } else { detailEditLink.style.display = 'none' }
    carBackdrop.style.display = 'flex'
    // animate
    carBackdrop.classList.add('show'); carBackdrop.classList.remove('hide'); const modal = carBackdrop.querySelector('.account-modal'); modal.classList.add('show'); modal.classList.remove('hide')
    // persist selection so dashboard can show the last viewed car
    try{ const toStore = { _id: car._id, carname: car.carname, price: car.price, contactEmail: car.contactEmail, contactPhone: car.contactPhone, base64: car.base64 }; localStorage.setItem('selectedCar', JSON.stringify(toStore)) }catch(e){ /* ignore */ }
  }
  function hideCarModal(){ const modal = carBackdrop.querySelector('.account-modal'); modal.classList.remove('show'); modal.classList.add('hide'); carBackdrop.classList.remove('show'); carBackdrop.classList.add('hide'); setTimeout(()=> carBackdrop.style.display='none', 260) }

  // delegate click on minimal cards
  carsList.addEventListener('click', async (e)=>{
    // favorite toggle
    const favBtn = e.target.closest('[data-fav]')
    if(favBtn){
      const id = favBtn.getAttribute('data-fav')
      if(favorites.has(id)){ favorites.delete(id); favBtn.classList.remove('active') } else { favorites.add(id); favBtn.classList.add('active') }
      localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)))
      return
    }

    const openBtn = e.target.closest('[data-open]')
    if(openBtn){
      const id = openBtn.getAttribute('data-open')
      try{
        const res = await fetch(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        if(!res.ok) throw new Error('Not found')
        const car = await res.json()
        showCarModal(car)
      }catch(err){ console.warn(err) }
      return
    }

    const card = e.target.closest('.car-min-card')
    if(card){
      const id = card.getAttribute('data-id')
      try{
        const res = await fetch(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        if(!res.ok) throw new Error('Not found')
        const car = await res.json()
        showCarModal(car)
      }catch(err){ console.warn(err) }
    }
  })
  if(closeCarModal) closeCarModal.addEventListener('click', ()=> hideCarModal())
  if(carBackdrop) carBackdrop.addEventListener('click', (e)=>{ if(e.target === carBackdrop) hideCarModal() })

  function escapeHtml(str){
    if(!str) return ''
    return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  }

  // Submit form (Add or Update)
  carForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // basic client-side validation
    const carname = document.getElementById('carname').value.trim()
    const price = document.getElementById('price').value.trim()
    const year = document.getElementById('year').value.trim()
    if(!carname){ showAlert('Car name is required','error'); return }
    if(price && isNaN(Number(price))){ showAlert('Price must be a number','error'); return }
    if(year && (!/^[0-9]{4}$/.test(year))){ showAlert('Year must be a 4-digit number','error'); return }
    const id = document.getElementById('carId').value;
    const formData = new FormData(carForm);
    const method = id ? 'PUT' : 'POST';
    const apiUrl = id ? `${URL}/${id}` : URL;

    try{
      submitBtn.disabled = true
      const res = await fetch(apiUrl, { method, body: formData, headers: { Authorization: `Bearer ${token}` } })
      if(!res.ok) throw new Error('Save failed')
      showAlert(id ? 'Updated successfully' : 'Created successfully', 'success')
      carForm.reset(); filePreview.style.display='none'; document.getElementById('carId').value=''
      cancelEditBtn.style.display='none'
      await fetchCars()
    }catch(err){
      console.error(err); showAlert(err.message||'Error saving', 'error')
    }finally{ submitBtn.disabled = false }
  })

  // image preview
  fileInput.addEventListener('change', (e)=>{
    const file = e.target.files?.[0]
    if(!file) { filePreview.style.display='none'; return }
    const url = URL.createObjectURL(file)
    filePreview.src = url; filePreview.style.display='block'
  })

  // cancel edit
  cancelEditBtn.addEventListener('click', ()=>{
    carForm.reset(); document.getElementById('carId').value=''; filePreview.style.display='none'; cancelEditBtn.style.display='none'
  })

  // delegate edit/delete
  carsList.addEventListener('click', async (e)=>{
    const editId = e.target.getAttribute('data-edit')
    const delId = e.target.getAttribute('data-delete')
    if(editId){
      try{
        const res = await fetch(`${URL}/${editId}`, { headers: { Authorization: `Bearer ${token}` } })
        if(!res.ok) throw new Error('Could not load item')
        const car = await res.json()
        document.getElementById('carId').value = car._id
        document.getElementById('carname').value = car.carname || ''
        document.getElementById('price').value = car.price || ''
        document.getElementById('model').value = car.model || ''
        document.getElementById('year').value = car.year || ''
        document.getElementById('make').value = car.make || ''
          document.getElementById('contactEmail').value = car.contactEmail || ''
          document.getElementById('contactPhone').value = car.contactPhone || ''
        if(car.base64) { filePreview.src = `data:image/jpg;base64,${car.base64}`; filePreview.style.display='block' }
        cancelEditBtn.style.display='inline-block'
        window.scrollTo({top:0, behavior:'smooth'})
      }catch(err){ console.error(err); showAlert('Could not load item for edit','error') }
    }
    if(delId){
      if(!confirm('Delete this car?')) return
      try{
        const res = await fetch(`${URL}/${delId}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } })
        if(!res.ok) throw new Error('Delete failed')
        showAlert('Deleted', 'success')
        await fetchCars()
      }catch(err){ console.error(err); showAlert('Delete failed','error') }
    }
  })

  // search/sort handlers
  searchInput.addEventListener('input', ()=> renderCars(cache))
  sortSelect.addEventListener('change', ()=> renderCars(cache))

  // filters
  if(myListingsFilterBtn) myListingsFilterBtn.addEventListener('click', ()=>{ showOnlyMine = !showOnlyMine; myListingsFilterBtn.classList.toggle('active', showOnlyMine); renderCars(cache) })
  if(favoritesFilterBtn) favoritesFilterBtn.addEventListener('click', ()=>{ showOnlyFavs = !showOnlyFavs; favoritesFilterBtn.classList.toggle('active', showOnlyFavs); renderCars(cache) })

  if(openDashboardBtn) openDashboardBtn.addEventListener('click', ()=> window.location.href = 'dashboard.html')

  fetchCars()

  // support deep link for editing: cars.html#edit=<id>
  const hash = location.hash
  if(hash && hash.startsWith('#edit=')){
    const id = hash.split('=')[1]
    if(id) {
      // fetch and prefill
      (async ()=>{
        try{
          const res = await fetch(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          if(!res.ok) throw new Error('Not found')
          const car = await res.json()
          document.getElementById('carId').value = car._id
          document.getElementById('carname').value = car.carname || ''
          document.getElementById('price').value = car.price || ''
          document.getElementById('model').value = car.model || ''
          document.getElementById('year').value = car.year || ''
          document.getElementById('make').value = car.make || ''
          document.getElementById('contactEmail').value = car.contactEmail || ''
          document.getElementById('contactPhone').value = car.contactPhone || ''
          if(car.base64) { filePreview.src = `data:image/jpg;base64,${car.base64}`; filePreview.style.display='block' }
          cancelEditBtn.style.display='inline-block'
          window.scrollTo({top:0, behavior:'smooth'})
        }catch(e){ console.warn(e) }
      })()
    }
  }
})
