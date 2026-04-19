import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (requires service account)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : null;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized');
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT not found. Auth creation will be skipped.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/create-employee', async (req, res) => {
    const { firstname, lastname, email, phone, job_title, companyId, companyName, brandColor, password } = req.body;
    
    if (!serviceAccount) {
      return res.status(500).json({ error: 'Firebase Admin not configured on server.' });
    }

    try {
      // 1. Create Auth User
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstname} ${lastname}`,
        phoneNumber: phone.startsWith('+') ? phone : undefined // Simple check
      });

      // 2. Generate Username
      const combined = (firstname + lastname).toLowerCase();
      const latinOnly = combined.split('').filter(char => /^[a-z0-9]$/.test(char)).join('');
      const base = latinOnly || 'user';
      const username = base + Math.floor(Math.random() * 1000);

      // 3. Create Profile in Firestore
      const profileData = {
        lastname,
        firstname,
        username,
        email,
        phone,
        job_title,
        company: companyName,
        company_id: companyId,
        is_company_admin: false,
        card_color: brandColor,
        card_text_color: '#ffffff',
        role: 'user',
        plan: 'business',
        verified: false,
        is_active: true,
        show_in_directory: true,
        profile_public: true,
        view_count: 0,
        qr_scan_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await admin.firestore().collection('profiles').doc(userRecord.uid).set(profileData);

      // 4. Add to Company Members
      await admin.firestore().collection('companies').doc(companyId).collection('members').doc(userRecord.uid).set({
        company_id: companyId,
        user_id: userRecord.uid,
        role: 'employee',
        joined_at: new Date().toISOString()
      });

      res.json({ success: true, uid: userRecord.uid, username });
    } catch (error: any) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
