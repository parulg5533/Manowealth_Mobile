const jwt = require("jsonwebtoken");
const userModel = require('../models/userSchema');
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(404).send('User not available');
    }

    if (user.role !== 'admin') {
      return res.status(401).send('You are not an admin');
    }

    if (user.password === password) {

      const token = jwt.sign({ userId: user._id, role: user.role }, 'H@rsh123', { expiresIn: '1h' });

      return res.status(200).send({ message: 'Login successful', token   , user});
    } else {
      return res.status(401).send('Incorrect password');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
}

const promoteToAdmin = async (req, res) => {
    try {
      const { user} = req.body;
      const userToPromote = await userModel.findById(user);
      if (!userToPromote) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      userToPromote.role = 'admin';
      await userToPromote.save();
  
      res.json({ message: 'User promoted to admin successfully.' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const deleteAdmin = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).send('Admin ID is required');
      }
  
      const deletedAdmin = await userModel.findByIdAndDelete(id);
  
      if (!deletedAdmin) {
        return res.status(404).send('Admin not found');
      }

      // Move users assigned to this admin to the unassigned category
      await userModel.updateMany({ assigned_admin: id }, { assigned_admin: null });
  
      return res.status(200).send('Admin deleted successfully');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  };
  
  const createAdmin = async (req,res)=>{
    try{
      const {firstname,lastname,phone,email,degree,dept,semester,password} =  req.body;
      const admin =await  userModel.create({
        username:firstname,
        lastname:lastname,
        contactNumber:phone,
        email:email,
        degree:degree,
        semester:semester,
        dept:dept,
        password:password,
        role:'admin'
      })
      return res.send('admin created').status(201);
    }
    catch(err){
      console.log(err);
      return res.send('internal server error').status(500);
    }
  }

  const getalladmins = async (req, res) => {
    try {
        const data = await userModel.find({ role: "admin" }).select('-password -is_profile_complete -has_accepted_tnc -role' );
      
        if (!data || data.length === 0) {
            return res.json([]);
        }
  
        return res.json(data);
    } catch (error) {
        console.error("Error in getalladmins:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const getUnassignedUsers = async (req, res) => {
  try {
    const unassignedUsers = await userModel.find({ 
      role: 'user', 
      $or: [{ assigned_admin: null }, { assigned_admin: { $exists: false } }] 
    }).select('-password');
    return res.status(200).json(unassignedUsers);
  } catch (err) {
    console.error("Error in getUnassignedUsers:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const assignAdmin = async (req, res) => {
  try {
    const { userId, adminId } = req.body;
    if (!userId || !adminId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const userToUpdate = await userModel.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    userToUpdate.assigned_admin = adminId;
    await userToUpdate.save();

    return res.status(200).json({ message: "Student successfully assigned to admin" });
  } catch (err) {
    console.error("Error in assignAdmin:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const detachUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const userToUpdate = await userModel.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    userToUpdate.assigned_admin = null;
    await userToUpdate.save();

    return res.status(200).json({ message: "Student successfully detached from admin" });
  } catch (err) {
    console.error("Error in detachUser:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {promoteToAdmin ,adminLogin ,getalladmins,createAdmin,deleteAdmin, getUnassignedUsers, assignAdmin, detachUser};