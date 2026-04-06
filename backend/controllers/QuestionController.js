const { QuestionModel } = require('../models/QuestionModel');

const getAllQuestions = async (req, res) => { 

    try {
    
        const questions = await QuestionModel.find({});
        
        res.status(200).send(questions);
    } catch (err) {

        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {getAllQuestions};