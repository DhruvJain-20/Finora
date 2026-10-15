
let budgetId = null;

const currentDate = new Date();

const currentMonth = currentDate.toISOString().slice(0, 7);

const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

const budgetMonth =
    `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

const budgetForm = document.getElementById("b_form");
const budgetMonthInput = document.getElementById("b_mon");

if (budgetMonthInput && !budgetMonthInput.value) {
    budgetMonthInput.value = budgetMonth;
}

budgetForm.addEventListener("submit", async event => {
    event.preventDefault();

    const budget = {
        category: document.getElementById("b_cat").value,
        amount: Number(document.getElementById("b_amt").value),
        month: document.getElementById("b_mon").value.trim()
    };

    const url = budgetId
        ? `/budget/${budgetId}`
        : "/budget";

    const method = budgetId ? "PUT" : "POST";

    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(budget)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        alert(error.error || "Unable to save budget.");
        return;
    }

    budgetId = null;

    budgetForm.reset();
    document.getElementById("b_mon").value = budgetMonth;
    document.getElementById("b_sub").value = "Add Budget";

    await loadBudgets();
});

async function loadBudgets() {
    const [transactionResponse, budgetResponse] = await Promise.all([
        fetch("/transactions"),
        fetch("/budget")
    ]);

    if (!transactionResponse.ok || !budgetResponse.ok) {
        throw new Error("Unable to load budgets or transactions.");
    }

    const transactions = await transactionResponse.json();
    const budgets = await budgetResponse.json();

    const currentTransactions = transactions.filter(transaction =>
        transaction.date && transaction.date.startsWith(currentMonth)
    );

    const currentBudgets = budgets.filter(
        budget => budget.month === budgetMonth
    );

    const categorySpent = {};

    currentTransactions.forEach(transaction => {
        if (transaction.type !== "Expense") return;

        const amount = Number(transaction.amount) || 0;

        categorySpent[transaction.category] =
            (categorySpent[transaction.category] || 0) + amount;
    });

    const container = document.getElementById("b_temp");
    const overview = document.getElementById("overview");

    container.innerHTML = "";
    overview.innerHTML = "";

    let totalBudget = 0;
    let totalSpent = 0;

    if (currentBudgets.length === 0) {
        container.innerHTML =
            "<p>No budgets for this month yet. Add your first budget to get started.</p>";
    }

    currentBudgets.forEach(budget => {
        const amount = Number(budget.amount) || 0;
        const spent = categorySpent[budget.category] || 0;
        const remaining = amount - spent;

        const percentage = amount > 0 ? (spent / amount) * 100 : 0;
        const barPercentage = Math.min(percentage, 100);

        let status;

        if (percentage >= 100) {
            status = percentage === 100
                ? "Limit Reached"
                : "Budget Exceeded";
        } else if (percentage >= 85) {
            status = "Approaching Limit";
        } else {
            status = "On track";
        }

        totalBudget += amount;
        totalSpent += spent;

        const card = document.createElement("div");
        card.id = "temp_bgts";

        card.innerHTML = `
            <h3>${budget.category}</h3>
            <p>Budget: ₹${amount.toLocaleString("en-IN")}</p>
            <p>Spent: ₹${spent.toLocaleString("en-IN")}</p>
            <p>Remaining: ${remaining < 0 ? "- " : ""}₹${Math.abs(remaining).toLocaleString("en-IN")}</p>

            <div class="progress">
                <div class="progress-fill"
                     style="width:${barPercentage}%; ${
                         percentage >= 100
                             ? "background-color:rgb(221,73,63)"
                             : percentage >= 85
                                 ? "background-color:rgb(255,212,59)"
                                 : ""
                     }">
                </div>
            </div>

            <p>${percentage.toFixed(2)}%</p>
            <p>${budget.month}</p>
            <p class="status">${status}</p>


<button class="up_b" type="button" data-id="${budget.id}" title="Edit budget" aria-label="Edit budget">
    <i class="fa-solid fa-pen"></i>
</button>

<button class="del_b" type="button" data-id="${budget.id}" title="Delete budget" aria-label="Delete budget">
    <i class="fa-solid fa-trash-can"></i>
</button>

        `;

        card.querySelector(".del_b").addEventListener("click", async () => {
            if (!confirm("Delete this budget?")) return;

            const response = await fetch(`/budget/${budget.id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                alert("Could not delete budget.");
                return;
            }

            await loadBudgets();
        });

        card.querySelector(".up_b").addEventListener("click", () => {
            budgetId = budget.id;

            document.getElementById("b_cat").value = budget.category;
            document.getElementById("b_amt").value = budget.amount;
            document.getElementById("b_mon").value = budget.month;
            document.getElementById("b_sub").value = "Update Budget";

            budgetForm.scrollIntoView({ behavior: "smooth" });
        });

        container.appendChild(card);
    });

    const remaining = totalBudget - totalSpent;

    overview.innerHTML = `
        <div>
            <p>Total budget</p>
            <p>₹${totalBudget.toLocaleString("en-IN")}</p>
        </div>

        <div>
            <p>Total spent</p>
            <p>₹${totalSpent.toLocaleString("en-IN")}</p>
        </div>

        <div>
            <p>Remaining</p>
            <p>${remaining < 0 ? "- " : ""}₹${Math.abs(remaining).toLocaleString("en-IN")}</p>
        </div>
    `;
}

loadBudgets().catch(error => {
    console.error(error);
    document.getElementById("b_temp").innerHTML =
        "<p>Unable to load budgets.</p>";
});
