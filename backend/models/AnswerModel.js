const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    user: {
      type: String,
      required: true
    },
    question: {
      type: String,
      ref: 'Question',
      required: true
    },
    answer: {
      type: String,
      enum: ['Strongly Agree', 'Agree', 'Undecided', 'Disagree', 'Strongly Disagree'],
      required: true
    }
  });

  const Answers = mongoose.model('answers' , AnswerSchema);
  module.exports = {Answers};
  