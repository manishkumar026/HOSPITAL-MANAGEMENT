const http = require('http');
const fs = require('fs');
const path = require('path');

// Auto-copy generated image assets to images/ on local startup
function copyGeneratedImages() {
  const srcDirName = 'C:\\Users\\manis\\.gemini\\antigravity-ide\\brain\\5925e834-af4c-4082-a027-7ebb03c44bdc';
  const destDir = path.join(__dirname, 'images');

  const filesMap = {
    'hero_bg_1780676676115.png': 'hero_bg.png',
    'facility_1780676696581.png': 'facility.png',
    'mission_1780676713977.png': 'mission.png',
    'accreditations_1780676730135.png': 'accreditations.png',
    'emergency_1780676747437.png': 'emergency.png',
    'cardiology_1780676764241.png': 'cardiology.png',
    'pediatrics_1780676781600.png': 'pediatrics.png',
    'dr_sarah_1780676796805.png': 'dr_sarah.png',
    'dr_michael_1780676813299.png': 'dr_michael.png',
    'dr_priya_1780676830737.png': 'dr_priya.png',
    'dr_robert_1780676844866.png': 'dr_robert.png'
  };

  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    Object.entries(filesMap).forEach(([srcName, destName]) => {
      const srcPath = path.join(srcDirName, srcName);
      const destPath = path.join(destDir, destName);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied image asset: ${destName}`);
      }
    });
  } catch (err) {
    // Fail silently in cloud environments
  }
}
copyGeneratedImages();
const db = require('./database');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Active SSE client connections: Map of userId -> array of response objects
const sseClients = new Map();

// Helper to generate simple token (Base64 JWT-like string)
function generateToken(userId, role) {
  const payload = { userId, role, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Helper to verify token
function verifyToken(token) {
  try {
    if (!token) return null;
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (decoded.exp < Date.now()) return null;
    return decoded; // { userId, role }
  } catch (e) {
    return null;
  }
}

// Send real-time SSE event to a specific user
function sendSseToUser(userId, type, payload) {
  const clientList = sseClients.get(userId);
  if (clientList) {
    const data = JSON.stringify({ type, ...payload });
    clientList.forEach(res => {
      res.write(`data: ${data}\n\n`);
    });
  }
}

// Send real-time SSE event to all users of a specific role (e.g. 'doctor', 'admin')
async function sendSseToRole(role, type, payload) {
  const allUsers = await db.getUsers();
  allUsers.forEach(user => {
    if (user.role === role) {
      sendSseToUser(user.id, type, payload);
    }
  });
}

// Helper to parse JSON body from request
function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Helper to send JSON responses
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Static File Server
function serveStaticFile(req, res) {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/index.html') {
    reqPath = '/homepage.html';
  }

  // Resolve absolute path and prevent directory traversal
  const filePath = path.join(PUBLIC_DIR, reqPath);
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(PUBLIC_DIR))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check file exists
  if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>');
    return;
  }

  // Determine Content-Type
  const ext = path.extname(resolvedPath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  
  const stream = fs.createReadStream(resolvedPath);
  stream.pipe(res);
}

// Server Request Handler
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, auth-token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Real-Time SSE Event Stream
  if (pathname === '/api/realtime' && req.method === 'GET') {
    const token = urlObj.searchParams.get('token');
    const auth = verifyToken(token);
    if (!auth) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('Unauthorized');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Send initial test event to establish stream connection
    res.write(`data: ${JSON.stringify({ type: 'connected', userId: auth.userId })}\n\n`);

    // Add to active clients map
    if (!sseClients.has(auth.userId)) {
      sseClients.set(auth.userId, []);
    }
    sseClients.get(auth.userId).push(res);

    req.on('close', () => {
      const userResList = sseClients.get(auth.userId);
      if (userResList) {
        const idx = userResList.indexOf(res);
        if (idx !== -1) {
          userResList.splice(idx, 1);
        }
        if (userResList.length === 0) {
          sseClients.delete(auth.userId);
        }
      }
    });
    return;
  }

  // REST API Route Handling
  if (pathname.startsWith('/api/')) {
    try {
      // 1. PUBLIC ROUTES
      // ----------------------------------------
      
      // Patient Registration
      if (pathname === '/api/auth/register' && req.method === 'POST') {
        const body = await getJsonBody(req);
        if (!body.username || !body.password || !body.email || !body.firstName) {
          sendJson(res, 400, { error: 'Missing required registration fields' });
          return;
        }

        const existing = await db.getUserByUsername(body.username);
        if (existing) {
          sendJson(res, 400, { error: 'Username already exists' });
          return;
        }

        const newUser = await db.createUser(body);
        const token = generateToken(newUser.id, newUser.role);
        sendJson(res, 201, { token, user: { id: newUser.id, username: newUser.username, role: newUser.role, firstName: newUser.firstName, lastName: newUser.lastName } });
        return;
      }

      // Login
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await getJsonBody(req);
        if (!body.username || !body.password) {
          sendJson(res, 400, { error: 'Missing username or password' });
          return;
        }

        const user = await db.getUserByUsernameOrEmail(body.username);
        if (!user || !db.verifyPassword(body.password, user)) {
          sendJson(res, 400, { error: 'Invalid username or password' });
          return;
        }

        const token = generateToken(user.id, user.role);
        sendJson(res, 200, { token, user: { id: user.id, username: user.username, role: user.role, firstName: user.firstName, lastName: user.lastName } });
        return;
      }

      // Google-Login (Public)
      if (pathname === '/api/auth/google-login' && req.method === 'POST') {
        const body = await getJsonBody(req);
        if (!body.credential) {
          sendJson(res, 400, { error: 'Missing Google credential token' });
          return;
        }

        const https = require('https');
        https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${body.credential}`, (googleRes) => {
          let data = '';
          googleRes.on('data', chunk => { data += chunk; });
          googleRes.on('end', async () => {
            try {
              const googleInfo = JSON.parse(data);
              if (googleRes.statusCode !== 200 || !googleInfo.email) {
                sendJson(res, 401, { error: 'Invalid Google token' });
                return;
              }
              
              let user = await db.getUserByEmail(googleInfo.email);
              if (!user) {
                // Register a new patient account dynamically using Google profile data
                user = await db.createUser({
                  username: googleInfo.email.split('@')[0],
                  password: 'google_oauth_user_' + Date.now(), // Secure random dummy password
                  firstName: googleInfo.given_name || 'Google',
                  lastName: googleInfo.family_name || 'User',
                  email: googleInfo.email
                });
              }

              const token = generateToken(user.id, user.role);
              sendJson(res, 200, { token, user: { id: user.id, username: user.username, role: user.role, firstName: user.firstName, lastName: user.lastName } });
            } catch (err) {
              sendJson(res, 500, { error: 'Failed to process Google login' });
            }
          });
        }).on('error', (err) => {
          sendJson(res, 500, { error: 'Failed to reach Google verification servers' });
        });
        return;
      }

      // Reset Database (Public for development / testing)
      if (pathname === '/api/admin/reset-db' && req.method === 'POST') {
        await db.resetDb();
        sendJson(res, 200, { message: 'Database reset successfully' });
        return;
      }

      // 2. AUTHENTICATED ROUTES
      // ----------------------------------------
      const token = req.headers['auth-token'];
      const auth = verifyToken(token);
      if (!auth) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      // Get Current User Profile
      if (pathname === '/api/auth/me' && req.method === 'GET') {
        const user = await db.getUserById(auth.userId);
        if (!user) {
          sendJson(res, 404, { error: 'User not found' });
          return;
        }
        // Remove password from response
        const { password, ...safeUser } = user;
        sendJson(res, 200, safeUser);
        return;
      }

      // Get Doctors List
      if (pathname === '/api/users/doctors' && req.method === 'GET') {
        const doctors = (await db.getDoctors()).map(d => ({
          id: d.id,
          firstName: d.firstName,
          lastName: d.lastName,
          department: d.department,
          email: d.email,
          phone: d.phone
        }));
        sendJson(res, 200, doctors);
        return;
      }

      // Get Patients List (Admins and Doctors only)
      if (pathname === '/api/users/patients' && req.method === 'GET') {
        if (auth.role !== 'admin' && auth.role !== 'doctor') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }
        const patients = (await db.getUsers()).filter(u => u.role === 'patient').map(p => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          dob: p.dob,
          gender: p.gender,
          address: p.address,
          city: p.city,
          zip: p.zip
        }));
        sendJson(res, 200, patients);
        return;
      }

      // Get All Users (Admin only)
      if (pathname === '/api/users' && req.method === 'GET') {
        if (auth.role !== 'admin') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }
        const users = (await db.getUsers()).map(({ password, ...safeUser }) => safeUser);
        sendJson(res, 200, users);
        return;
      }

      // Create User with Role (Admin only)
      if (pathname === '/api/users' && req.method === 'POST') {
        if (auth.role !== 'admin') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }
        const body = await getJsonBody(req);
        if (!body.username || !body.password || !body.firstName || !body.lastName || !body.role) {
          sendJson(res, 400, { error: 'Missing required fields' });
          return;
        }
        const existing = await db.getUserByUsername(body.username);
        if (existing) {
          sendJson(res, 400, { error: 'Username already exists' });
          return;
        }
        const newUser = await db.createUserWithRole(body);
        const { password, ...safeUser } = newUser;
        sendJson(res, 201, safeUser);
        return;
      }

      // Delete User (Admin only)
      if (pathname === '/api/users/delete' && req.method === 'POST') {
        if (auth.role !== 'admin') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }
        const body = await getJsonBody(req);
        if (!body.userId) {
          sendJson(res, 400, { error: 'Missing userId' });
          return;
        }
        if (body.userId === auth.userId) {
          sendJson(res, 400, { error: 'Cannot delete yourself' });
          return;
        }
        const deleted = await db.deleteUser(body.userId);
        if (deleted) {
          sendJson(res, 200, { message: 'User deleted successfully' });
        } else {
          sendJson(res, 404, { error: 'User not found' });
        }
        return;
      }

      // Get Appointments
      if (pathname === '/api/appointments' && req.method === 'GET') {
        const list = await db.getAppointments(auth.userId, auth.role);
        sendJson(res, 200, list);
        return;
      }

      // Book Appointment
      if (pathname === '/api/appointments' && req.method === 'POST') {
        const body = await getJsonBody(req);
        if (!body.doctorId || !body.dateTime || !body.timeSlot || !body.department) {
          sendJson(res, 400, { error: 'Missing appointment details' });
          return;
        }

        const doctor = await db.getUserById(body.doctorId);
        if (!doctor || doctor.role !== 'doctor') {
          sendJson(res, 404, { error: 'Doctor not found' });
          return;
        }

        const patient = await db.getUserById(auth.userId);

        const apptData = {
          patientId: auth.userId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientEmail: patient.email,
          patientPhone: patient.phone,
          patientDob: patient.dob || '',
          doctorId: body.doctorId,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          department: body.department,
          dateTime: body.dateTime,
          timeSlot: body.timeSlot,
          message: body.message || ''
        };

        const newAppt = await db.createAppointment(apptData);

        // Notify Doctor and Admin in Real-Time
        sendSseToUser(body.doctorId, 'appointment_booked', {
          appointmentId: newAppt.id,
          patientName: apptData.patientName,
          dateTime: newAppt.dateTime,
          timeSlot: newAppt.timeSlot,
          status: newAppt.status
        });

        await sendSseToRole('admin', 'appointment_booked', {
          appointmentId: newAppt.id,
          patientName: apptData.patientName,
          doctorName: apptData.doctorName,
          dateTime: newAppt.dateTime,
          timeSlot: newAppt.timeSlot,
          status: newAppt.status
        });

        sendJson(res, 201, newAppt);
        return;
      }

      // Update Appointment Status (Admin and Doctor only)
      if (pathname === '/api/appointments/status' && req.method === 'POST') {
        if (auth.role !== 'admin' && auth.role !== 'doctor') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }

        const body = await getJsonBody(req);
        if (!body.appointmentId || !body.status) {
          sendJson(res, 400, { error: 'Missing appointmentId or status' });
          return;
        }

        const updated = await db.updateAppointmentStatus(body.appointmentId, body.status);
        if (!updated) {
          sendJson(res, 404, { error: 'Appointment not found' });
          return;
        }

        // Notify Patient in Real-Time
        sendSseToUser(updated.patientId, 'appointment_status_changed', {
          appointmentId: updated.id,
          status: updated.status,
          doctorName: updated.doctorName,
          dateTime: updated.dateTime
        });

        // Notify Admin and Doctor of status change
        await sendSseToRole('admin', 'appointment_status_changed', {
          appointmentId: updated.id,
          status: updated.status,
          patientName: updated.patientName,
          doctorName: updated.doctorName
        });
        sendSseToUser(updated.doctorId, 'appointment_status_changed', {
          appointmentId: updated.id,
          status: updated.status,
          patientName: updated.patientName
        });

        sendJson(res, 200, updated);
        return;
      }

      // Get Prescriptions
      if (pathname === '/api/prescriptions' && req.method === 'GET') {
        const list = await db.getPrescriptions(auth.userId, auth.role);
        sendJson(res, 200, list);
        return;
      }

      // Create Prescription (Doctors only)
      if (pathname === '/api/prescriptions' && req.method === 'POST') {
        if (auth.role !== 'doctor') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }

        const body = await getJsonBody(req);
        if (!body.patientId || !body.medication || !body.dosage || !body.frequency || !body.duration) {
          sendJson(res, 400, { error: 'Missing prescription details' });
          return;
        }

        const patient = await db.getUserById(body.patientId);
        if (!patient || patient.role !== 'patient') {
          sendJson(res, 404, { error: 'Patient not found' });
          return;
        }

        const doctor = await db.getUserById(auth.userId);

        const newPresc = await db.createPrescription({
          patientId: body.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorId: auth.userId,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          medication: body.medication,
          dosage: body.dosage,
          frequency: body.frequency,
          duration: body.duration,
          instructions: body.instructions || ''
        });

        // Notify Patient in Real-Time
        sendSseToUser(body.patientId, 'prescription_added', {
          prescriptionId: newPresc.id,
          medication: newPresc.medication,
          doctorName: newPresc.doctorName
        });

        sendJson(res, 201, newPresc);
        return;
      }

      // Get Medical Records
      if (pathname === '/api/records' && req.method === 'GET') {
        const patientId = urlObj.searchParams.get('patientId') || auth.userId;
        
        // Patients can only see their own records. Doctors/Admins can see any patient's records
        if (auth.role === 'patient' && patientId !== auth.userId) {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }

        const list = await db.getMedicalRecords(patientId);
        sendJson(res, 200, list);
        return;
      }

      // Create Medical Record (Doctors only)
      if (pathname === '/api/records' && req.method === 'POST') {
        if (auth.role !== 'doctor') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }

        const body = await getJsonBody(req);
        if (!body.patientId || !body.diagnosis || !body.treatment) {
          sendJson(res, 400, { error: 'Missing diagnosis or treatment' });
          return;
        }

        const patient = await db.getUserById(body.patientId);
        if (!patient || patient.role !== 'patient') {
          sendJson(res, 404, { error: 'Patient not found' });
          return;
        }

        const doctor = await db.getUserById(auth.userId);

        const newRec = await db.createMedicalRecord({
          patientId: body.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorId: auth.userId,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          diagnosis: body.diagnosis,
          treatment: body.treatment,
          notes: body.notes || ''
        });

        // Notify Patient in Real-Time
        sendSseToUser(body.patientId, 'record_added', {
          recordId: newRec.id,
          diagnosis: newRec.diagnosis,
          doctorName: newRec.doctorName
        });

        sendJson(res, 201, newRec);
        return;
      }

      // Get Chat Message History
      if (pathname === '/api/messages' && req.method === 'GET') {
        const contactId = urlObj.searchParams.get('contactId');
        if (!contactId) {
          sendJson(res, 400, { error: 'Missing contactId param' });
          return;
        }

        // Retrieve messages, filter for this specific conversation, and mark unread messages as read
        const list = await db.getMessages(auth.userId);
        const chatHistory = list.filter(m => 
          (m.senderId === auth.userId && m.receiverId === contactId) ||
          (m.senderId === contactId && m.receiverId === auth.userId)
        );

        await db.markMessagesAsRead(auth.userId, contactId);

        sendJson(res, 200, chatHistory);
        return;
      }

      // Send Chat Message
      if (pathname === '/api/messages' && req.method === 'POST') {
        const body = await getJsonBody(req);
        if (!body.receiverId || !body.content) {
          sendJson(res, 400, { error: 'Missing receiverId or content' });
          return;
        }

        const sender = await db.getUserById(auth.userId);
        const receiver = await db.getUserById(body.receiverId);
        if (!receiver) {
          sendJson(res, 404, { error: 'Receiver not found' });
          return;
        }

        const newMsg = await db.createMessage({
          senderId: auth.userId,
          senderName: `${sender.firstName} ${sender.lastName}`,
          receiverId: body.receiverId,
          content: body.content
        });

        // Notify Receiver in Real-Time
        sendSseToUser(body.receiverId, 'new_message', {
          messageId: newMsg.id,
          senderId: auth.userId,
          senderName: newMsg.senderName,
          content: newMsg.content,
          timestamp: newMsg.timestamp
        });

        sendJson(res, 201, newMsg);
        return;
      }

      // If no API routes match
      sendJson(res, 404, { error: `Endpoint ${req.method} ${pathname} not found` });

    } catch (err) {
      console.error('API Error:', err);
      sendJson(res, 500, { error: 'Internal Server Error', details: err.message });
    }
  } else {
    // Serve Static Frontend File
    serveStaticFile(req, res);
  }
});

// Start Server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Santhéa Hospital Server is running in Real-Time Mode!`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`📦 SSE Events Source: http://localhost:${PORT}/api/realtime`);
  console.log(`======================================================\n`);
});
