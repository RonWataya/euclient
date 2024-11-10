document.addEventListener('DOMContentLoaded', () => {
    // Retrieve user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    
    // Validate user data
    if (!userData || userData.role !== 'Program Manager') {
        alert('User data not found or unauthorized role. Redirecting to login.');
        window.location.href = 'login.html'; // Redirect to login if user data is missing or invalid
        return;
    }

    // Display user information
    document.getElementById('ID').textContent = "User ID: " + userData.id;

    // Get budget form elements
    const budgetForm = document.getElementById('budget-application-form');
    const projectNameInput = document.getElementById('project-name');
    const budgetYearInput = document.getElementById('budget-year');
    const budgetAmountInput = document.getElementById('budget-amount');
    const currencySelect = document.getElementById('currency');
    const purposeTextarea = document.getElementById('purpose');

    // Add event listener to budget form submission
    budgetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const projectName = projectNameInput.value.trim();
        const budgetYear = parseInt(budgetYearInput.value.trim());
        const budgetAmount = parseFloat(budgetAmountInput.value.trim());
        const currency = currencySelect.value.trim();
        const purpose = purposeTextarea.value.trim();

        // Validate form data
        if (!projectName || isNaN(budgetYear) || isNaN(budgetAmount) || !purpose) {
            alert('Please fill in all fields with valid values.');
            return;
        }

        try {
            // Send request to backend to submit budget
            const response = await fetch('http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/budgets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.id}`
                },
                body: JSON.stringify({
                    project_name: projectName,
                    budget_year: budgetYear,
                    budget_amount: budgetAmount,
                    currency: currency,
                    purpose: purpose,
                    submitted_by: userData.id
                })
            });

            // Check if response is OK and handle response data
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert('Budget submitted successfully');
                    budgetForm.reset(); // Reset form fields
                } else {
                    alert(`Error: ${data.message || 'Submission failed'}`);
                }
            } else {
                const errorText = await response.text();
                console.error('Server response error:', errorText);
                alert(`Failed to submit budget: ${errorText || 'Unknown server error'}`);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
