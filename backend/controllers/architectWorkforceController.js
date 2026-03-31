const User = require('../models/userModel');
const bcrypt = require('bcrypt'); // Make sure to use bcryptjs or bcrypt according to the project
const { ArchitectTask, ArchitectPayment, ArchitectAttendance, ArchitectReview, PartnerLocation } = require('../models/ArchitectWorkforceModels');

// --- PARTNER MANAGEMENT ---

// Register a new partner under the logged-in architect
exports.registerPartner = async (req, res) => {
  try {
    const { name, email, password, phone, baseWageType, baseWageAmount } = req.body;
    const architectId = req.user._id;

    if (req.user.role !== 'architect') {
      return res.status(403).json({ success: false, message: 'Only architects can add partners' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Standard bcrypt hash

    const newPartner = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'architectPartner',
      employerArchitect: architectId,
      architectPartnerDetails: {
        baseWageType,
        baseWageAmount: Number(baseWageAmount) || 0
      }
    });

    await newPartner.save();
    
    // Do not return password in response
    const returnPartner = newPartner.toObject();
    delete returnPartner.password;

    res.status(201).json({ success: true, message: 'Partner added successfully', partner: returnPartner });
  } catch (error) {
    console.error("registerPartner Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all partners for an architect
exports.getMyPartners = async (req, res) => {
  try {
    if (req.user.role !== 'architect') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const partners = await User.find({ employerArchitect: req.user._id, role: 'architectPartner' }).select('-password');
    res.status(200).json({ success: true, partners });
  } catch (error) {
    console.error("getMyPartners Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// --- TASK MANAGEMENT ---

exports.createTask = async (req, res) => {
  try {
    const { title, description, partnerId, projectId, deadline, priority } = req.body;
    
    if (req.user.role !== 'architect') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const task = new ArchitectTask({
      title,
      description,
      architectId: req.user._id,
      partnerId,
      projectId,
      deadline,
      priority
    });

    await task.save();
    res.status(201).json({ success: true, message: 'Task created', task });
  } catch (error) {
    console.error("createTask Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    // Both Architect and Partner can view tasks
    let filter = {};
    if (req.user.role === 'architect') {
      filter.architectId = req.user._id;
    } else if (req.user.role === 'architectPartner') {
      filter.partnerId = req.user._id;
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const tasks = await ArchitectTask.find(filter)
        .populate('partnerId', 'name email phone')
        .populate('projectId', 'title')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("getTasks Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, partnerNotes, proofFiles } = req.body;

    const task = await ArchitectTask.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Ensure the partner updating it is the assigned one
    if (req.user.role === 'architectPartner' && String(task.partnerId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized for this task' });
    }

    if (status) task.status = status;
    if (partnerNotes) task.partnerNotes = partnerNotes;
    if (proofFiles && Array.isArray(proofFiles)) {
        task.proofFiles.push(...proofFiles);
    }

    await task.save();
    res.status(200).json({ success: true, message: 'Task updated', task });
  } catch (error) {
    console.error("updateTaskStatus Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// --- ATTENDANCE MANAGEMENT ---

exports.checkIn = async (req, res) => {
  try {
    const { lat, lng, timestamp } = req.body;

    if (req.user.role !== 'architectPartner') {
      return res.status(403).json({ success: false, message: 'Only partners can check in' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // See if already exists
    let attendance = await ArchitectAttendance.findOne({ 
        partnerId: req.user._id, 
        date: today 
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    if (!attendance) {
        attendance = new ArchitectAttendance({
            architectId: req.user.employerArchitect,
            partnerId: req.user._id,
            date: today,
            checkInTime: timestamp ? new Date(timestamp) : new Date(),
            checkInLocation: { lat, lng }
        });
    } else {
        attendance.checkInTime = new Date();
        attendance.checkInLocation = { lat, lng };
    }

    await attendance.save();
    res.status(200).json({ success: true, message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error("checkIn Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.checkOut = async (req, res) => {
    try {
      const { lat, lng, timestamp } = req.body;
      
      if (req.user.role !== 'architectPartner') {
        return res.status(403).json({ success: false, message: 'Only partners can check out' });
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const attendance = await ArchitectAttendance.findOne({ 
          partnerId: req.user._id, 
          date: today 
      });
  
      if (!attendance || !attendance.checkInTime) {
        return res.status(400).json({ success: false, message: 'You have not checked in yet' });
      }
      
      if (attendance.checkOutTime) {
        return res.status(400).json({ success: false, message: 'Already checked out today' });
      }
  
      attendance.checkOutTime = timestamp ? new Date(timestamp) : new Date();
      attendance.checkOutLocation = { lat, lng };
      
      await attendance.save();
      res.status(200).json({ success: true, message: 'Checked out successfully', attendance });
    } catch (error) {
      console.error("checkOut Error:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

exports.getAttendance = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'architect') {
            filter.architectId = req.user._id;
        } else if (req.user.role === 'architectPartner') {
            filter.partnerId = req.user._id;
        } else {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const dateFilter = req.query.date; // Optional filter format YYYY-MM-DD
        if (dateFilter) {
            const start = new Date(dateFilter);
            start.setHours(0,0,0,0);
            const end = new Date(dateFilter);
            end.setHours(23,59,59,999);
            filter.date = { $gte: start, $lte: end };
        }

        const attendanceRecords = await ArchitectAttendance.find(filter)
            .populate('partnerId', 'name email phone')
            .sort({ date: -1 });
        
        res.status(200).json({ success: true, logs: attendanceRecords });
    } catch(error) {
        console.error("getAttendance Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });      
    }
}


// --- PAYMENTS ---

exports.recordPayment = async (req, res) => {
    try {
        if (req.user.role !== 'architect') return res.status(403).json({ success: false, message: 'Forbidden' });

        const { partnerId, amount, paymentType, description, status } = req.body;

        const payment = new ArchitectPayment({
            architectId: req.user._id,
            partnerId,
            amount: Number(amount),
            paymentType,
            description,
            status: status || 'Paid'
        });

        await payment.save();
        res.status(201).json({ success: true, message: 'Payment recorded', payment });
    } catch(error) {
        console.error("recordPayment Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });      
    }
}

exports.getPayments = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'architect') {
            filter.architectId = req.user._id;
        } else if (req.user.role === 'architectPartner') {
            filter.partnerId = req.user._id;
        } else {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const payments = await ArchitectPayment.find(filter)
            .populate('partnerId', 'name email phone')
            .sort({ paymentDate: -1 });

        res.status(200).json({ success: true, payments });
    } catch(error) {
        console.error("getPayments Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });      
    }
}

exports.getDashboardStats = async (req, res) => {
    try {
        if (req.user.role !== 'architect') return res.status(403).json({ success: false, message: 'Forbidden' });

        const architectId = req.user._id;

        const totalPartners = await User.countDocuments({ employerArchitect: architectId, role: 'architectPartner' });
        
        const tasks = await ArchitectTask.find({ architectId });
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const activeTasks = tasks.filter(t => t.status !== 'Completed').length;

        const payments = await ArchitectPayment.find({ architectId });
        const totalPaid = payments.reduce((acc, p) => p.status === 'Paid' ? acc + p.amount : acc, 0);

        // Attendance today
        const today = new Date();
        today.setHours(0,0,0,0);
        const presentToday = await ArchitectAttendance.countDocuments({ architectId, date: today });

        res.status(200).json({
            success: true,
            stats: {
                totalPartners,
                completedTasks,
                activeTasks,
                totalPaid,
                presentToday
            }
        });
    } catch(error) {
        console.error("getDashboardStats Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });      
    }
}

// --- LIVE LOCATION ---

exports.updateLocation = async (req, res) => {
    try {
        if (req.user.role !== 'architectPartner') {
            return res.status(403).json({ success: false, message: 'Only partners can update location' });
        }

        const { lat, lng, accuracy } = req.body;
        if (lat == null || lng == null) {
            return res.status(400).json({ success: false, message: 'lat and lng are required' });
        }

        const location = await PartnerLocation.findOneAndUpdate(
            { partnerId: req.user._id },
            {
                architectId: req.user.employerArchitect,
                partnerId: req.user._id,
                lat,
                lng,
                accuracy: accuracy || 0,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, location });
    } catch (error) {
        console.error("updateLocation Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getPartnerLocations = async (req, res) => {
    try {
        if (req.user.role !== 'architect') {
            return res.status(403).json({ success: false, message: 'Only architects can view partner locations' });
        }

        const locations = await PartnerLocation.find({ architectId: req.user._id })
            .populate('partnerId', 'name email phone')
            .sort({ lastUpdated: -1 });

        res.status(200).json({ success: true, locations });
    } catch (error) {
        console.error("getPartnerLocations Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
