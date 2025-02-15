// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  // Load initial account list
  loadAccounts();

  // Set up form submission
  const accountForm = document.getElementById('account-form');
  accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorDiv = document.getElementById('form-error');
    const successDiv = document.getElementById('form-success');

    // Get all form field values
    const accountData = {
      first_name: document.getElementById('first_name').value.trim(),
      middle_name: document.getElementById('middle_name').value.trim(),
      last_name: document.getElementById('last_name').value.trim(),
      date: document.getElementById('date').value,
      mobile_number: document.getElementById('mobile_number').value.trim(),
      cif_number: document.getElementById('cif_number').value.trim(),
      account_number: document.getElementById('account_number').value.trim(),
      pan_number: document.getElementById('pan_number').value.trim(),
      aadhar_number: document.getElementById('aadhar_number').value.trim(),
      date_of_birth: document.getElementById('date_of_birth').value,
      amount: parseFloat(document.getElementById('amount').value) || null,
      interest_rate: parseFloat(document.getElementById('interest_rate').value) || null,
      maturity_date: document.getElementById('maturity_date').value,
      maturity_amount: parseFloat(document.getElementById('maturity_amount').value) || null,
      nominee: document.getElementById('nominee').value.trim(),
      account_under_person: document.getElementById('account_under_person').value.trim()
    };

    try {
      const result = await window.electronAPI.addAccount(accountData);

      if (result.error) {
        errorDiv.textContent = result.error;
        successDiv.textContent = '';
      } else {
        // Clear form and errors
        accountForm.reset();
        errorDiv.textContent = '';
        successDiv.textContent = 'Account added successfully!';

        // Reload account list
        loadAccounts();

        // Clear success message after 3 seconds
        setTimeout(() => {
          successDiv.textContent = '';
        }, 3000);
      }
    } catch (error) {
      errorDiv.textContent = `Error: ${error.message}`;
      successDiv.textContent = '';
    }
  });

  // Set up refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.addEventListener('click', loadAccounts);
});

async function loadAccounts() {
  try {
    const accounts = await window.electronAPI.getAccounts();
    const accountListElement = document.getElementById('account-list');

    // Clear current list
    accountListElement.innerHTML = '';

    if (accounts.error) {
      accountListElement.innerHTML = `<tr><td colspan="18">Error: ${accounts.error}</td></tr>`;
      return;
    }

    if (accounts.length === 0) {
      accountListElement.innerHTML = '<tr><td colspan="18">No accounts found. Add some!</td></tr>';
      return;
    }

    // Add each account to the table
    accounts.forEach(account => {
      const row = document.createElement('tr');

      // Format numbers and dates
      const amount = account.amount ? account.amount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      }) : '';

      const interestRate = account.interest_rate ? `${account.interest_rate}%` : '';

      const maturityAmount = account.maturity_amount ? account.maturity_amount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      }) : '';

      row.innerHTML = `
        <td>${account.id}</td>
        <td>${account.first_name || ''}</td>
        <td>${account.middle_name || ''}</td>
        <td>${account.last_name || ''}</td>
        <td>${account.date || ''}</td>
        <td>${account.mobile_number || ''}</td>
        <td>${account.cif_number || ''}</td>
        <td>${account.account_number || ''}</td>
        <td>${account.pan_number || ''}</td>
        <td>${account.aadhar_number || ''}</td>
        <td>${account.date_of_birth || ''}</td>
        <td>${amount}</td>
        <td>${interestRate}</td>
        <td>${account.maturity_date || ''}</td>
        <td>${maturityAmount}</td>
        <td>${account.nominee || ''}</td>
        <td>${account.account_under_person || ''}</td>
        <td>
          <button class="delete" data-id="${account.id}">Delete</button>
        </td>
      `;

      accountListElement.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('button.delete').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');

        if (confirm('Are you sure you want to delete this account?')) {
          try {
            const result = await window.electronAPI.deleteAccount(parseInt(id));

            if (result.error) {
              alert(`Error: ${result.error}`);
            } else {
              // Reload account list
              loadAccounts();
            }
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        }
      });
    });

  } catch (error) {
    const accountListElement = document.getElementById('account-list');
    accountListElement.innerHTML = `<tr><td colspan="18">Error loading accounts: ${error.message}</td></tr>`;
  }
}

