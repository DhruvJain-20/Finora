require("dotenv").config()

const express = require('express')
const app = express()

const supabase = require('./supabase')

app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.set('view engine','ejs')
app.use(express.static('public'))

const { generateFinancialInsights } = require('./gemini');

app.get('/',(req,res)=>{
    res.render('index')
});

app.get('/dashboard', (req, res) => {
    res.redirect('/transactions-page');
});

app.get('/transactions-page', (req, res) => {
    res.render('transactions');
});

app.get('/budgets-page', (req, res) => {
    res.render('budgets');
});

app.get('/transactions',async (req,res)=>{
    const {data,error} = await supabase.from('transactions').select('*');
    if(error) {
        return res.status(500).json({error : error.message});
    }
    res.json(data);
})

app.post('/transactions',async (req,res)=>{
    const {amount, type, category, description, merchant, date, payment_method} = req.body;
    const {data,error} = await supabase.from('transactions').insert([
        {
            amount,
            type,
            category,
            description,
            merchant,
            date,
            payment_method
        }
    ]).select()
    if(error) {
        return res.status(500).json({error : error.message});
    }
    res.status(201).json(data);
});

app.delete("/transactions/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { error } = await supabase.from("transactions").delete().eq("id", id);
        if (error) {
            throw error;
        }
        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/transactions/:id",async (req,res) => {
    const id = req.params.id;
    const { amount, type, category, description, merchant, date, payment_method } = req.body;
    const {data, error} = await supabase.from("transactions").update({amount,type,category,description,merchant,date,payment_method}).eq("id",id).select();
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    res.json(data);
})

app.get('/budget',async (req,res)=>{
    const {data,error} = await supabase.from('budgets').select('*');
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    res.json(data);
})

app.post('/budget',async (req,res)=>{
    const {category,amount,month} = req.body;
    const {data,error} = await supabase.from('budgets').insert([
        {
            category,
            amount,
            month
        }
    ]).select()
    if(error)
    {
        return res.status(500).json({ error : error.message });
    }
    res.status(201).json(data);
});

app.delete('/budget/:id',async (req,res)=>{
    const id = req.params.id;
    const {error} = await supabase.from('budgets').delete().eq('id',id);
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    return res.json({message : "Budget deleted successful"})
})

app.put('/budget/:id',async (req,res)=>{
    const id = req.params.id;
    const {category,amount,month} = req.body;
    const {data,error} = await supabase.from('budgets').update({category,amount,month}).eq('id',id).select();
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    return res.json(data);
})

app.get('/analysis',(req,res)=>{
    res.render('analysis');
})

app.get('/savings-goals',async (req,res)=>{
    const {data,error} = await supabase.from('savings_goals').select('*');
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    return res.json(data);
})

app.post('/savings-goals',async (req,res)=>{
    const {goal_name,target_amount,target_date} = req.body;
    const {data,error} = await supabase.from('savings_goals').insert([
        {
            goal_name,
            target_amount,
            target_date
        }
    ]).select()
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    return res.status(201).json(data);
})


app.put('/savings-goals/:id/saved', async (req, res) => {
    const { id } = req.params;
    const { saved_amount } = req.body;
    if(saved_amount === undefined || saved_amount === null || !Number.isFinite(Number(saved_amount)) || Number((saved_amount) < 0))
    {
        return res.status(400).json({
            error: 'Saved amount must be a non-negative number.'
        });
    }
    const { data, error } = await supabase
        .from('savings_goals')
        .update({ saved_amount: Number(saved_amount) })
        .eq('id', id)
        .select()
        .single();
    if (error)
    {
        return res.status(500).json({ error: error.message });
    }
    if (!data)
    {
        return res.status(404).json({
            error: 'Savings goal not found.'
        });
    }
    return res.json(data);
});

app.get('/savings',(req,res)=>{
    res.render('savings');
})

app.get('/ai-insights', (req, res) => {
    res.render('ai-insights');
});

app.post('/ai-insights/test', async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: transactions, error: transactionError } =
            await supabase
                .from('transactions')
                .select('*')
                .gte('date', `${currentMonth}-01`)
                .lt(
                    'date',
                    new Date(
                        new Date().getFullYear(),
                        new Date().getMonth() + 1,
                        1
                    ).toISOString().slice(0, 10)
                );
        if (transactionError) {
            throw transactionError;
        }
        const { data: budgets, error: budgetError } = await supabase
            .from('budgets')
            .select('*')
            .eq(
                'month',
                new Date().toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric'
                })
            );
        if (budgetError) {
            throw budgetError;
        }
        const totalIncome = transactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const categoryExpenses = {};
        transactions
            .filter(t => t.type === 'Expense')
            .forEach(t => {
                categoryExpenses[t.category] =
                    (categoryExpenses[t.category] || 0) +
                    Number(t.amount);
            });
        const financialData = {
            month: currentMonth,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            categoryExpenses,
            budgets: budgets.map(b => ({
                category: b.category,
                budgetAmount: Number(b.amount),
                spent: categoryExpenses[b.category] || 0
            }))
        };
        const insights = await generateFinancialInsights(financialData);
        res.json({ insights });
    } catch (error) {
        console.error('Gemini error details:', error);
        res.status(500).json({
            error: error.message || 'Unable to generate AI insights.'
        });
    }
});

app.listen(3000, () => {
    console.log("Finora running on port 3000");
});
