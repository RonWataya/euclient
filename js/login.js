// Get input fields
const emailInput = document.getElementById('floatingInput');
const passwordInput = document.getElementById('floatingInput1');
const loginButton = document.querySelector('.btn-primary');

// Add event listener to login button
loginButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate input fields
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Send request to backend
    const response = await fetch('http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    // Check if user is authenticated
    if (data.authenticated) {
        // Store entire user object in session storage
        sessionStorage.setItem('userData', JSON.stringify(data.user));

        // Redirect to respective dashboard based on user role
        switch (data.user.role) {
            case 'Program Manager':
                window.location.href = 'program/program.html';
                break;
            case 'Finance Department':
                window.location.href = 'finance/finance.html';
                break;
            case 'Implementing Partners':
                window.location.href = 'partners/partners.html';
                break;
            case 'Auditors':
                window.location.href = 'auditors/auditors.html';
                break;
            default:
                alert('Access denied');
                break;
        }
    } else {
        alert('Invalid email or password');
    }
});