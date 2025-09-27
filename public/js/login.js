const URL = 'http://localhost:5001/api/users/login'
const form = document.getElementById('login')
const token = document.getElementById('token')
form.addEventListener('submit', login)

async function login(event) {
    event.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    let payload = JSON.stringify({ email, password })
    console.log(payload)
    try {
        const res = await fetch(URL, {
            method: 'POST',
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        localStorage.setItem('jwtToken', data.accessToken)
        form.reset()
        document.getElementById('prodButton').innerHTML = `<button class="prod">
                                                    <a href="cars.html">PRODUCTS</a>
                                                    </button>`

        const decodeJWT = (token) => {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))
        
            return JSON.parse(jsonPayload)
        }
        
        const token = localStorage.getItem('jwtToken')
        const decodedToken = decodeJWT(token)
        const userId = decodedToken.user.id  
        localStorage.setItem('userId', userId)
       
    } catch (error) {
        console.error('Error:', error);
    }
}