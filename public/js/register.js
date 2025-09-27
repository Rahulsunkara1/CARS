    const userForm = document.getElementById('car-form')
    const URL ='http://localhost:5001/api/users/register' // Ensure this URL matches your JSON server's endpoint

    const submitUserForm = async (e) => {
        e.preventDefault()
        
        let username = document.getElementById('username').value
        let email = document.getElementById('email').value
        let password = document.getElementById('password').value
 
        let payload = JSON.stringify({ username, email, password })
        console.log(payload)
 
        try {
            const response = await fetch(URL, {
                method: 'POST',
                body: payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            window.location.href = 'login.html'
            userForm.reset()
            document.getElementById('userId').value = '' // Reset hidden ID field
        } catch (error) {
            console.error('Error submitting user form:', error)
        }
    }

    userForm.addEventListener('submit', submitUserForm)

 

