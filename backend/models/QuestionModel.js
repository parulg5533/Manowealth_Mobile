const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    text: {
      type: String,
      required: true
    }
  });
  
  const QuestionModel = mongoose.model('questions' , QuestionSchema);
  module.exports ={QuestionModel};