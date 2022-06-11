const { response } = require("express");
const morgan = require('morgan')
const express = require("express");
const cors = require('cors')

const app = express();
app.use(cors())
app.use(express.static("build"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(morgan(function (tokens, req, res) {
  const datasent = JSON.parse(JSON.stringify(req.body))
  delete datasent.id
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(datasent)
  ].join(' ')
}));
app.use(express.json());

app.get("/api/persons", (req, res) => {
  if (persons) {
    res.json(persons);
  } else {
    res.status(404).end();
  }
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const newPerson = req.body;
  newPerson.id = uniqueId;

  if (!newPerson.name && !newPerson.number) {
    return res.status(400).json({
      error: "The name and number are missing",
    });
  } else if (!newPerson.name) {
    return res.status(400).json({
      error: "The name is missing",
    });
  } else if (!newPerson.number) {
    return res.status(400).json({
      error: "The number is missing",
    });
  } else if (
    persons.findIndex((person) => person.name === newPerson.name) > -1
  ) {
    return res.status(400).json({
      error: "The name already exists in the phonebook",
    });
  }

  persons = persons.concat(newPerson);
  res.json(newPerson);
});

app.get("/info", (req, res) => {
  res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toString()}</p>
  `);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
