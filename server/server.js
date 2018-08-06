const _ = require ('lodash')

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


var {mongoose} = require('./db/mongoose');
var {Todo} = require ('./models/todo');
var {User} = require ('./models/user');

var app = express();

app.use(bodyParser.json());

//send a post to the database and save to db
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

//get todos from db
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});

    }, (e) => {
        res.status(400).send(e);

    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    //validate id, if not respond with a 404
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    //find no todo respond with 404 and empty body, if exists, send todo
    Todo.findById(id).then((todo) => {
        if(!todo) {
            return res.status(404).send();
        }

        res.send({todo: todo})

    }).catch((e) => {
        res.status(400).send();
    });


});

//delete a todo
app.delete('/todos/:id', (req, res) => {
    //get the id
    var id = req.params.id;

    //validate the id..not valid return 404
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        //if theres no todo respond 404 again
        if(!todo) {
            return res.status(404).send();
        }

        res.send(todo);

        //catch anything else
    }).catch((e) => {
        res.status(400).send();
    })

});

//update stuff
app.patch('/todos/:id', (req, res) => {
    //get id, use lodash to modify body
    var id = req.params.id
    var body = _.pick(req.body ['text', 'completed']);

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) &&  body.completed) {
        body.completedAt = new Date().getTime();
    } 
    else {
        body.completed = false;
        body.completedAt = null;

    }

    //actual query to update
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }


        res.send({todo: todo})

        //catch errors
    }).catch((e)=> {
        res.send(400).send();
    })

});

app.listen(3000, () => {
    console.log('started on port 3000');
});