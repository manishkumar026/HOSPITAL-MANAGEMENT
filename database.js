const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';
const client = new MongoClient(uri);

let dbInstance = null;

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
  ]
};

async function getDb() {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    dbInstance = client.db();
    console.log('Successfully connected to MongoDB');
    await seedInitialDb(dbInstance);
    return dbInstance;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
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
  getUsers: async () => {
    const db = await getDb();
    return await db.collection('users').find({}).toArray();
  },

  getUserById: async (id) => {
    const db = await getDb();
    return await db.collection('users').findOne({ id });
  },

  getUserByUsernameOrEmail: async (identifier) => {
    const cleanId = identifier.trim().toLowerCase();
    const db = await getDb();
    return await db.collection('users').findOne({
      $or: [
        { username: { $regex: new RegExp('^' + cleanId + '$', 'i') } },
        { email: { $regex: new RegExp('^' + cleanId + '$', 'i') } }
      ]
    });
  },

  getUserByEmail: async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const db = await getDb();
    return await db.collection('users').findOne({
      email: { $regex: new RegExp('^' + cleanEmail + '$', 'i') }
    });
  },

  getUserByUsername: async (username) => {
    const db = await getDb();
    return await db.collection('users').findOne({
      username: { $regex: new RegExp('^' + username + '$', 'i') }
    });
  },
  
  createUser: async (userData) => {
    const db = await getDb();
    const id = 'PA_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newUser = { id, role: 'patient', ...userData };
    await db.collection('users').insertOne(newUser);
    return newUser;
  },

  createUserWithRole: async (userData) => {
    const db = await getDb();
    let prefix = 'PA_';
    if (userData.role === 'doctor') prefix = 'DOC_';
    else if (userData.role === 'admin') prefix = 'ADM_';
    const id = prefix + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newUser = { id, ...userData };
    await db.collection('users').insertOne(newUser);
    return newUser;
  },

  getDoctors: async () => {
    const db = await getDb();
    return await db.collection('users').find({ role: 'doctor' }).toArray();
  },

  getAppointments: async (userId, role) => {
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
    const db = await getDb();
    const id = 'AP_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newAppt = {
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...apptData
    };
    await db.collection('appointments').insertOne(newAppt);
    return newAppt;
  },

  updateAppointmentStatus: async (id, status) => {
    const db = await getDb();
    await db.collection('appointments').updateOne({ id }, { $set: { status } });
    return await db.collection('appointments').findOne({ id });
  },

  getPrescriptions: async (userId, role) => {
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
    const db = await getDb();
    const id = 'PR_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newPresc = {
      id,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      ...prescData
    };
    await db.collection('prescriptions').insertOne(newPresc);
    return newPresc;
  },

  getMessages: async (userId) => {
    const db = await getDb();
    return await db.collection('messages').find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).toArray();
  },

  createMessage: async (msgData) => {
    const db = await getDb();
    const id = 'MSG_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newMsg = {
      id,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...msgData
    };
    await db.collection('messages').insertOne(newMsg);
    return newMsg;
  },

  markMessagesAsRead: async (userId, contactId) => {
    const db = await getDb();
    await db.collection('messages').updateMany(
      { senderId: contactId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );
  },

  getMedicalRecords: async (patientId) => {
    const db = await getDb();
    return await db.collection('records').find({ patientId }).toArray();
  },

  createMedicalRecord: async (recData) => {
    const db = await getDb();
    const id = 'REC_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newRec = {
      id,
      date: new Date().toISOString().split('T')[0],
      ...recData
    };
    await db.collection('records').insertOne(newRec);
    return newRec;
  },

  deleteUser: async (id) => {
    const db = await getDb();
    const user = await db.collection('users').findOne({ id });
    if (user) {
      await db.collection('users').deleteOne({ id });
      return user;
    }
    return null;
  },

  resetDb: async () => {
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
