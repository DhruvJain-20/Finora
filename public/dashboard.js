let editingId = null;
let budgetId = null;

const currentMonth = new Date().toISOString().slice(0, 7);

const mdate = document.getElementById('date');
mdate.max = new Date().toISOString().slice(0,10);

const month = new Date().getMonth();
const year = new Date().getFullYear();
let monthName;
if(month == 0) monthName = 'January';
else if(month == 1) monthName = 'February';
else if(month == 2) monthName = 'March';
else if(month == 3) monthName = 'April';
else if(month == 4) monthName = 'May';
else if(month == 5) monthName = 'June';
else if(month == 6) monthName = 'July';
else if(month == 7) monthName = 'August';
else if(month == 8) monthName = 'September';
else if(month == 9) monthName = 'October';
else if(month == 10) monthName = 'November';
else if(month == 11) monthName = 'December';

const b_month = `${monthName} ${year}`;

function display_cat(food,shop,transport,bill,entertain,health,other)
{
    const cat = document.getElementById("cat");
    const cf = document.getElementById("cat_fil").value
    if(cf == 'All')
    {
        cat.innerHTML = `
        <pre class='pre'>Food          : ₹ ${food}</pre>
        <pre class='pre'>Shopping      : ₹ ${shop}</pre>
        <pre class='pre'>Transport     : ₹ ${transport}</pre>
        <pre class='pre'>Bills         : ₹ ${bill}</pre>
        <pre class='pre'>Entertainment : ₹ ${entertain}</pre>
        <pre class='pre'>Healthcare    : ₹ ${health}</pre>
        <pre class='pre'>Other         : ₹ ${other}</pre>`;
    }
    else if(cf == 'Food')
    {
        cat.innerHTML = `<pre class='pre'>Food          : ₹ ${food}</pre>`;
    }
    else if(cf == 'Shopping')
    {
        cat.innerHTML = `<pre class='pre'>Shopping      : ₹ ${shop}</pre>`
    }
    else if(cf == 'Transport')
    {
        cat.innerHTML = `<pre class='pre'>Transport     : ₹ ${transport}</pre>`
    }
    else if(cf == 'Bills')
    {
        cat.innerHTML = `<pre class='pre'>Bills         : ₹ ${bill}</pre>`
    }
    else if(cf == 'Entertainment')
    {
        cat.innerHTML = `<pre class='pre'>Entertainment : ₹ ${entertain}</pre>`
    }
    else if(cf == 'Healthcare')
    {
        cat.innerHTML = `<pre class='pre'>Healthcare    : ₹ ${health}</pre>`
    }
    else if(cf == 'Other')
    {
        cat.innerHTML = `<pre class='pre'>Other         : ₹ ${other}</pre>`
    }
}

function dislplay_type(transactions,tv,sv)
{
    let iflag = 0;
    let eflag = 0;
    document.getElementById("income").innerHTML = "";
    document.getElementById("expense").innerHTML = "";
    transactions.forEach(transaction => {
        const div = document.createElement("div");
        div.classList.add('box');
        div.innerHTML = `
            <h3>${transaction.category}</h3>
            <p>₹${transaction.amount}</p>
            <p>${transaction.description}</p>
            <p>${transaction.merchant}</p>
            <p>${transaction.date}</p>
            <p>${transaction.payment_method}</p>
            <button class='up' data-id='${transaction.id}'><i class="fa-solid fa-pen" style="color: rgb(0, 0, 0);"></i></button>
            <button class='del' data-id='${transaction.id}'><i class="fa-solid fa-trash-can" style="color: rgb(230, 71, 71);"></i></button>`;
        if(transaction.type == 'Income' && (tv == 'Income' || tv == 'All') && (sv == '' || transaction.description.toLowerCase().includes(sv) || transaction.merchant.toLowerCase().includes(sv) || transaction.category.toLowerCase().includes(sv)))
        {
            const transactionsList = document.getElementById("income");
            transactionsList.appendChild(div);
            iflag = 1;
        }
        else if(transaction.type == 'Expense'  && (tv == 'Expense' || tv == 'All') && (sv == '' || transaction.description.toLowerCase().includes(sv) || transaction.merchant.toLowerCase().includes(sv) || transaction.category.toLowerCase().includes(sv)))
        {
            const transactionsList = document.getElementById("expense");
            transactionsList.appendChild(div);
            eflag = 1;
        }
        const del = div.querySelector(".del");
        del.addEventListener('click',async ()=>{
            console.log('Delete Button Clicked')
            const id = del.dataset.id;
            console.log(id)
            const response = await fetch(`/transactions/${id}`,{
                method : "DELETE"
            });
            const data = await response.json();
            console.log(data);
            window.location.reload();
        })
        const up = div.querySelector(".up");
        up.addEventListener('click',()=>{
            const id = up.dataset.id;
            console.log(id);
            console.log(transaction);
            editingId = transaction.id;
            document.getElementById("amt").value = transaction.amount;
            document.getElementById("type").value = transaction.type;
            document.getElementById("category").value = transaction.category;
            document.getElementById("description").value = transaction.description;
            document.getElementById("merchant").value = transaction.merchant;
            document.getElementById("date").value = transaction.date;
            document.getElementById("payment").value = transaction.payment_method;
        })
    })
    if(iflag == 0 && tv != 'Expense')
    {
        const pi = document.createElement('p');
        pi.innerText = "No Income results found";
        document.getElementById("income").appendChild(pi);
    }
    if(eflag == 0 && tv != 'Income')
    {
        const pe = document.createElement('p');
        pe.innerText = "No Expense results found";
        document.getElementById("expense").appendChild(pe);
    }
}

form = document.getElementById('transaction_form');
form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const transaction = {
        amount : document.getElementById("amt").value,
        type : document.getElementById("type").value,
        category : document.getElementById("category").value,
        description : document.getElementById("description").value,
        merchant : document.getElementById("merchant").value,
        date : document.getElementById("date").value,
        payment_method : document.getElementById("payment").value,
    };
    if (editingId) 
    {
        response = await fetch(`/transactions/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });
        editingId = null;
    } 
    else 
    {
        response = await fetch("/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });
    }
    const data = await response.json();
    console.log("Server response:", data);
    window.location.reload();
})
async function loadTransactions() {
    const response = await fetch("/transactions");
    const transactions = await response.json();
    const currentTransactions = transactions.filter(t =>
        t.date.startsWith(currentMonth)
    );
    let ti = 0;
    let te = 0;
    let food = 0;
    let shop = 0;
    let transport = 0;
    let bill = 0;
    let entertain = 0;
    let health = 0;
    let other = 0;
    currentTransactions.forEach(transaction => {
        const div = document.createElement("div");
        div.classList.add('box');
        div.innerHTML = `
            <h3>${transaction.category}</h3>
            <p>₹${transaction.amount}</p>
            <p>${transaction.description}</p>
            <p>${transaction.merchant}</p>
            <p>${transaction.date}</p>
            <p>${transaction.payment_method}</p>
            <button class='up' data-id='${transaction.id}'><i class="fa-solid fa-pen" style="color: rgb(0, 0, 0);"></i></button>
            <button class='del' data-id='${transaction.id}'><i class="fa-solid fa-trash-can" style="color: rgb(230, 71, 71);"></i></button>`;
        if(transaction.type == 'Income')
        {
            const transactionsList = document.getElementById("income");
            transactionsList.appendChild(div);
            ti = ti + transaction.amount;
        }
        else if(transaction.type == 'Expense')
        {
            const transactionsList = document.getElementById("expense");
            transactionsList.appendChild(div);
            te = te + transaction.amount;
            if(transaction.category == 'Food')
            {
                food = food + transaction.amount;
            }
            else if(transaction.category == 'Shopping')
            {
                shop = shop + transaction.amount;
            }
            else if(transaction.category == 'Transport')
            {
                transport = transport + transaction.amount;
            }
            else if(transaction.category == 'Bills')
            {
                bill = bill + transaction.amount;
            }
            else if(transaction.category == 'Entertainment')
            {
                entertain = entertain + transaction.amount;
            }
            else if(transaction.category == 'Healthcare')
            {
                health = health + transaction.amount;
            }
            else if(transaction.category == 'Other')
            {
                other = other + transaction.amount;
            }
        }
        const del = div.querySelector(".del");
        del.addEventListener('click',async ()=>{
            console.log('Delete Button Clicked')
            const id = del.dataset.id;
            console.log(id)
            const response = await fetch(`/transactions/${id}`,{
                method : "DELETE"
            });
            const data = await response.json();
            console.log(data);
            window.location.reload();
        })
        const up = div.querySelector(".up");
        up.addEventListener('click',()=>{
            const id = up.dataset.id;
            console.log(id);
            console.log(transaction);
            editingId = transaction.id;
            document.getElementById("amt").value = transaction.amount;
            document.getElementById("type").value = transaction.type;
            document.getElementById("category").value = transaction.category;
            document.getElementById("description").value = transaction.description;
            document.getElementById("merchant").value = transaction.merchant;
            document.getElementById("date").value = transaction.date;
            document.getElementById("payment").value = transaction.payment_method;
        })
    });
    const calc = document.getElementById("tot");
    if((ti-te)>=0)
    {
        calc.innerHTML = `
        <p>Total Income : ₹ ${ti}</p>
        <p>Total Expenses : ₹ ${te}</p>
        <p>Balance : ₹ ${ti - te}</p>`;
    }
    else
    {
        calc.innerHTML = `
        <p>Total Income : ₹ ${ti}</p>
        <p>Total Expenses : ₹ ${te}</p>
        <p>Balance : - ₹ ${te - ti}</p>`;
    }
    display_cat(food,shop,transport,bill,entertain,health,other);
    document.getElementById('apply').addEventListener('click',()=>{
    display_cat(food,shop,transport,bill,entertain,health,other);
})
    document.getElementById("apply_fil").addEventListener('click',()=>{
        let tv = document.getElementById("type_fil").value;
        let sv = document.getElementById("search").value.toLowerCase().trim();
        if(tv == "All")
        {
            dislplay_type(currentTransactions,tv,sv);
            document.querySelector('.i').innerText = "Income: ";
            document.querySelector('.e').innerText = "Expense: ";
        }
        else if(tv == "Income")
        {
            dislplay_type(currentTransactions,tv,sv);
            document.querySelector('.i').innerText = "Income: ";
            document.querySelector('.e').innerText = "";
        }
        else if(tv == "Expense")
        {
            dislplay_type(currentTransactions,tv,sv);
            document.querySelector('.i').innerText = "";
            document.querySelector('.e').innerText = "Expense: ";
        }
    })
    document.getElementById("sb").addEventListener('click',()=>{
        let tv = document.getElementById("type_fil").value;
        let sv = document.getElementById("search").value.toLowerCase().trim();
        if(tv == "All")
        {
            dislplay_type(currentTransactions,tv,sv);
            document.querySelector('.i').innerText = "Income: ";
            document.querySelector('.e').innerText = "Expense: ";
        }
        else if(tv == "Income")
        {
            dislplay_type(currentTransactions,tv,sv);
            document.querySelector('.i').innerText = "Income: ";
            document.querySelector('.e').innerText = "";
        }
        else if(tv == "Expense")
        {
            dislplay_type(currentTransactions,tv,sv);
            document.querySelector('.i').innerText = "";
            document.querySelector('.e').innerText = "Expense: ";
        }
    })
    document.getElementById("sort_btn").addEventListener('click',()=>{
            let sortTransaction = [...currentTransactions];
            let sort = document.getElementById('sort').value;
            if(sort == "Newest")
            {
                sortTransaction.sort((a,b)=>{
                    return new Date(b.date) - new Date(a.date);
                })
            }
            else if(sort == "Oldest")
            {
                sortTransaction.sort((a,b)=>{
                    return new Date(a.date) - new Date(b.date);
                })
            }
            else if(sort == "Highest")
            {
                sortTransaction.sort((a,b)=>{
                    return Number(b.amount) - Number(a.amount);
                })
            }
            else if(sort == "Lowest")
            {
                sortTransaction.sort((a,b)=>{
                    return Number(a.amount) - Number(b.amount);
                })
            }
            let tv = document.getElementById("type_fil").value;
            let sv = document.getElementById("search").value.toLowerCase().trim();
            dislplay_type(sortTransaction,tv,sv);
        })
}
loadTransactions();

document.getElementById('b_form').addEventListener('submit',async ()=>{
    const budget = {
        category : document.getElementById('b_cat').value,
        amount : document.getElementById('b_amt').value,
        month : document.getElementById('b_mon').value
    }
    let response;
    if(budgetId != null)
    {
            response = await fetch(`/budget/${budgetId}`,{
            method : 'PUT',
            headers : {'content-type' : 'application/json'},
            body : JSON.stringify(budget)
        });
        budgetId = null;
    }
    else
    {
            response = await fetch('/budget',{
            method : 'POST',
            headers : {'content-type' : 'application/json'},
            body : JSON.stringify(budget)
        });
    }
    const data = await response.json();
    console.log("Server response:", data);
})

async function bgts()
{
    const tresponse = await fetch('/transactions')
    const transactions = await tresponse.json();
    const currentTransactions = await transactions.filter(t => {
        return t.date.startsWith(currentMonth);
    })
    const response = await fetch('/budget');
    const budgets = await response.json();
    const currentBudgets = await budgets.filter(b => {
        return b.month == b_month;
    })
    let tb = 0;
    let ts = 0;
    let food = 0;
    let shop = 0;
    let transport = 0;
    let bill = 0;
    let entertain = 0;
    let health = 0;
    let other = 0;
    currentTransactions.forEach(t => {
        if(t.type == 'Expense')
        {
            if(t.category == 'Food') food += t.amount;
            else if(t.category == 'Shopping') shop += t.amount;
            else if(t.category == 'Transport') transport += t.amount;
            else if(t.category == 'Bills') bill += t.amount;
            else if(t.category == 'Entertainment') entertain += t.amount;
            else if(t.category == 'Healthcare') health += t.amount;
            else if(t.category == 'Other') other += t.amount;
        }
    })
    let d = document.getElementById('b_temp');
    currentBudgets.forEach(budget => {
        let spent = 0;
        const div = document.createElement('div');
        if(budget.category == 'Food') spent = food
        else if(budget.category == 'Shopping') spent = shop
        else if(budget.category == 'Transport') spent = transport
        else if(budget.category == 'Bills') spent = bill
        else if(budget.category == 'Entertainment')spent = entertain
        else if(budget.category == 'Healthcare') spent = health
        else if(budget.category == 'Other') spent = other
        let percentage = Number((spent / budget.amount) * 100).toFixed(2);
        tb += budget.amount;
        ts += spent;
        let status;
        if(percentage == 100)
        {
            status = 'Limit Reached';
        }
        else if(percentage > 100)
        {
            status = 'Budget Exceeded';
        }
        else if(percentage >= 85)
        {
            status = 'Approaching Limit';
        }
        else
        {
            status = 'On track';
        }
        let barPercentage = Math.min(percentage, 100);
        div.innerHTML = "";
        div.id = 'temp_bgts';
        if(budget.amount - spent >= 0 && percentage < 85)
        {
            div.innerHTML = `
            <h3 id='temp_cat'>${budget.category}</h3>
            <p id='temp_amt'>Budget : ₹${budget.amount}</p>
            <p id='temp_spent'>Spent : ₹${spent}</p>
            <p id='temp_rem'>Remaining : ₹${budget.amount - spent}</p>
            <br>
            <div class="progress">
            <div class="progress-fill" style="width: ${barPercentage}%"></div>
            </div>
            <pre>${percentage}%</pre>
            <br>
            <p id='temp_mon'>${budget.month}</p>
            <div class='status'><i class="fa-solid fa-circle-check" style="color: rgb(68, 215, 61);"></i><pre>\t${status}<pre></div>
            <br>
            <button class='up_b' data-id='${budget.id}'><i class="fa-solid fa-pen" style="color: rgb(0, 0, 0);"></i></button>
            <button class='del_b' data-id='${budget.id}'><i class="fa-solid fa-trash-can" style="color: rgb(230, 71, 71);"></i></button>`;
        }
        else if(budget.amount - spent >= 0)
        {
            div.innerHTML = `
            <h3 id='temp_cat'>${budget.category}</h3>
            <p id='temp_amt'>Budget : ₹${budget.amount}</p>
            <p id='temp_spent'>Spent : ₹${spent}</p>
            <p id='temp_rem'>Remaining : ₹${budget.amount - spent}</p>
            <br>
            <div class="progress">
            <div class="progress-fill" style="width: ${barPercentage}%;background-color:rgb(255,212,59)"></div>
            </div>
            <pre>${percentage}%</pre>
            <br>
            <p id='temp_mon'>${budget.month}</p>
            <div class='status'><i class="fa-solid fa-triangle-exclamation" style="color: rgb(255, 212, 59);"></i><pre>\t${status}<pre></div>
            <br>
            <button class='up_b' data-id='${budget.id}'><i class="fa-solid fa-pen" style="color: rgb(0, 0, 0);"></i></button>
            <button class='del_b' data-id='${budget.id}'><i class="fa-solid fa-trash-can" style="color: rgb(230, 71, 71);"></i></button>`;
        }
        else
        {
            div.innerHTML = `
            <h3 id='temp_cat'>${budget.category}</h3>
            <p id='temp_amt'>Budget : ₹${budget.amount}</p>
            <p id='temp_spent'>Spent : ₹${spent}</p>
            <p id='temp_rem'>Remaining : - ₹${spent - budget.amount}</p>
            <br>
            <div class="progress">
            <div class="progress-fill" style="width: ${barPercentage}%;background-color: rgb(221,73,63)"></div>
            </div>
            <pre>${percentage}%</pre>
            <br>
            <p id='temp_mon'>${budget.month}</p>
            <div class='status'><i class="fa-solid fa-skull-crossbones" style="color: rgb(221, 73, 63);"></i><pre>\t${status}<pre></div>
            <br>
            <button class='up_b' data-id='${budget.id}'><i class="fa-solid fa-pen" style="color: rgb(0, 0, 0);"></i></button>
            <button class='del_b' data-id='${budget.id}'><i class="fa-solid fa-trash-can" style="color: rgb(230, 71, 71);"></i></button>`;
        }
        d.appendChild(div);
        const del = div.querySelector('.del_b');
        del.addEventListener('click',async()=>{
            const id = del.dataset.id;
            const response = await fetch(`/budget/${id}`,{
                method : 'DELETE'
            });
            const data = await response.json();
            console.log(data);
            window.location.reload();
        })
        const up = div.querySelector('.up_b');
        up.addEventListener('click',async ()=>{
            document.getElementById('b_cat').value = budget.category;
            document.getElementById('b_amt').value = budget.amount;
            document.getElementById('b_mon').value = budget.month;
            budgetId = up.dataset.id;
        })
    })
    const ow = document.getElementById('overview');
    let div1 = document.createElement('div');
    div1.innerHTML = '';
    div1.innerHTML = `<p>Total budget</p>
                    <p>₹${tb}</p>`;
    ow.appendChild(div1);
    let div2 = document.createElement('div');
    div2.innerHTML = '';
    div2.innerHTML = `<p>Total spent</p>
                    <p>₹${ts}</p>`;
    ow.appendChild(div2);
    let div3 = document.createElement('div');
    if(tb-ts >= 0)
    {
        div3.innerHTML = '';
        div3.innerHTML = `<p>Remaining</p>
                          <p>₹${tb-ts}</p>`;
        ow.appendChild(div3);
    }
    else
    {
        div3.innerHTML = '';
        div3.innerHTML = `<p>Remaining</p>
                          <p>-₹${ts-tb}</p>`;
        ow.appendChild(div3);
    }
}
bgts();