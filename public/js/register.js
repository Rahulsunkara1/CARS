    const userForm = document.getElementById('car-form')
    const URL ='http://localhost:5001/api/users/register'
    const regAlert = document.getElementById('regAlert')

    function show(msg, type='success'){
        regAlert.innerHTML = `<div class="alert-inline ${type==='success'?'alert-success':'alert-error'}">${msg}</div>`
        setTimeout(()=> regAlert.innerHTML='', 3500)
    }

    userForm.addEventListener('submit', async (e)=>{
        e.preventDefault()
        const username = document.getElementById('username').value.trim()
        const email = document.getElementById('email').value.trim()
        const password = document.getElementById('password').value
        if(!username){ show('User name is required','error'); return }
        if(!email){ show('Email is required','error'); return }
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ show('Email looks invalid','error'); return }
        if(!password || password.length < 6){ show('Password must be at least 6 characters','error'); return }
        try{
            const res = await fetch(URL, { method:'POST', body:JSON.stringify({ username, email, password }), headers:{ 'Content-Type':'application/json'} })
            if(!res.ok) {
                const txt = await res.text().catch(()=>res.status)
                throw new Error(txt || 'Registration failed')
            }
            show('Account created — redirecting...', 'success')
            userForm.reset()
            setTimeout(()=> window.location.href = 'login.html', 900)
        }catch(err){ console.error(err); show(err.message||'Error', 'error') }
    })

 

