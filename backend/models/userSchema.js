const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: false,
  },
  lastname:{
    type:String,
    unique:false,
  },
  contactNumber: {
    type: String,
  }
  ,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  score:{
    type:String,
  },
  score_date:{
    type:Date,
  },
  who5_score: {
    type: String,
  },
  phq9_score: { type: String },
  gad7_score: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin', 'super admin'], 
    default: 'user' 
  },
  is_profile_complete:{
    type:Boolean,
    default:false
  },
  has_accepted_tnc:{
    type:Boolean,
    default:false},
  createdAt: {
    type: Date,
    default: Date.now
},
assigned_admin:{
  type:mongoose.Schema.Types.ObjectId,
},
degree:{
  type:String,
},
dept:{
  type:String,
},
semester:{
  type:String
},
profile_pic:{
  type:String,
  
},
gender: {
  type: String
}
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
