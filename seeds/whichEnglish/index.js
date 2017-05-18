const Papa = require('babyparse');
const fs = require('fs');
const modelObj = require('../../db');
const flatten = require('lodash.flatten');
const path = require('path');
let quiz = path.resolve(__dirname).split('/').pop();
const db = modelObj[quiz];
fs.readFileSync(`./seeds/${quiz}/Trials.csv`);

var data = Papa.parseFiles(
  [
    `./seeds/${quiz}/Trials.csv`,
    `./seeds/${quiz}/Questions.csv`,
    `./seeds/${quiz}/Choices.csv`,
    `./seeds/${quiz}/Languages.csv`
  ],
  { header: true }
);
const trials = data[0].data;
let questions = data[1].data;
let choices = data[2].data;
let languages = data[3].data;
db
  .knex('choices')
  .del()
  .then(() => {
    return db.knex('questions').del();
  })
  .then(() => {
    return db.knex('userLanguages').del();
  })
  .then(() => {
    return db.knex('responses').del();
  })
  .then(() => {
    return db.knex('users').del();
  })
  .then(() => {
    return db.knex('trials').del();
  })
  .then(() => {
    return db.knex('languages').del();
  })
  .then(() => {
    return db.knex('trials').insert(trials).returning('*');
  })
  .then(rows => {
    const allQuestions = rows.map(trial => {
      return questions
        .filter(question => question.trial === trial.name)
        .map(question => {
          question.trialId = trial.id;
          delete question.trial;
          return question;
        });
    });
    return db.knex('questions').insert(flatten(allQuestions)).returning('*');
  })
  .then(rows => {
    const allChoices = rows.map(question => {
      return choices
        .filter(choice => choice.question == question.prompt)
        .map(choice => {
          choice.questionId = question.id;
          delete choice.question;
          return choice;
        });
    });
    return db.knex('choices').insert(flatten(allChoices)).returning('*');
  })
  .then(() => {
    return db.knex('languages').insert(languages).returning('*');
  })
  .then(data => {
    console.log(data);
    return process.exit();
  })
  .catch(err => {
    console.log(err);
  });
