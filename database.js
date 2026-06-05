const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'database.json');

const INITIAL_DB = {
  users: [
    {
      id: 'ADMIN_01',
      role: 'admin',
      username: 'admin',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@medicare.com',
      phone: '123-456-7890'
    },
    {
      id: 'DOC_CHEN',
      role: 'doctor',
      username: 'dr_chen',
      password: 'doctor123',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'm.chen@medicare.com',
      phone: '555-019-2831',
      department: 'cardiology'
    },
    {
      id: 'DOC_PATEL',
      role: 'doctor',
      username: 'dr_patel',
      password: 'doctor123',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'p.patel@medicare.com',
      phone: '555-019-2832',
      department: 'pediatrics'
    },
    {
      id: 'DOC_JOHNSON',
      role: 'doctor',
      username: 'dr_johnson',
      password: 'doctor123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 's.johnson@medicare.com',
      phone: '555-019-2833',
      department: 'cardiology'
    },
    {
      id: 'DOC_WILLIAMS',
      role: 'doctor',
      username: 'dr_williams',
      password: 'doctor123',
      firstName: 'Robert',
      lastName: 'Williams',
      email: 'r.williams@medicare.com',
      phone: '555-019-2834',
      department: 'orthopedics'
    }
  ],
  appointments: [],
  prescriptions: [],
  messages: [],
  records: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb(INITIAL_DB);
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file, returning initial db:', error);
    return INITIAL_DB;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database file:', error);
    return false;
  }
}

// Helper query functions
const dbHelper = {
  getUsers: () => readDb().users,
  getUserById: (id) => readDb().users.find(u => u.id === id),
  getUserByUsernameOrEmail: (identifier) => {
    const cleanId = identifier.trim().toLowerCase();
    return readDb().users.find(u => 
      u.username.toLowerCase() === cleanId || 
      (u.email && u.email.toLowerCase() === cleanId)
    );
  },
  getUserByEmail: (email) => {
    const cleanEmail = email.trim().toLowerCase();
    return readDb().users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  },
  getUserByUsername: (username) => readDb().users.find(u => u.username.toLowerCase() === username.toLowerCase()),
  
  createUser: (userData) => {
    const db = readDb();
    const id = 'PA_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newUser = { id, role: 'patient', ...userData };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },

  createUserWithRole: (userData) => {
    const db = readDb();
    let prefix = 'PA_';
    if (userData.role === 'doctor') prefix = 'DOC_';
    else if (userData.role === 'admin') prefix = 'ADM_';
    const id = prefix + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newUser = { id, ...userData };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },

  getDoctors: () => readDb().users.filter(u => u.role === 'doctor'),

  getAppointments: (userId, role) => {
    const appointments = readDb().appointments;
    if (role === 'admin') return appointments;
    if (role === 'doctor') return appointments.filter(a => a.doctorId === userId);
    return appointments.filter(a => a.patientId === userId);
  },

  createAppointment: (apptData) => {
    const db = readDb();
    const id = 'AP_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newAppt = {
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...apptData
    };
    db.appointments.push(newAppt);
    writeDb(db);
    return newAppt;
  },

  updateAppointmentStatus: (id, status) => {
    const db = readDb();
    const appt = db.appointments.find(a => a.id === id);
    if (appt) {
      appt.status = status;
      writeDb(db);
      return appt;
    }
    return null;
  },

  getPrescriptions: (userId, role) => {
    const prescriptions = readDb().prescriptions;
    if (role === 'admin') return prescriptions;
    if (role === 'doctor') return prescriptions.filter(p => p.doctorId === userId);
    return prescriptions.filter(p => p.patientId === userId);
  },

  createPrescription: (prescData) => {
    const db = readDb();
    const id = 'PR_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newPresc = {
      id,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      ...prescData
    };
    db.prescriptions.push(newPresc);
    writeDb(db);
    return newPresc;
  },

  getMessages: (userId) => {
    const messages = readDb().messages;
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  },

  createMessage: (msgData) => {
    const db = readDb();
    const id = 'MSG_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newMsg = {
      id,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...msgData
    };
    db.messages.push(newMsg);
    writeDb(db);
    return newMsg;
  },

  markMessagesAsRead: (userId, contactId) => {
    const db = readDb();
    let updated = false;
    db.messages.forEach(m => {
      if (m.senderId === contactId && m.receiverId === userId && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
    });
    if (updated) {
      writeDb(db);
    }
  },

  getMedicalRecords: (patientId) => {
    const records = readDb().records;
    return records.filter(r => r.patientId === patientId);
  },

  createMedicalRecord: (recData) => {
    const db = readDb();
    const id = 'REC_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newRec = {
      id,
      date: new Date().toISOString().split('T')[0],
      ...recData
    };
    db.records.push(newRec);
    writeDb(db);
    return newRec;
  },

  deleteUser: (id) => {
    const db = readDb();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const removed = db.users.splice(idx, 1)[0];
      writeDb(db);
      return removed;
    }
    return null;
  },

  resetDb: () => {
    writeDb(INITIAL_DB);
    return INITIAL_DB;
  }
};

module.exports = dbHelper;
