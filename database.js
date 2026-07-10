const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// Password hashing helpers
function hashPassword(password, salt) {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, userSalt, 1000, 64, 'sha512').toString('hex');
  return { salt: userSalt, hash };
}


// Custom environment variables loader for .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      });
      console.log('Loaded environment variables from .env');
    } catch (err) {
      console.error('Error reading .env file:', err);
    }
  }
}
loadEnv();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';
const jsonPath = path.join(__dirname, 'database.json');

let client = null;
let dbInstance = null;
let useJsonDb = false;

// Avoid crashing if MongoDB URI contains unconfigured placeholders
if (uri.includes('<username>') || uri.includes('<password>')) {
  console.warn('⚠️ MONGODB_URI contains placeholder brackets. Auto-switching to database.json file storage.');
  useJsonDb = true;
} else {
  try {
    client = new MongoClient(uri);
  } catch (err) {
    console.warn('⚠️ MongoDB client initialization failed. Auto-switching to database.json file storage:', err.message);
    useJsonDb = true;
  }
}

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

// Helper to read database.json
function readJsonDb() {
  try {
    if (!fs.existsSync(jsonPath)) {
      fs.writeFileSync(jsonPath, JSON.stringify(INITIAL_DB, null, 2));
      return INITIAL_DB;
    }
    const data = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database.json:', err);
    return INITIAL_DB;
  }
}

// Helper to write database.json
function writeJsonDb(data) {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing database.json:', err);
  }
}

async function getDb() {
  if (dbInstance) return dbInstance;
  if (useJsonDb || !client) return null;
  try {
    // Try to connect to MongoDB, timeout after 2 seconds to fail fast
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB connection timeout')), 2000))
    ]);
    dbInstance = client.db();
    console.log('Successfully connected to MongoDB');
    await seedInitialDb(dbInstance);
    return dbInstance;
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Auto-switching to database.json file storage.');
    useJsonDb = true;
    readJsonDb(); // Ensure database.json is initialized
    return null;
  }
}

async function seedInitialDb(db) {
  const usersCollection = db.collection('users');
  const count = await usersCollection.countDocuments();
  if (count === 0) {
    console.log("Database is empty, seeding initial admin and doctors...");
    await usersCollection.insertMany(INITIAL_DB.users);
  }
}

// Helper query functions
const dbHelper = {
  verifyPassword: (inputPassword, user) => {
    if (!user) return false;
    if (!user.salt) {
      return inputPassword === user.password;
    }
    const { hash } = hashPassword(inputPassword, user.salt);
    return hash === user.password;
  },

  getUsers: async () => {
    await getDb();
    if (useJsonDb) {
      return readJsonDb().users || [];
    }
    const db = await getDb();
    return await db.collection('users').find({}).toArray();
  },

  getUserById: async (id) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      return db.users.find(u => u.id === id) || null;
    }
    const db = await getDb();
    return await db.collection('users').findOne({ id });
  },

  getUserByUsernameOrEmail: async (identifier) => {
    await getDb();
    const cleanId = identifier.trim().toLowerCase();
    if (useJsonDb) {
      const db = readJsonDb();
      return db.users.find(u => 
        (u.username && u.username.toLowerCase() === cleanId) || 
        (u.email && u.email.toLowerCase() === cleanId)
      ) || null;
    }
    const db = await getDb();
    return await db.collection('users').findOne({
      $or: [
        { username: { $regex: new RegExp('^' + cleanId + '$', 'i') } },
        { email: { $regex: new RegExp('^' + cleanId + '$', 'i') } }
      ]
    });
  },

  getUserByEmail: async (email) => {
    await getDb();
    const cleanEmail = email.trim().toLowerCase();
    if (useJsonDb) {
      const db = readJsonDb();
      return db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail) || null;
    }
    const db = await getDb();
    return await db.collection('users').findOne({
      email: { $regex: new RegExp('^' + cleanEmail + '$', 'i') }
    });
  },

  getUserByUsername: async (username) => {
    await getDb();
    const cleanUsername = username.trim().toLowerCase();
    if (useJsonDb) {
      const db = readJsonDb();
      return db.users.find(u => u.username && u.username.toLowerCase() === cleanUsername) || null;
    }
    const db = await getDb();
    return await db.collection('users').findOne({
      username: { $regex: new RegExp('^' + username + '$', 'i') }
    });
  },
  
  createUser: async (userData) => {
    await getDb();
    const id = 'PA_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const { salt, hash } = hashPassword(userData.password);
    const newUser = { id, role: 'patient', ...userData, password: hash, salt };
    if (useJsonDb) {
      const db = readJsonDb();
      db.users.push(newUser);
      writeJsonDb(db);
      return newUser;
    }
    const db = await getDb();
    await db.collection('users').insertOne(newUser);
    return newUser;
  },

  createUserWithRole: async (userData) => {
    await getDb();
    let prefix = 'PA_';
    if (userData.role === 'doctor') prefix = 'DOC_';
    else if (userData.role === 'admin') prefix = 'ADM_';
    const id = prefix + Math.random().toString(36).substr(2, 9).toUpperCase();
    const { salt, hash } = hashPassword(userData.password);
    const newUser = { id, ...userData, password: hash, salt };
    if (useJsonDb) {
      const db = readJsonDb();
      db.users.push(newUser);
      writeJsonDb(db);
      return newUser;
    }
    const db = await getDb();
    await db.collection('users').insertOne(newUser);
    return newUser;
  },

  getDoctors: async () => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      return db.users.filter(u => u.role === 'doctor');
    }
    const db = await getDb();
    return await db.collection('users').find({ role: 'doctor' }).toArray();
  },

  getAppointments: async (userId, role) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      const list = db.appointments || [];
      if (role === 'admin') return list;
      if (role === 'doctor') return list.filter(a => a.doctorId === userId);
      return list.filter(a => a.patientId === userId);
    }
    const db = await getDb();
    if (role === 'admin') {
      return await db.collection('appointments').find({}).toArray();
    }
    if (role === 'doctor') {
      return await db.collection('appointments').find({ doctorId: userId }).toArray();
    }
    return await db.collection('appointments').find({ patientId: userId }).toArray();
  },

  createAppointment: async (apptData) => {
    await getDb();
    const id = 'AP_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newAppt = {
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...apptData
    };
    if (useJsonDb) {
      const db = readJsonDb();
      db.appointments.push(newAppt);
      writeJsonDb(db);
      return newAppt;
    }
    const db = await getDb();
    await db.collection('appointments').insertOne(newAppt);
    return newAppt;
  },

  updateAppointmentStatus: async (id, status) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      const appt = db.appointments.find(a => a.id === id);
      if (appt) {
        appt.status = status;
        writeJsonDb(db);
        return appt;
      }
      return null;
    }
    const db = await getDb();
    await db.collection('appointments').updateOne({ id }, { $set: { status } });
    return await db.collection('appointments').findOne({ id });
  },

  getPrescriptions: async (userId, role) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      const list = db.prescriptions || [];
      if (role === 'admin') return list;
      if (role === 'doctor') return list.filter(p => p.doctorId === userId);
      return list.filter(p => p.patientId === userId);
    }
    const db = await getDb();
    if (role === 'admin') {
      return await db.collection('prescriptions').find({}).toArray();
    }
    if (role === 'doctor') {
      return await db.collection('prescriptions').find({ doctorId: userId }).toArray();
    }
    return await db.collection('prescriptions').find({ patientId: userId }).toArray();
  },

  createPrescription: async (prescData) => {
    await getDb();
    const id = 'PR_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newPresc = {
      id,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      ...prescData
    };
    if (useJsonDb) {
      const db = readJsonDb();
      db.prescriptions.push(newPresc);
      writeJsonDb(db);
      return newPresc;
    }
    const db = await getDb();
    await db.collection('prescriptions').insertOne(newPresc);
    return newPresc;
  },

  getMessages: async (userId) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      const list = db.messages || [];
      return list.filter(m => m.senderId === userId || m.receiverId === userId);
    }
    const db = await getDb();
    return await db.collection('messages').find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).toArray();
  },

  createMessage: async (msgData) => {
    await getDb();
    const id = 'MSG_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newMsg = {
      id,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...msgData
    };
    if (useJsonDb) {
      const db = readJsonDb();
      db.messages.push(newMsg);
      writeJsonDb(db);
      return newMsg;
    }
    const db = await getDb();
    await db.collection('messages').insertOne(newMsg);
    return newMsg;
  },

  markMessagesAsRead: async (userId, contactId) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      let updated = false;
      db.messages.forEach(m => {
        if (m.senderId === contactId && m.receiverId === userId && !m.isRead) {
          m.isRead = true;
          updated = true;
        }
      });
      if (updated) writeJsonDb(db);
      return;
    }
    const db = await getDb();
    await db.collection('messages').updateMany(
      { senderId: contactId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );
  },

  getMedicalRecords: async (patientId) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      const list = db.records || [];
      return list.filter(r => r.patientId === patientId);
    }
    const db = await getDb();
    return await db.collection('records').find({ patientId }).toArray();
  },

  createMedicalRecord: async (recData) => {
    await getDb();
    const id = 'REC_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newRec = {
      id,
      date: new Date().toISOString().split('T')[0],
      ...recData
    };
    if (useJsonDb) {
      const db = readJsonDb();
      db.records.push(newRec);
      writeJsonDb(db);
      return newRec;
    }
    const db = await getDb();
    await db.collection('records').insertOne(newRec);
    return newRec;
  },

  deleteUser: async (id) => {
    await getDb();
    if (useJsonDb) {
      const db = readJsonDb();
      const idx = db.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        const user = db.users[idx];
        db.users.splice(idx, 1);
        writeJsonDb(db);
        return user;
      }
      return null;
    }
    const db = await getDb();
    const user = await db.collection('users').findOne({ id });
    if (user) {
      await db.collection('users').deleteOne({ id });
      return user;
    }
    return null;
  },

  resetDb: async () => {
    await getDb();
    if (useJsonDb) {
      writeJsonDb(INITIAL_DB);
      return;
    }
    const db = await getDb();
    await db.collection('users').deleteMany({});
    await db.collection('appointments').deleteMany({});
    await db.collection('prescriptions').deleteMany({});
    await db.collection('messages').deleteMany({});
    await db.collection('records').deleteMany({});
    await db.collection('users').insertMany(INITIAL_DB.users);
  }
};

module.exports = dbHelper;
