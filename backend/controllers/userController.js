
const jwt = require("jsonwebtoken");
const userModel = require("../models/userSchema");
const otpModel = require("../models/otpModel");
const { sendOTP } = require("../../otpService");
const Profile = require("../models/profileModel");
const sendOtp = async (req, res) => {
  const userEmail = req.body.email;
  //console.log(userEmail);
  try {
    const otp = await sendOTP(userEmail);
    //console.log(otp);
    await otpModel.create({ email: userEmail, otp: otp });
    const timestamp = new Date().getTime();
    res.status(200).json({ message: `OTP sent successfully to ${userEmail}` });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const resetPassword = async (req, res) => {
  const { otpBody, email, password } = req.body;
  // console.log()
  try {
    // Check if OTP matches
    const otpRecord = await otpModel.findOne({ email: email });
    //console.log(otpRecord);

    if (!otpRecord) {
      return res.status(401).send("OTP not found"); 
    }

    if (otpBody !== otpRecord.otp) {
      return res.status(401).send("Incorrect OTP");
    }
  } catch (err) {
    console.error("Error checking OTP:", err);
    return res.status(500).send("Internal server error");
  }

  try {
    // Update user's password
    const user = await userModel.findOneAndUpdate(
      { email: email }, // Filter criteria
      { $set: { password: password } }, // Update password
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).send("User not found"); // User with the provided email not found
    }

    res.status(200).send("Password updated successfully");
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).send("Internal server error");
  }
};

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Missing fields");
  }

  if (!email.toLowerCase().endsWith("@iitp.ac.in")) {
    return res.status(400).send("Only @iitp.ac.in email addresses are allowed");
  }

  if (password.length < 8) {
    return res.status(400).send("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).send("Password must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).send("Password must contain at least one number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).send("Password must contain at least one special character");
  }

  // const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await userModel.create({
      username: username,
      email: email,
      password: password,
    });

    const token = jwt.sign({ id: user._id }, "secret", {
      expiresIn: "2h",
    });
    user.token = token;
    // console.log(user.token);
    res.send("User created successfully with details").status(200);
    // await otpModel.findOneAndDelete({email:email});
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send("Internal Server Error");
  }
};

// const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = password;
    //console.log(email, hashedPassword);
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send("User does not exist");
    }

    if (user.role !== "user") {
      return res.send("admins and super admins cant login").status(401);
    }

    if (user.password === hashedPassword) {
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        "H@rsh123",
        { expiresIn: "1h" }
      );

      // Send the token to the client
      return res.status(200).json({ token, user });
    } else {
      return res.status(401).send("Incorrect password");
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// const resetPassword = async (req, res) => {
//   try {
//     const { userId, currentPassword, newPassword } = req.body;
//     const user = await userModel.findById(userId);

//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     const passwordMatch = await bcrypt.compare(currentPassword, user.password);

//     if (!passwordMatch) {
//       return res.status(401).send("Current password is incorrect");
//     }

//     // const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//     user.password = hashedNewPassword;
//     await user.save();

//     return res.status(200).send("Password updated successfully");
//   } catch (error) {
//     console.error("Error updating password:", error);
//     return res.status(500).send("Internal Server Error");
//   }
// };

const clearAll = async (req, res) => {
  try {
    const done = await otpModel.deleteMany({});
    if (done) {
      return res.status(200).send("done");
    }
  } catch (err) {
    console.log(err);
  }
};

const editProfile = async (req, res) => {
  try {
    const { user } = req.body; // Assuming user ID is available in req object
    const {
      contactNumber,
      hostelName,
      relationshipStatus,
      semester,
      room,
      fullName,
      lastName,
      fatherName,
      motherName,
      fatherOccupation,
      motherOccupation,
      guardianName,
      rollNumber,
      instituteEmail,
      familyContact,
      familyType,
      residentialArea,
      gender,
      dob,
      religion,
      address,
      psyConsultation,
      psyMedication,
      consultationDetails,
      medicationList,
      degree,
      dept,
    } = req.body;
    const { imageUrl } = req;

    const updateFields = {
      ...(contactNumber && { contactNumber }),
      ...(imageUrl && { profile_pic: imageUrl }),
      ...(semester && { semester }),
      ...(fullName && { username: fullName }),
      ...(lastName && { lastname: lastName }),
      ...(gender && { gender }),
      ...(degree && { degree }),
      ...(dept && { dept }),
    };
    const update = await userModel.findOneAndUpdate(
      { _id: user },
      { $set: updateFields },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileUpdateFields = {
      ...(rollNumber && { rollNumber }),
      ...(instituteEmail && { instituteEmail }),
      ...(room && { roomNumber: room }),
      ...(hostelName && { hostelName }),
      ...(relationshipStatus && { relationshipStatus }),
      ...(fatherName && { fatherName }),
      ...(motherName && { motherName }),
      ...(fatherOccupation && { fatherOccupation }),
      ...(motherOccupation && { motherOccupation }),
      ...(guardianName && { guardianName }),
      ...(familyContact && { familyContact }),
      ...(familyType && { familyType }),
      ...(residentialArea && { residentialArea }),
      ...(dob && { dateOfBirth: dob }),
      ...(religion && { religion }),
      ...(address && { address }),
      ...(psyConsultation && { psyConsultation }),
      ...(psyMedication && { psyMedication }),
      ...(consultationDetails && { consultationDetails }),
      ...(medicationList && { medicationList }),
    };

    const profile = await Profile.findOneAndUpdate(
      { user: user },
      { $set: profileUpdateFields },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { user } = req.body;
    
    //console.log("user is ", user);
    const user1 = await userModel.findOne({ _id: user });
    // console.log(user1);

    if (!user1) {
      return res.status(404).send("user not found");
    }

    const {
      rollNumber,
      instituteEmail,
      contactNumber, 
      hostelName, 
      relationshipStatus, 
      semester,
      room,
      dateOfBirth,
      degree,
      dept,
      firstname,
      lastname,
    } = req.body; 
    

    const {imageUrl} = req;
    const admins = await userModel.find({
      role: 'admin',
      semester:semester,
      degree: degree,
      dept: dept
    });


    //console

    // console.log(      rollNumber,
    //   contactNumber,
    //   hostelName,
    //   dateOfBirth,
    //   relationshipStatus,
    //   degree,
    //   dept,
    //   firstname,
    //   lastname,
    //   semester);


      //console.log(imageUrl);
    const admintoupdate = admins[0];

    const updateFields = {
      is_profile_complete: true,
      degree: degree,
      contactNumber: contactNumber,
      semester: semester,
      dept: dept,
      profile_pic: imageUrl,
    };
    if (firstname) updateFields.username = firstname;
    if (lastname) updateFields.lastname = lastname;
    if (admintoupdate) updateFields.assigned_admin = admintoupdate._id;

    const update = await userModel.findOneAndUpdate(
      { _id: user },
      updateFields,
      { new: true }
    );
    // console.log('update is' ,update);

    let profile = null;
    if (rollNumber && dateOfBirth && relationshipStatus) {
      profile = await Profile.findOneAndUpdate(
        { user: user },
        { user, rollNumber, instituteEmail, contactNumber, hostelName, dateOfBirth, relationshipStatus, roomNumber: room },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ message: "Profile created successfully", profile, admintoupdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

async function getuserInfo(req, res) {
  try {
    const userId = req.params.id;
    console.log(userId)
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const userInfo = await userModel.findOne({ _id: userId }, { password: 0 }).lean();
    if (!userInfo) {
      return res.status(404).json({ error: "User not found." });
    }

    const userProfile = await Profile.findOne({ user: userId }).lean();
    
    const responseData = { ...userInfo, ...(userProfile || {}) };

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
}


module.exports = {

  signup,
  login,
  resetPassword,
  sendOtp,
  clearAll,
  updateProfile,
  getuserInfo,
  editProfile
};