const SurveyAnswer = require('../models/surveyAnswerModel');
const userModel = require('../models/userSchema');

const submitSurvey = async (req, res) => {
  try {
    const { userId, answers, who5Score, phq9Score, gad7Score } = req.body;

    if (!userId || !answers) {
      return res.status(400).json({ message: 'User ID and answers are required.' });
    }

    const newSurveyAnswer = new SurveyAnswer({
      userId,
      answers,
    });

    await newSurveyAnswer.save();

    const updateData = { score_date: Date.now() };
    // if (who5Score !== undefined) updateData.who5_score = who5Score.toString();
    // if (phq9Score !== undefined) updateData.phq9_score = phq9Score.toString();
    // if (gad7Score !== undefined) {
    //    updateData.gad7_score = gad7Score.toString();
    //    updateData.score = gad7Score.toString(); 
    // }

    // await userModel.findByIdAndUpdate(userId, updateData);

     if (who5Score !== undefined) updateData.who5_score = who5Score.toString();
    if (phq9Score !== undefined) updateData.phq9_score = phq9Score.toString();
    if (gad7Score !== undefined) updateData.gad7_score = gad7Score.toString();
    
    let totalScore = 0;
    let count = 0;
    
    if (who5Score !== undefined) {
      totalScore += who5Score;
      count++;
    }
    if (phq9Score !== undefined) {
      totalScore += phq9Score;
      count++;
    }
    if (gad7Score !== undefined) {
      totalScore += gad7Score;
      count++;
    }
    
    if (count > 0) {
      const averageScore = totalScore / count;
      updateData.score = averageScore.toString();
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    res.status(201).json({ message: 'Survey submitted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { submitSurvey };