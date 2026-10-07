const months = new Set();
let transactions = [];
const sel = document.getElementById('month');
const option = document.createElement('option');
option.value = "All";
option.innerText = "All";
option.selected = true;
sel.appendChild(option);

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
    filtered.forEach(f => {
        if(f.type == 'Income')
        {
            income += f.amount;
        }
        else
        {
            expense += f.amount;
        }
    })
    const a = document.getElementById('ana');
    if(income-expense >= 0)
    {
        a.innerHTML = `
                             <p>Total Income : ₹${income}</p
                             <p>Total Expense : ₹${expense}</p>
                             <p>Savings : ₹${income - expense}`;
    }
    else
    {
        a.innerHTML = `
                             <p>Total Income : ₹${income}</p
                             <p>Total Expense : ₹${expense}</p>
                             <p>Savings : - ₹${expense - income}`;
    }
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