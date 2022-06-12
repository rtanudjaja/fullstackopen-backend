require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const Person = require("./models/person");
const app = express();

app.use(cors());

app.use(express.static("build"));

app.use(express.json());

app.use(
  morgan(function (tokens, req, res) {
    const datasent = JSON.parse(JSON.stringify(req.body));
    delete datasent.id;
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(datasent),
    ].join(" ");
  })
);

app.get("/api/persons", (req, res) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch(() => {
      res.status(404).end();
    });
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(500).end();
    });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
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

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
