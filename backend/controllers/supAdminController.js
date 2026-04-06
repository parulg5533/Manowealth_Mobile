const { notifyPsy } = require("../../mailService");
const supAdminModel = require("../models/superAdminModel");
const userModel = require("../models/userSchema")
const jwt  = require('jsonwebtoken')

// fa reporting a stud to superadmin
const submitReport = async (req, res) => {
    try {
        const { user, message ,admin } = req.body;
        if (!user || !message) {
            return res.status(400).json({ error: "User and message are required fields." });
        }

        const user1 = await userModel.findOne({ email: user });
        if (!user1) {
            return res.status(404).json({ error: "User not found." });
        }

        const userId = user1._id;

        const report = await supAdminModel.create({ user: userId, message: message ,admin:admin });

        res.status(200).json({ message: "Report submitted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
}

// superadmin seeing all reports submitted by fa/admin
const getAdminWiseData = async (req, res) => {
    try {
        const { admin } = req.body;
        const data = await supAdminModel.find({ admin: admin });
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Data not found" });
        }

        return res.send(data);
    } catch (error) {
        console.error("Error in getAdminWiseData:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// fa seeing the list of stud assignmed to them
const getUserAdmin = async (req, res) => {
    try {
        const { admin } = req.params;
        const users = await userModel.find({ assigned_admin: admin }).lean();
        const Profile = require('../models/profileModel');
        const profiles = await Profile.find({}).lean();

        const mergedData = users.map(user => {
            const profile = profiles.find(p => String(p.user) === String(user._id));
            return {
                ...user,
                rollNumber: profile?.rollNumber || "",
                instituteEmail: profile?.instituteEmail || "",
                hostelName: profile?.hostelName || "",
                roomNumber: profile?.roomNumber || "",
            };
        });

        if (!mergedData || mergedData.length === 0) {
            return res.status(200).json([]);
        }

        return res.send(mergedData);
    } catch (error) {
        console.error("Error in getUserAdmin:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// email notification to the superadmin
const notifyAdmin = async (req,res) => {
    try{
        const user = req.body.user;
       const resp=  notifyPsy(user,"report@gmail.com");
        return res.send(resp).status(200);
    }catch(err){
        res.send(err.message).status(500);
    }
}

// superadmin sees all repored users
const getReportedUsers = async (req, res) => {
    try {
        const supAdminUsers = await supAdminModel.find({}).lean();
     
        const mergedUsers = [];

        for (const supAdminUser of supAdminUsers) {
            const Profile = require('../models/profileModel');
            const userModelData = await userModel.findById(supAdminUser.user, 'username email score contactNumber who5_score phq9_score gad7_score').lean(); 
            const profileData = await Profile.findOne({ user: supAdminUser.user }).lean();

            const mergedUser = { 
                ...supAdminUser, 
                ...userModelData,
                rollNumber: profileData?.rollNumber || "",
                instituteEmail: profileData?.instituteEmail || "",
            };
            mergedUsers.push(mergedUser);
        }

        return res.send(mergedUsers).status(200);
    } catch(err) {
        console.log(err);
        return res.status(500).send('Error');
    }
}

// fa sees only their data like whom they reported etc
const getAdminReportedUsers = async (req, res) => {
    try {
        const email = req.params.id;
      
        const reports = await supAdminModel.find({ admin: email }).lean();

      
        const mergedUsers = [];

        for (const report of reports) {
            const Profile = require('../models/profileModel');
            const userModelData = await userModel.findById(report.user, 'username email score contactNumber who5_score phq9_score gad7_score').lean(); 
            const profileData = await Profile.findOne({ user: report.user }).lean();
     
            const mergedUser = { 
                ...report, 
                ...userModelData,
                rollNumber: profileData?.rollNumber || "",
                instituteEmail: profileData?.instituteEmail || "",
            };
            mergedUsers.push(mergedUser);
        }

        return res.status(200).send(mergedUsers);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error');
    }
}

// counsellor login
const authorityLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
        return res.status(404).send('Invalid email or password.');
    }

    if (password !== user.password) {
        return res.status(401).send('Invalid password.');
    }

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, 'H@rsh123', { expiresIn: '1h' });
    res.json({ user, token });
}

// supadmin account creation
const createSuperAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        const user = await userModel.create({
            username: firstname,
            lastname: lastname,
            email: email,
            password: password,
            role: 'super admin'
        });
        return res.status(201).send('Super admin created');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
}

// sup admin sees all sos notfcns from all stud
const getAllSOS = async (req, res) => {
    try {
        const { NotificationModel } = require('../models/notificationModel');
        const Profile = require('../models/profileModel');
        const notifications = await NotificationModel.find({}).sort({ createdAt: -1 }).lean();
        const enriched = [];
        for (const n of notifications) {
            const profile = await Profile.findOne({ user: n.user }).lean();
            const user = await userModel.findById(n.user).lean();
            enriched.push({
                ...n,
                email: user?.email || n.userName,
                rollNumber: profile?.rollNumber || 'NA',
            });
        }
        return res.status(200).json(enriched);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// counsellor sees all appointments
const getAllAppointments = async (req, res) => {
    try {
        const { AppointmentModel } = require('../models/appointmentModel');
        const appointments = await AppointmentModel.find({}).sort({ createdAt: -1 }).lean();
        const enriched = [];
        for (const apt of appointments) {
            const student = await userModel.findById(apt.user, 'username email').lean();
            const admin = await userModel.findById(apt.admin, 'username email').lean();
            enriched.push({
                ...apt,
                studentName: student?.username || 'NA',
                studentEmail: student?.email || 'NA',
                adminName: admin?.username || 'NA',
                adminEmail: admin?.email || 'NA',
            });
        }
        return res.status(200).json(enriched);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// counseloor see mood logs of any stud
const getMoodLogsByUser = async (req, res) => {
    try {
        const { MoodModel } = require('../models/moodModel');
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: 'User ID required' });
        const logs = await MoodModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ logs });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// counseloor see survey results of any stud
const getSurveyByUser = async (req, res) => {
    try {
        const SurveyAnswer = require('../models/surveyAnswerModel');
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: 'User ID required' });
        const surveys = await SurveyAnswer.find({ userId }).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ surveys });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// counsellor see complete profile of any stud
const getDemographicByUser = async (req, res) => {
    try {
        const Profile = require('../models/profileModel');
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: 'User ID required' });
        const userInfo = await userModel.findById(userId, { password: 0 }).lean();
        const profile = await Profile.findOne({ user: userId }).lean();
        return res.status(200).json({ ...userInfo, ...(profile || {}) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// counsellor dlts stud
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'User ID required' });
        const deletedUser = await userModel.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        
        const Profile = require('../models/profileModel');
        await Profile.findOneAndDelete({ user: id });

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitReport, getUserAdmin, authorityLogin, getReportedUsers, getAdminWiseData, notifyAdmin, getAdminReportedUsers, createSuperAdmin, getAllSOS, getAllAppointments, getMoodLogsByUser, getSurveyByUser, getDemographicByUser, deleteStudent };