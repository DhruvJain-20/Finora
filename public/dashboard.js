let editingId = null;
form = document.getElementById('transaction_form');
form.addEventListener('submit',async (e)=>{
    // e.preventDefault();
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
})
async function loadTransactions() {
    const response = await fetch("/transactions");
    const transactions = await response.json();
    let ti = 0;
    let te = 0;
    let food = 0;
    let shop = 0;
    let transport = 0;
    let bill = 0;
    let entertain = 0;
    let health = 0;
    let other = 0;
    transactions.forEach(transaction => {
        const div = document.createElement("div");
        div.classList.add('box');
        div.innerHTML = `
            <h3>${transaction.category}</h3>
            <p>₹${transaction.amount}</p>
            <p>${transaction.description}</p>
            <p>${transaction.merchant}</p>
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
    const cat = document.getElementById("cat");
    cat.innerHTML = `
        <pre class='pre'>Food          : ₹ ${food}</pre>
        <pre class='pre'>Shopping      : ₹ ${shop}</pre>
        <pre class='pre'>Transport     : ₹ ${transport}</pre>
        <pre class='pre'>Bills         : ₹ ${bill}</pre>
        <pre class='pre'>Entertainment : ₹ ${entertain}</pre>
        <pre class='pre'>Healthcare    : ₹ ${health}</pre>
        <pre class='pre'>Other         : ₹ ${other}</pre>`;
}
loadTransactions();