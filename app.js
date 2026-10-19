require("dotenv").config()

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const supabase = require('./supabase');
const createSupabaseSession = require('./supabase-session');
const requireAuth = require('./auth-middleware');

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser());
app.set('view engine','ejs')
app.use(express.static('public'))

const {
    generateFinancialInsights,
    chatWithFinora
} = require('./gemini');

app.get('/',(req,res)=>{
    res.render('index')
});

app.get('/dashboard', (req, res) => {
    res.redirect('/transactions-page');
});

app.get('/transactions-page', requireAuth, (req, res) => {
    res.render('transactions');
});

app.get('/budgets-page', requireAuth, (req, res) => {
    res.render('budgets');
});


app.get('/transactions', requireAuth, async (req, res) => {
    const { data, error } = await req.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', req.user.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

app.post('/transactions', requireAuth, async (req, res) => {
    const {
        amount, type, category, description,
        merchant, date, payment_method
    } = req.body;

    const { data, error } = await req.supabase
        .from('transactions')
        .insert([{
            amount,
            type,
            category,
            description,
            merchant,
            date,
            payment_method,
            user_id: req.user.id
        }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

app.delete('/transactions/:id', requireAuth, async (req, res) => {
    const { data, error } = await req.supabase
        .from('transactions')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({
            error: 'Transaction not found.'
        });
    }

    res.json({ message: 'Transaction deleted successfully' });
});

app.put('/transactions/:id', requireAuth, async (req, res) => {
    const {
        amount, type, category, description,
        merchant, date, payment_method
    } = req.body;

    const { data, error } = await req.supabase
        .from('transactions')
        .update({
            amount,
            type,
            category,
            description,
            merchant,
            date,
            payment_method
        })
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({
            error: 'Transaction not found.'
        });
    }

    res.json(data);
});

app.get('/budget', requireAuth, async (req, res) => {
    const { data, error } = await req.supabase
        .from('budgets')
        .select('*')
        .eq('user_id', req.user.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

app.post('/budget', requireAuth, async (req, res) => {
    const { category, amount, month } = req.body;

    const { data, error } = await req.supabase
        .from('budgets')
        .insert([{
            category,
            amount,
            month,
            user_id: req.user.id
        }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

app.delete('/budget/:id', requireAuth, async (req, res) => {
    const { data, error } = await req.supabase
        .from('budgets')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Budget not found.' });
    }

    res.json({ message: 'Budget deleted successfully' });
});

app.put('/budget/:id', requireAuth, async (req, res) => {
    const { category, amount, month } = req.body;

    const { data, error } = await req.supabase
        .from('budgets')
        .update({ category, amount, month })
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Budget not found.' });
    }

    res.json(data);
});


app.get('/analysis', requireAuth,(req,res)=>{
    res.render('analysis');
})

app.get('/savings-goals',requireAuth,async (req,res)=>{
    const {data,error} = await req.supabase.from('savings_goals').select('*').eq('user_id', req.user.id);
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    return res.json(data);
})

app.post('/savings-goals',requireAuth,async (req,res)=>{
    const {goal_name,target_amount,target_date} = req.body;
    const {data,error} = await req.supabase.from('savings_goals').insert([
        {
            goal_name,
            target_amount,
            target_date,
            user_id: req.user.id
        }
    ]).select()
    if(error)
    {
        return res.status(500).json({error : error.message});
    }
    return res.status(201).json(data);
})


app.put('/savings-goals/:id/saved', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { saved_amount } = req.body;
    if(saved_amount === undefined || saved_amount === null || !Number.isFinite(Number(saved_amount)) || Number((saved_amount) < 0))
    {
        return res.status(400).json({
            error: 'Saved amount must be a non-negative number.'
        });
    }
    const { data, error } = await req.supabase
        .from('savings_goals')
        .update({ saved_amount: Number(saved_amount) })
        .eq('id', id)
        .eq('user_id', req.user.id)
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

app.get('/savings', requireAuth,(req,res)=>{
    res.render('savings');
})

app.get('/ai-insights', requireAuth, (req, res) => {
    res.render('ai-insights');
});

app.post('/ai-insights/test', requireAuth, async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: transactions, error: transactionError } =
            await req.supabase
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
        const { data: budgets, error: budgetError } = await req.supabase
            .from('budgets')
            .select('*')
            .eq(
                'month',
                new Date().toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric'
                })
            ).eq('user_id', req.user.id);
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

app.get('/signup', (req, res) => {
    res.render('signup', {
        supabaseUrl: process.env.SUPABASE_URL,
        supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY
    });
});


app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required.'
        });
    }

    try {
        const supabaseSession = createSupabaseSession(req, res);

        const { data, error } = await supabaseSession.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.session) {
            return res.json({
                success: true,
                message: 'Account created successfully.'
            });
        }

        return res.json({
            success: true,
            message: 'Check your email to confirm your account.'
        });
    } catch (error) {
        console.error('Signup error:', error.message);

        return res.status(500).json({
            error: 'Unable to create account right now.'
        });
    }
});


app.get('/login', (req, res) => {
    res.render('login', {
        supabaseUrl: process.env.SUPABASE_URL,
        supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY
    });
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required.'
        });
    }

    try {
        const supabaseSession = createSupabaseSession(req, res);

        const { data, error } =
            await supabaseSession.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            return res.status(401).json({
                error: 'Invalid email or password, or email not confirmed.'
            });
        }

        if (!data.session) {
            return res.status(401).json({
                error: 'Login did not create a session. Please try again.'
            });
        }

        return res.json({
            success: true,
            message: 'Login successful.'
        });
    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            error: 'Unable to log in right now.'
        });
    }
});

app.get('/auth-status', async (req, res) => {
    try {
        const supabaseSession = createSupabaseSession(req, res);

        const { data, error } = await supabaseSession.auth.getUser();

        if (error || !data.user) {
            return res.status(401).json({
                authenticated: false
            });
        }

        return res.json({
            authenticated: true,
            email: data.user.email
        });
    } catch (error) {
        console.error('Auth status error:', error.message);

        return res.status(500).json({
            authenticated: false,
            error: 'Unable to check session.'
        });
    }
});

app.get('/ai-chat', requireAuth, (req, res) => {
    res.render('ai-chat');
});

app.post('/ai-chat', requireAuth, async (req, res) => {
    const { message, history = [] } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
            error: 'Please enter a message.'
        });
    }

    if (message.length > 2000) {
        return res.status(400).json({
            error: 'Your message must be 2000 characters or fewer.'
        });
    }

    if (!Array.isArray(history) || history.length > 10) {
        return res.status(400).json({
            error: 'Invalid conversation history.'
        });
    }

    const validHistory = history.every(item =>
        item &&
        ['user', 'model'].includes(item.role) &&
        Array.isArray(item.parts) &&
        item.parts.length > 0 &&
        item.parts.every(part =>
            part &&
            typeof part.text === 'string' &&
            part.text.length <= 10000
        )
    );

    if (!validHistory) {
        return res.status(400).json({
            error: 'Invalid conversation history format.'
        });
    }

    try {

const currentDate = new Date();
const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
const currentYear = currentDate.getFullYear();
const monthPrefix = `${currentYear}-${currentMonth}`;
const monthName = currentDate.toLocaleString('en-US', {
    month: 'long'
});
const budgetMonth = `${monthName} ${currentYear}`;

const [
    { data: transactions, error: transactionError },
    { data: budgets, error: budgetError },
    { data: goals, error: goalError }
] = await Promise.all([
    req.supabase
        .from('transactions')
        .select('amount, type, category, date')
        .eq('user_id', req.user.id)
        .gte('date', `${monthPrefix}-01`)
        .lt(
            'date',
            new Date(currentYear, currentDate.getMonth() + 1, 1)
                .toISOString()
                .slice(0, 10)
        ),

    req.supabase
        .from('budgets')
        .select('category, amount, month')
        .eq('user_id', req.user.id)
        .eq('month', budgetMonth),

    req.supabase
        .from('savings_goals')
        .select('goal_name, target_amount, saved_amount, target_date')
        .eq('user_id', req.user.id)
]);

if (transactionError || budgetError || goalError) {
    console.error('Financial context fetch failed:', {
        transactions: transactionError?.message,
        budgets: budgetError?.message,
        goals: goalError?.message
    });

    return res.status(500).json({
        error: 'Unable to load your financial summary right now.'
    });
}

const financialContext = {
    month: budgetMonth,
    totalIncome: transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),

    totalExpenses: transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),

    expenseBreakdown: transactions
    .filter(t => t.type === 'Expense')
    .reduce((breakdown, t) => {
        const category = t.category || 'Other';
        breakdown[category] =
            (breakdown[category] || 0) + Number(t.amount || 0);
        return breakdown;
    }, {}),

    budgets: budgets.map(b => ({
        category: b.category,
        amount: Number(b.amount || 0)
    })),

    savingsGoals: goals.map(g => ({
        name: g.goal_name,
        targetAmount: Number(g.target_amount || 0),
        savedAmount: Number(g.saved_amount || 0),
        targetDate: g.target_date
    }))
};

       const reply = await chatWithFinora(
    message.trim(),
    history,
    financialContext
);
        return res.json({ reply });
    } catch (error) {
        console.error('AI chat error:', error.message);

        return res.status(500).json({
            error: 'Finora AI could not respond right now. Please try again.'
        });
    }
});

app.post('/signout', async (req, res) => {
    try {
        const supabase = createSupabaseSession(req, res);

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Sign out error:', error.message);
            return res.status(500).json({
                error: 'Unable to sign out.'
            });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error('Sign out failed:', error.message);
        return res.status(500).json({
            error: 'Unable to sign out.'
        });
    }
});

app.listen(3000, () => {
    console.log("Finora running on port 3000");
});
