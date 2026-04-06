const mongoose = require('mongoose');

const surveyAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [
    {
      questionIndex: {
        type: Number,
        required: false,
      },
      section: {
        type: String,
        required: false,
      },
      question: {
        type: String,
        required: false,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SurveyAnswer = mongoose.model('SurveyAnswer', surveyAnswerSchema);

module.exports = SurveyAnswer;
