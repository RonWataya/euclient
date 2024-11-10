document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    console.log('User Data:', userData);
    console.log('User ID:', userData ? userData.id : 'No ID found');

    // Validate user data
    if (!userData || userData.role !== 'Program Manager') {
        window.location.href = '../index.html';
    }
    document.getElementById('ID').textContent = "User ID: " + userData.id;
    const budgetTableBody = document.getElementById('budget-table-body');

    // Fetch and display budget data
    fetchBudgetData();

    // Function to fetch and display budget data
    function fetchBudgetData() {
        fetch('http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/fetch-budgets', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData ? userData.id : ''}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched Budget Data:', data);
            if (data.length === 0) {
                budgetTableBody.innerHTML = '<tr><td colspan="7">No budget data found.</td></tr>';
            } else {
                budgetTableBody.innerHTML = ''; // Clear table before adding rows
                data.forEach(budget => {
                    const row = `
                        <tr data-budget-id="${budget.id}">
                            <td>${budget.id}</td>
                            <td>${budget.project_name}</td>
                            <td>${budget.budget_year}</td>
                            <td>${budget.currency}</td>
                            <td>${budget.budget_amount}</td>
                            <td>${budget.status}</td>
                            <td>
                                <button class="btn btn-primary edit-btn" data-budget-id="${budget.id}">Edit</button>
                                <button class="btn btn-danger delete-btn" data-budget-id="${budget.id}">Delete</button>
                            </td>
                        </tr>
                    `;
                    budgetTableBody.innerHTML += row;
                });

                // Add event listeners for edit buttons
                const editButtons = document.querySelectorAll('.edit-btn');
                editButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const budgetId = button.getAttribute('data-budget-id');
                        window.location.href = `edit-budget.html?id=${budgetId}`;
                    });
                });

                // Add event listeners for delete buttons
                const deleteButtons = document.querySelectorAll('.delete-btn');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const budgetId = button.getAttribute('data-budget-id');
                        if (confirm('Are you sure you want to delete this budget?')) {
                            deleteBudget(budgetId);
                        }
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to fetch budget data');
        });
    }

    // Function to delete a budget
    function deleteBudget(budgetId) {
        fetch(`http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/delete-budget/${budgetId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userData ? userData.id : ''}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Remove the deleted row from the table
            const row = document.querySelector(`tr[data-budget-id="${budgetId}"]`);
            if (row) {
                row.remove();
            }
            alert('Budget deleted successfully');
            // Refresh the total applications and accumulated amount after deletion
            fetchTotalApplications();
            fetchTotalAccumulatedAmount();
        })
        .catch(error => {
            console.error('Error deleting budget:', error);
            alert('Failed to delete budget');
        });
    }

    // Function to fetch total budget applications made by the current user
    function fetchTotalApplications() {
        const userId = userData.id;

        fetch(`http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/api/budgets/total-applications/${userId}`, {
            headers: {
                'Authorization': `Bearer ${userData.id}`
            }
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-applications-count').textContent = data.totalApplications;
            document.getElementById('total-applications').textContent = `You made ${data.totalApplications} total applications`;
        })
        .catch(error => {
            console.error('Error fetching total applications:', error);
        });
    }

    // Function to fetch total accumulated amount for the current user's budget applications
    function fetchTotalAccumulatedAmount() {
        const userId = userData.id;

        fetch(`http://ec2-34-207-205-72.compute-1.amazonaws.com:9000/api/budgets/total-accumulated-amount/${userId}`, {
            headers: {
                'Authorization': `Bearer ${userData.id}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const totalAmount = data.totalAccumulatedAmount;
            document.getElementById('total-accumulated-amount').textContent = `Your applications have accumulated a total of $${totalAmount.toLocaleString()} USD`;
        })
        .catch(error => {
            console.error('Error fetching accumulated amount:', error);
        });
    }

    // Call the functions to fetch data on page load
    fetchTotalApplications();
    fetchTotalAccumulatedAmount();

});
