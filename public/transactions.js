
let editingId = null;

const currentMonth = new Date().toISOString().slice(0, 7);

const dateInput = document.getElementById("date");

if (dateInput) {
    dateInput.max = new Date().toISOString().slice(0, 10);
}

function displayCategoryTotals(totals) {
    const container = document.getElementById("cat");
    const selected = document.getElementById("cat_fil").value;

    const categories = [
        "Food", "Shopping", "Transport", "Bills",
        "Entertainment", "Healthcare", "Other"
    ];

    const selectedCategories =
        selected === "All" ? categories : [selected];

    container.innerHTML = selectedCategories.map(category => `
        <p class="pre">
            ${category}: ₹${(totals[category] || 0).toLocaleString("en-IN")}
        </p>
    `).join("");
}

function renderTransactions(transactions, typeFilter = "All", searchText = "") {
    const incomeContainer = document.getElementById("income");
    const expenseContainer = document.getElementById("expense");

    incomeContainer.innerHTML = "";
    expenseContainer.innerHTML = "";

    let incomeFound = false;
    let expenseFound = false;

    const filtered = transactions.filter(transaction => {
        const matchesType =
            typeFilter === "All" || transaction.type === typeFilter;

        const searchable = [
            transaction.description,
            transaction.merchant,
            transaction.category,
            transaction.type
        ].filter(Boolean).join(" ").toLowerCase();

        return matchesType && searchable.includes(searchText);
    });

    filtered.forEach(transaction => {
        const card = document.createElement("div");
        card.classList.add("box");

        card.innerHTML = `
            <h3>${transaction.category}</h3>
            <p>₹${Number(transaction.amount).toLocaleString("en-IN")}</p>
            <p>${transaction.description || ""}</p>
            <p>${transaction.merchant || ""}</p>
            <p>${transaction.date ? transaction.date.split("-").reverse().join(" / ") : ""}</p>
            <p>${transaction.payment_method || ""}</p>

            <button class="up" type="button" data-id="${transaction.id}">
                <i class="fa-solid fa-pen"></i>
            </button>

            <button class="del" type="button" data-id="${transaction.id}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        if (transaction.type === "Income") {
            incomeContainer.appendChild(card);
            incomeFound = true;
        } else {
            expenseContainer.appendChild(card);
            expenseFound = true;
        }

        card.querySelector(".del").addEventListener("click", async () => {
            if (!confirm("Delete this transaction?")) return;

            const response = await fetch(`/transactions/${transaction.id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                alert("Could not delete transaction.");
                return;
            }

            await loadTransactions();
        });

        card.querySelector(".up").addEventListener("click", () => {
            editingId = transaction.id;

            document.getElementById("amt").value = transaction.amount;
            document.getElementById("type").value = transaction.type;
            document.getElementById("category").value = transaction.category;
            document.getElementById("description").value = transaction.description;
            document.getElementById("merchant").value = transaction.merchant;
            document.getElementById("date").value = transaction.date;
            document.getElementById("payment").value = transaction.payment_method;

            document.getElementById("submit_t").value = "Update Transaction";

            document.getElementById("transaction_form")
                .scrollIntoView({ behavior: "smooth" });
        });
    });

    if (!incomeFound && typeFilter !== "Expense") {
        incomeContainer.innerHTML = "<p>No Income results found.</p>";
    }

    if (!expenseFound && typeFilter !== "Income") {
        expenseContainer.innerHTML = "<p>No Expense results found.</p>";
    }
}

async function loadTransactions() {
    const response = await fetch("/transactions");

    if (!response.ok) {
        throw new Error("Unable to load transactions.");
    }

    const transactions = await response.json();

    const currentTransactions = transactions.filter(transaction =>
        transaction.date && transaction.date.startsWith(currentMonth)
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    const categoryTotals = {
        Food: 0,
        Shopping: 0,
        Transport: 0,
        Bills: 0,
        Entertainment: 0,
        Healthcare: 0,
        Other: 0
    };

    currentTransactions.forEach(transaction => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "Income") {
            totalIncome += amount;
        } else if (transaction.type === "Expense") {
            totalExpenses += amount;

            if (Object.hasOwn(categoryTotals, transaction.category)) {
                categoryTotals[transaction.category] += amount;
            }
        }
    });

    const balance = totalIncome - totalExpenses;

    document.getElementById("tot").innerHTML = `
        <p>Total Income: ₹${totalIncome.toLocaleString("en-IN")}</p>
        <p>Total Expenses: ₹${totalExpenses.toLocaleString("en-IN")}</p>
        <p>Balance: ${balance < 0 ? "- " : ""}₹${Math.abs(balance).toLocaleString("en-IN")}</p>
    `;

    displayCategoryTotals(categoryTotals);
    renderTransactions(currentTransactions);

    document.getElementById("apply").addEventListener("click", () => {
        displayCategoryTotals(categoryTotals);
    });

    const applyFilters = () => {
        const typeFilter = document.getElementById("type_fil").value;
        const searchText = document.getElementById("search").value
            .toLowerCase().trim();

        renderTransactions(currentTransactions, typeFilter, searchText);
    };

    document.getElementById("apply_fil").addEventListener("click", applyFilters);
    document.getElementById("sb").addEventListener("click", applyFilters);

    document.getElementById("search").addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            applyFilters();
        }
    });

    document.getElementById("sort_btn").addEventListener("click", () => {
        const sorted = [...currentTransactions];
        const sort = document.getElementById("sort").value;

        if (sort === "Newest") {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sort === "Oldest") {
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sort === "Highest") {
            sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
        } else if (sort === "Lowest") {
            sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
        }

        renderTransactions(
            sorted,
            document.getElementById("type_fil").value,
            document.getElementById("search").value.toLowerCase().trim()
        );
    });
}

document.getElementById("transaction_form").addEventListener("submit", async event => {
    event.preventDefault();

    const transaction = {
        amount: Number(document.getElementById("amt").value),
        type: document.getElementById("type").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        merchant: document.getElementById("merchant").value.trim(),
        date: document.getElementById("date").value,
        payment_method: document.getElementById("payment").value
    };

    const url = editingId
        ? `/transactions/${editingId}`
        : "/transactions";

    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transaction)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        alert(error.error || "Unable to save transaction.");
        return;
    }

    editingId = null;

    document.getElementById("transaction_form").reset();
    document.getElementById("submit_t").value = "Add Transaction";

    await loadTransactions();
});

loadTransactions().catch(error => {
    console.error(error);
    document.getElementById("income").innerHTML =
        "<p>Unable to load transactions.</p>";
    document.getElementById("expense").innerHTML =
        "<p>Unable to load transactions.</p>";
});
