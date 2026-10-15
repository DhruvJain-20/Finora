const savingsForm = document.getElementById('savings_form');
savingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goal_name = document.getElementById('goal_name').value.trim();
    const target_amount = Number(
        document.getElementById('target_amount').value
    );
    const target_date = document.getElementById('target_date').value;
    try {
        const response = await fetch('/savings-goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                goal_name,
                target_amount,
                target_date
            })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Could not create goal.');
        }
        savingsForm.reset();
        await loadCurrentGoals();
    } catch (error) {
        alert(error.message);
    }
});

async function loadCurrentGoals() {
    const current_goals = document.getElementById('current_goals');
    try {
        const response = await fetch('/savings-goals');
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Could not load goals.');
        }
        current_goals.replaceChildren();
        if (data.length === 0) {
            current_goals.textContent = 'No savings goals yet. Create your first goal!';
            return;
        }
        data.forEach((goal) => {
            const target = Number(goal.target_amount);
            const saved = Number(goal.saved_amount || 0);
            const remaining = Math.max(target - saved, 0);
            const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
            const date = goal.target_date ? goal.target_date.split('-').reverse().join(' / ') : 'No deadline';
            const div = document.createElement('div');
            div.className = 'goal-card';
            div.innerHTML = `
                <h4></h4>
                <p>Target Amount: ₹${target.toLocaleString('en-IN')}</p>
                <p>Target Date: ${date}</p>
                <p>Saved: ₹${saved.toLocaleString('en-IN')}</p>
                <div class="goal-progress">
                    <div class="goal-progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p>${percentage.toFixed(1)}% completed</p>
                <p>Remaining: ₹${remaining.toLocaleString('en-IN')}</p>
                <label>
                    Amount to update (₹)
                    <input type="number" min="0.01" step="0.01" class="goal-change-amount" placeholder="Enter amount">
                </label>
                <button type="button" class="add-savings">+ Add</button>

                <button type="button" class="remove-savings">- Remove</button>`;
            div.querySelector('h4').textContent = goal.goal_name;
            const amountInput = div.querySelector('.goal-change-amount');
            div.querySelector('.add-savings').addEventListener('click', () => {
                changeSavedAmount(goal, amountInput, 'add');
            });
            div.querySelector('.remove-savings').addEventListener('click', () => {
                changeSavedAmount(goal, amountInput, 'remove');
            });
            current_goals.appendChild(div);
        });
    }
    catch (error)
    {
        console.error(error);
        current_goals.textContent = 'Could not load savings goals.';
    }
}

async function changeSavedAmount(goal, amountInput, action) {
    const amount = Number(amountInput.value);
    const currentSaved = Number(goal.saved_amount || 0);
    if (!Number.isFinite(amount) || amount <= 0)
    {
        alert('Please enter an amount greater than zero.');
        return;
    }
    const newSaved = action === 'add' ? currentSaved + amount : currentSaved - amount;
    if (newSaved < 0)
    {
        alert('You cannot remove more than the amount saved.');
        return;
    }
    try {
        const response = await fetch(`/savings-goals/${goal.id}/saved`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    saved_amount: newSaved
                })
            }
        );
        const result = await response.json();
        if (!response.ok)
        {
            throw new Error(result.error || 'Could not update savings.');
        }
        await loadCurrentGoals();
    }
    catch (error)
    {
        alert(error.message);
    }
}

loadCurrentGoals();

