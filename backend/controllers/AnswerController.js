const answerModel = require('../models/AnswerModel');

const setAnswers = async (req, res) => {
    try {
      const { user, question, answer } = req.body;
      const newAnswer = await answerModel.create({ user, question, answer });
      res.json(newAnswer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

module.exports = {setAnswers};