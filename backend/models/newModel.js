const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const QuestionAnswerSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
});


const FiftyQuestionsSchema = new Schema({
    questions: {
        type: [QuestionAnswerSchema],
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});




const FiftyQuestionsModel = mongoose.model('FiftyQuestions', FiftyQuestionsSchema);

module.exports = FiftyQuestionsModel;
