const months = new Set();
let transactions = [];
const sel = document.getElementById('month');
const option = document.createElement('option');
option.value = "All";
option.innerText = "All";
option.selected = true;
sel.appendChild(option);
let expenseChart = null;
let incomeExpenseChart = null;

async function loadTransactions()
{
    const response = await fetch('/transactions');
    transactions = await response.json();
    transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString('en-US', {
        month: 'long'
    });
    const year = date.getFullYear();
    months.add(`${month} ${year}`);
});
    console.log(transactions);
    months.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.innerText = m;
    sel.appendChild(opt);
});
    await loadAna()
}
loadTransactions();

async function loadAna()
{
    const filtered = await filterTransactions(transactions,sel.value)
    let income = 0;
    let expense = 0;
    let food = 0;
    let shop = 0;
    let trans = 0;
    let bill = 0;
    let entertain = 0;
    let health = 0;
    let other = 0;
    filtered.forEach(f => {
        if(f.type == 'Income')
        {
            income += f.amount;
        }
        else
        {
            expense += f.amount;
            if(f.category == 'Food') food += f.amount;
            else if(f.category == 'Shopping') shop += f.amount;
            else if(f.category == 'Transaport') trans += f.amount;
            else if(f.category == 'Bills') bill += f.amount;
            else if(f.category == 'Entertainment')  entertain += f.amount;
            else if(f.category == 'Healthcare') health += f.amount;
            else if(f.category == 'Other') other += f.amount;
        }
    })
    const a = document.getElementById('ana');
    if(income-expense >= 0)
    {
        a.innerHTML = `
                             <pre>Total Income  : ₹${income.toLocaleString('en-IN')}</pre>
                             <pre>Total Expense : ₹${expense.toLocaleString('en-IN')}</pre>
                             <pre>Savings       : ₹${(income - expense).toLocaleString('en-IN')}</pre>`;
    }
    else
    {
        a.innerHTML = `
                             <pre>Total Income  : ₹${income.toLocaleString('en-IN')}</pre>
                             <pre>Total Expense : ₹${expense.toLocaleString('en-IN')}</pre>
                             <pre>Savings       : - ₹${(expense - income).toLocaleString('en-IN')}</pre>`;
    }
    const eb = document.getElementById('eb');
    if(expense != 0)
    {
        eb.innerHTML = `<pre>Food          : ₹${food.toLocaleString('en-IN')}(${Number((food*100)/expense).toFixed(2)}%)</pre>
                       <pre>Shopping      : ₹${shop.toLocaleString('en-IN')}(${Number((shop*100)/expense).toFixed(2)}%)</pre>
                       <pre>Transport     : ₹${trans.toLocaleString('en-IN')}(${Number((trans*100)/expense).toFixed(2)}%)</pre>
                       <pre>Bills         : ₹${bill.toLocaleString('en-IN')}(${Number((bill*100)/expense).toFixed(2)}%)</pre>
                       <pre>Entertainment : ₹${entertain.toLocaleString('en-IN')}(${Number((entertain*100)/expense).toFixed(2)}%)</pre>
                       <pre>Healthcare    : ₹${health.toLocaleString('en-IN')}(${Number((health*100)/expense).toFixed(2)}%)</pre>
                       <pre>Other         : ₹${other.toLocaleString('en-IN')}(${Number((other*100)/expense).toFixed(2)}%)</pre>`
    }
    else
    {
        eb.innerHTML = `<pre>Food           : ₹0(0%)</pre>
                    <pre>Shopping      : ₹0(0%)</pre>
                    <pre>Transport     : ₹0(0%)</pre>
                    <pre>Bills         : ₹0(0%)</pre>
                    <pre>Entertainment : ₹0(0%)</pre>
                    <pre>Healthcare    : ₹0(0%)</pre>
                    <pre>Other         : ₹0(0%)</pre>`
    }
    const ctx = document.getElementById('expenseChart');

    const categoryLabels = [
        'Food',
        'Shopping',
        'Transport',
        'Bills',
        'Entertainment',
        'Healthcare',
        'Other'
    ];

    const categoryData = [
        Number(food),
        Number(shop),
        Number(trans),
        Number(bill),
        Number(entertain),
        Number(health),
        Number(other)
    ];

    if (expenseChart)
    {
        expenseChart.destroy();
    }
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data:
        {
            labels: categoryLabels,
            datasets: [{
                label: 'Expenses (₹)',
                data: categoryData
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ₹${context.raw}`;
                        }
                    }
                }
            }
        }
    });
    const incomeExpenseCtx =
    document.getElementById('incomeExpenseChart');

if (incomeExpenseChart) {
    incomeExpenseChart.destroy();
}

incomeExpenseChart = new Chart(incomeExpenseCtx, {
    type: 'bar',

    data: {
        labels: ['Income', 'Expense'],

        datasets: [{
            label: 'Amount (₹)',
            data: [
                Number(income),
                Number(expense)
            ]
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `₹${context.raw}`;
                    }
                }
            }
        },

        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
    });
}

function filterTransactions(transactions,month)
{
    if(month === 'All')
    {
        return transactions;
    }
    const tf = transactions.filter(t => {
        const date = new Date(t.date);
        const y = date.getFullYear();
        const m = date.toLocaleString('en-US',{
            month : 'long'
        });
        return `${m} ${y}` === month;
    })
    return tf;
}
document.getElementById('apply').addEventListener('click',()=>{
    loadAna();
})

async function monthlyTrends()
{
    const response = await fetch('/transactions');
    const transactions = await response.json();
    const monthlyData = {};
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
        if (!monthlyData[monthYear])
        {
            monthlyData[monthYear] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'Income')
        {
            monthlyData[monthYear].income += Number(transaction.amount);
        }
        else if (transaction.type === 'Expense')
        {
            monthlyData[monthYear].expense += Number(transaction.amount);
        }
    });
    return monthlyData;
}

let monthlyTrendChart = null;

async function loadMonthlyTrends()
{
    const monthlyData = await monthlyTrends();
    const monthKeys = Object.keys(monthlyData).sort((a, b) => {
        const [monthA, yearA] = a.split('-').map(Number);
        const [monthB, yearB] = b.split('-').map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
    const labels = monthKeys.map(label => {
        const [month, year] = label.split('-').map(Number);
        return new Date(year, month - 1).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric'
        });
    });
    const incomeData = monthKeys.map(
        key => monthlyData[key].income
    );
    const expenseData = monthKeys.map(
        key => monthlyData[key].expense
    );
    const ctx = document.getElementById('monthlyTrendChart');
    if (monthlyTrendChart)
    {
        monthlyTrendChart.destroy();
    }
    monthlyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income (₹)',
                    data: incomeData,
                    borderColor: 'green',
                    fill: false
                },
                {
                    label: 'Expense (₹)',
                    data: expenseData,
                    borderColor: 'red',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

loadMonthlyTrends();

document.getElementById('savings').addEventListener('click',()=>{
    window.location.href = '/savings';
})
