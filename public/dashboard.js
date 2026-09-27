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
    console.log("Sending:", transaction);
    const response = await fetch('/transactions',{
        method : "POST",
        headers : {"Content-Type": "application/json"},
        body : JSON.stringify(transaction)
    });
    const data = await response.json();
    console.log("Server response:", data);
})
async function loadTransactions() {
    const response = await fetch("/transactions");
    const transactions = await response.json();
    const transactionsList = document.getElementById("tList");
    transactionsList.innerHTML = "";
    transactions.forEach(transaction => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h3>${transaction.category}</h3>
            <p>₹${transaction.amount}</p>
            <p>${transaction.description}</p>
            <p>${transaction.type}</p>
        `;
        transactionsList.appendChild(div);
    });
}
loadTransactions();