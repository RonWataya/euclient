// Get user data from session storage
const userData = JSON.parse(sessionStorage.getItem('userData'));

// Validate user data
if (!userData || userData.role !== 'Finance Department') {
    window.location.href = '../index.html';
}

// Select table body to display budget entries
const budgetTableBody = document.getElementById('budget-table-body');

// Function to fetch budget data from backend
function fetchBudgets() {
    fetch('http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/api/budgets', {
        headers: {
            'Authorization': `Bearer ${userData.id}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch budget data');
        }
        return response.json();
    })
    .then(budgets => {
        budgetTableBody.innerHTML = ''; // Clear existing rows

        budgets.forEach(budget => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${budget.project_name}</td>
                <td>${budget.budget_year}</td>
                <td>${budget.currency}</td>
                <td>${budget.budget_amount}</td>
                <td>${budget.purpose}</td>
                <td>${budget.submitted_by}</td>
                <td>${budget.status}</td>
                <td>
                    ${
                        budget.status !== 'Approved' ? `
                            <button class="btn btn-success approve-btn" data-budget-id="${budget.id}">Approve</button>
                            <button class="btn btn-danger reject-btn" data-budget-id="${budget.id}">Reject</button>
                        ` : `
                            <button class="btn btn-success" disabled>Approved</button>
                        `
                    }
                </td>
            `;
            budgetTableBody.appendChild(row);
        });

        // Attach event listeners to Approve and Reject buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', () => updateBudgetStatus(button.dataset.budgetId, 'approve'));
        });
        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', () => updateBudgetStatus(button.dataset.budgetId, 'reject'));
        });
    })
    .catch(error => {
        console.error('Error fetching budgets:', error);
        alert('Could not load budgets.');
    });
}

// Function to update budget status
function updateBudgetStatus(budgetId, action) {
    const url = `http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/api/budgets/${budgetId}/${action}`;

    fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${userData.id}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update budget status to ${action}`);
        }
        return response.json();
    })
    .then(() => {
        alert(`Budget ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        fetchBudgets(); // Refresh the table after action
        fetchBudgetSummary(); // Refresh budget summary after action
        fetchBudgetAmountSummary(); // Refresh budget amount summary after action
    })
    .catch(error => {
        console.error(`Error updating budget status: ${error}`);
        alert(`Failed to ${action === 'approve' ? 'approve' : 'reject'} the budget.`);
    });
}

// Initial fetch of budgets and summary data when the page loads
function loadData() {
    fetchBudgets();
    fetchBudgetSummary();
    fetchBudgetAmountSummary();
}

// Fetch the budget summary data from the backend
function fetchBudgetSummary() {
    fetch('http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/api/budget-summary')
        .then(response => response.json())
        .then(data => {
            // Update the HTML elements with the fetched values
            document.getElementById('total-budget-count').textContent = data.totalBudget;
            document.getElementById('approved-budget-count').textContent = data.approvedBudget;
        })
        .catch(error => {
            console.error('Error fetching budget summary:', error);
        });
}

// Fetch the budget amount summary data from the backend
function fetchBudgetAmountSummary() {
    fetch('http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/api/budget-amount-summary')
        .then(response => response.json())
        .then(data => {
            // Update the HTML element with the fetched total budget amount
            document.getElementById('total-budget-amount').textContent = `$${data.approvedBudgetAmount.toLocaleString()}`;
        })
        .catch(error => {
            console.error('Error fetching budget amount summary:', error);
        });
}

// Call the function to load all data on page load
loadData();
