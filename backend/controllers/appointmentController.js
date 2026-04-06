const { AppointmentModel } = require('../models/appointmentModel');
const userModel = require('../models/userSchema');

const bookAppointment = async (req, res) => {
  const { userId, date, time, reason } = req.body;

  if (!userId || !date) {
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
      date,
      time,
      reason,
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

const getStudentAppointments = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "User ID is required" });
  try {
    const appointments = await AppointmentModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ error: "Failed to fetch appointments." });
  }
};

const getAdminAppointments = async (req, res) => {
  const { adminId } = req.params;
  if (!adminId) return res.status(400).json({ error: "Admin ID is required" });
  try {
    const appointments = await AppointmentModel.find({ admin: adminId }).sort({ createdAt: -1 }).lean();
    const enriched = [];
    for (const apt of appointments) {
      const student = await userModel.findById(apt.user, 'username email').lean();
      enriched.push({
        ...apt,
        studentName: student?.username || 'NA',
        studentEmail: student?.email || 'NA',
      });
    }
    return res.status(200).json(enriched);
  } catch (error) {
    console.error("Error fetching admin appointments:", error);
    return res.status(500).json({ error: "Failed to fetch appointments." });
  }
};

module.exports = { bookAppointment, markAppointmentComplete, getStudentAppointments, getAdminAppointments };