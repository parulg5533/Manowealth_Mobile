const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  instituteEmail: {
    type: String,
  },
  hostelName: {
    type: String,

  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  relationshipStatus: {
    type: String,
    required: true
  },
  roomNumber:{
    type:String,

  },
  fatherName: { type: String },
  motherName: { type: String },
  fatherOccupation: { type: String },
  motherOccupation: { type: String },
  guardianName: { type: String },
  familyContact: { type: String },
  familyType: { type: String },
  residentialArea: { type: String },
  religion: { type: String },
  address: { type: String },
  psyConsultation: { type: String },
  psyMedication: { type: String },
  consultationDetails: { type: String },
  medicationList: { type: String }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
