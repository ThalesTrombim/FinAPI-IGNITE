const { response } = require('express');
const express = require('express');
const { v4: uuid } = require('uuid');
const app = express();

app.use(express.json());

const costumers = [];

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

app.get('/statement', (req, res) => {
    const { cpf } = req.headers;

    const costumer = costumers.find(costumer => costumer.cpf === cpf);

    if(!costumer){
        return res.status(400).json({ error: "Costumer not found"});
    }

    return res.json(costumer.statement);
})

app.listen(4000, ()=> console.log('funfando'));