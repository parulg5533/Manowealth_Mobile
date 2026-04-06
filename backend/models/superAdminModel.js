const mongoose = require("mongoose");
const userModel= require('./userSchema')
const supAdminModelSchema = new mongoose.Schema({
  admin:{
    type:String,
    required:true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  reported_psych:{
    type:Boolean,
    default:false,
  },
  actionSummary:{
    type:[],
    default:[]
  }
});

const supAdminModel = mongoose.model("superadmin", supAdminModelSchema);
module.exports = supAdminModel;
