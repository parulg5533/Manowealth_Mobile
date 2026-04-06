const FiftyQuestionsModel = require('../models/newModel');
const userModel = require('../models/userSchema');
const jwt = require('jsonwebtoken')
const insertQuestions = async (req, res) => {
    // Extract token from request headers

   
    // Verify token
    try {

        
        // Extract necessary data from decoded token
        const email = req.body.email;
        
        const questionsArray = req.body.answers;
        const score = req.body.score;
        let userid;

        try {
            const user = await userModel.findOne({ email: email });
            userid = user._id;
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Error finding user" });
        }

        try {
            // Update user score
            const today = new Date(); 
            const updatedUser = await userModel.findOneAndUpdate(
                { email: email },
                { $set: { score: score, score_date: today } }, 
                { new: true }
            );
            
            // console.log(updatedUser);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error updating user score" });
        }

        try {
            const mappedQuestions = questionsArray.map(qa => ({
                question: qa.question,
                answer: qa.answer
            }));

            const newQuestionsDoc = new FiftyQuestionsModel({ user: userid, questions: mappedQuestions });
            await newQuestionsDoc.save();

            return res.status(201).json({ message: "Questions inserted successfully" });
        } catch (error) {
            console.error("Error inserting questions:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};


const getUsers = async (req, res) => {
    try {
        const users = await userModel.find({ role: 'user' }).select('-password').lean();
        const Profile = require('../models/profileModel');
        const profiles = await Profile.find({}).lean();

        const mergedUsers = users.map(user => {
            const profile = profiles.find(p => String(p.user) === String(user._id));
            return {
                ...user,
                rollNumber: profile?.rollNumber || "",
                instituteEmail: profile?.instituteEmail || "",
                hostelName: profile?.hostelName || "",
                roomNumber: profile?.roomNumber || "",
            };
        });

        return res.status(200).send(mergedUsers);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Internal server error" });
    }
};


const getAllAnswers = async (req, res) => {
    try {
     
      // Verify the token if needed
      // const decoded = jwt.verify(token, secretKey);      
      const questions = await FiftyQuestionsModel.find({});
      return res.status(200).send(questions);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "server error" });
    }
  };

module.exports = { insertQuestions ,getUsers ,getAllAnswers};