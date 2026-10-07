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
    const eb = document.getElementById('eb');
    if(expense != 0)
    {
        eb.innerHTML = `<pre>Food          : ₹${food}(${Number((food*100)/expense).toFixed(2)}%)</pre>
                    <pre>Shopping      : ₹${shop}(${Number((shop*100)/expense).toFixed(2)}%)</pre>
                    <pre>Transaport    : ₹${trans}(${Number((trans*100)/expense).toFixed(2)}%)</pre>
                    <pre>Bills         : ₹${bill}(${Number((bill*100)/expense).toFixed(2)}%)</pre>
                    <pre>Entertainment : ₹${entertain}(${Number((entertain*100)/expense).toFixed(2)}%)</pre>
                    <pre>Healthcare    : ₹${health}(${Number((health*100)/expense).toFixed(2)}%)</pre>
                    <pre>Other         : ₹${other}(${Number((other*100)/expense).toFixed(2)}%)</pre>`
    }
    else
    {
        eb.innerHTML = `<pre>Food          : ₹0(0%)</pre>
                    <pre>Shopping      : ₹0(0%)</pre>
                    <pre>Transaport    : ₹0(0%)</pre
                    <pre>Bills         : ₹0(0%)</pre>
                    <pre>Entertainment : ₹0(0%)</pre>
                    <pre>Healthcare    : ₹0(0%)</pre>
                    <pre>Other         : ₹0(0%)</pre>`
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