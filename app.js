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
        res.status(500).json({error : error.message});
    }
    res.status(201).json(data);
})

app.listen(3000, () => {
    console.log("Finora running on port 3000");
});