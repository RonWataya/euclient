// Get user data from session storage\

document.addEventListener('DOMContentLoaded', () => {
// Get budget ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const budgetId = urlParams.get('id');

// Fetch budget data from backend
fetch(`http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/budgets/${budgetId}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    console.log(data);
    // Populate form fields with budget data
    document.getElementById('project-name').value = data.project_name;
    document.getElementById('budget-year').value = data.budget_year;
    document.getElementById('budget-amount').value = data.budget_amount;
    document.getElementById('currency').value = data.currency;
    document.getElementById('purpose').value = data.purpose;
})
.catch(error => console.error(error));

// Get form elements
const budgetForm = document.getElementById('budget-application-form');

// Add event listener to form submission
budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const projectName = document.getElementById('project-name').value.trim();
    const budgetYear = parseInt(document.getElementById('budget-year').value.trim());
    const budgetAmount = parseFloat(document.getElementById('budget-amount').value.trim());
    const currency = document.getElementById('currency').value.trim();
    const purpose = document.getElementById('purpose').value.trim();

    // Send request to backend to update budget
    const response = await fetch(`http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/budgets/${budgetId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            project_name: projectName,
            budget_year: budgetYear,
            budget_amount: budgetAmount,
            currency: currency,
            purpose: purpose
        })
    });

    const data = await response.json();

    if (data.success) {
        alert('Budget updated successfully');
    } else {
        alert('Error updating budget');
    }
});


});

