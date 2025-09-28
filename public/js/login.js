const URL = 'http://localhost:5001/api/users/login'
// Auto-logout: clear any existing token when arriving at the login page so "back" forces re-login
localStorage.removeItem('jwtToken')
localStorage.removeItem('userId')

const form = document.getElementById('login')
const loginAlert = document.getElementById('loginAlert')
form.addEventListener('submit', login)

function show(msg, type='success'){
    loginAlert.innerHTML = `<div class="alert-inline ${type==='success'?'alert-success':'alert-error'}">${msg}</div>`
    setTimeout(()=> loginAlert.innerHTML='', 3500)
}

async function login(event) {
    event.preventDefault()
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value
    if(!email){ show('Email is required','error'); return }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { show('Email looks invalid','error'); return }
    if(!password){ show('Password is required','error'); return }

    const payload = JSON.stringify({ email, password })
    try {
        const res = await fetch(URL, {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
            const txt = await res.text().catch(()=>res.status)
            throw new Error(txt || `HTTP ${res.status}`)
        }

        const data = await res.json()
        localStorage.setItem('jwtToken', data.accessToken)
        form.reset()
        show('Signed in', 'success')
    // redirect to dashboard after login
    window.location.href = 'dashboard.html'

        // decode JWT safely
        try{
            const token = data.accessToken
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))
            const decoded = JSON.parse(jsonPayload)
            const userId = decoded?.user?.id || decoded?.id
            if(userId) localStorage.setItem('userId', userId)
        }catch(e){ console.warn('JWT decode failed', e) }

    } catch (error) {
        console.error('Error:', error);
        show(typeof error === 'string' ? error : (error.message || 'Login failed'), 'error')
    }
}