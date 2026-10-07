require("dotenv").config()

const express = require('express')
const app = express()

const supabase = require('./supabase')

app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.set('view engine','ejs')
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/dashboard',(req,res)=>{
    res.render('dashboard')
})

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

app.listen(3000, () => {
    console.log("Finora running on port 3000");
});