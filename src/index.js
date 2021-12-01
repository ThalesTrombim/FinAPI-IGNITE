const { response } = require('express');
const express = require('express');
const { v4: uuid } = require('uuid');
const app = express();

app.use(express.json());

const costumers = [];

function verifyExistsAccountCPF(req, res, next){
    const { cpf } = req.headers;

    const costumer = costumers.find(costumer => costumer.cpf === cpf);

    if(!costumer){
        return res.status(400).json({ error: "Costumer not found"});
    }

    req.costumer = costumer;
    return next();
}

function getBalance(statement){
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'Credit'){
            return acc + operation.amount;
        }else {
            return acc - operation.amount;
        }
    }, 0)

    return balance;
}

app.post('/account', (req, res) => {
    const {name, cpf} = req.body;

    const costumerAlreadyExists = costumers.some(
        costumer => costumer.cpf === cpf
    );

    if(costumerAlreadyExists){
        return res.status(400).json({ error: "Customer already exists!" });
    }

    costumers.push({
        name,
        cpf,
        id: uuid(),
        statement: []
    })

    return res.json(201).send();
});

app.get('/statement', verifyExistsAccountCPF, (req, res) => {
    const { costumer } = req;
    return res.json(costumer.statement);
})

app.post('/deposit', verifyExistsAccountCPF, (req, res) => {
    const { description, amount } = req.body;
    
    const { costumer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "Credit"
    }

    costumer.statement.push(statementOperation);

    return res.status(201).send();
})

app.post('/withdraw', verifyExistsAccountCPF, (req, res) => {
    const { amount } = req.body;  
    const { costumer } = req;

    const balance = getBalance(costumer.statement);

    if(balance < amount){
        return res.status(400).json({ error: "Insufficient funds!"})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "Debit"
    } 

    costumer.statement.push(statementOperation);

    return res.status(201).send();
})

app.get('/statement/date', verifyExistsAccountCPF, (req, res) => {
    const { costumer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");
    const statement = costumer.statement.filter(
            (statement) => 
            statement.created_at.toDateString() === 
            new Date(dateFormat).toDateString()
        );

    return res.json(statement);
})

app.put('/account', verifyExistsAccountCPF, (req, res) => {
    const { name } = req.body;
    const { costumer } = req;

    costumer.name = name;

    return res.status(201).send();
})

app.get('/account', verifyExistsAccountCPF, (req, res) => {
    const { costumer } = req;

    return res.json(costumer);
})

app.delete('/account', verifyExistsAccountCPF, (req, res) => {
    const { costumer } = req;

    costumers.splice(costumer, 1);

    return res.status(200).json(costumers);
})

app.get('/balance', verifyExistsAccountCPF, (req, res) => {
    const { costumer } = req;

    const balance = getBalance(costumer.statement);

    console.log(costumers);
    return res.json(balance);
})

app.listen(4000, ()=> console.log('funfando'));