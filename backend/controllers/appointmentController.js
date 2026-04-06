const { AppointmentModel } = require('../models/appointmentModel');
const userModel = require('../models/userSchema');

const bookAppointment = async (req, res) => {
  const { userId, selectedDate } = req.body;
  
  if (!userId || !selectedDate) {
    return res.status(400).json({ error: "User ID and Appointment Date are required" });
  }

  try {
    // Find a super admin to assign the appointment to
    const superAdmin = await userModel.findOne({ role: 'super admin' });
    
    if (!superAdmin) {
      return res.status(404).json({ error: "Super Admin not found to handle the appointment." });
    }

    const newAppointment = await AppointmentModel.create({
      user: userId,
      admin: superAdmin._id,
      date: selectedDate
    });
    return res.status(201).json({ message: "Appointment booked successfully with Super Admin", data: newAppointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).json({ error: "Failed to book appointment." });
  }
};

const markAppointmentComplete = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: "Appointment ID is required" });
  }

  try {
    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { status: 'Completed' },
      { new: true }
    );
    
    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }
    
    return res.status(200).json({ message: "Appointment marked as completed", data: updatedAppointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ error: "Failed to update appointment status." });
  }
};

module.exports = { bookAppointment, markAppointmentComplete };