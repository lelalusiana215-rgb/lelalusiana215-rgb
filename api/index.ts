import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Firebase Config
let firebaseConfig;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} catch (e) {
  console.warn("Could not load firebase-applet-config.json, falling back to env vars");
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    apiKey: process.env.FIREBASE_API_KEY,
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID
  };
}

// API Routes
app.get("/api/test-firebase", (req, res) => {
  res.json({
    firebaseConfigLoaded: !!firebaseConfig,
    projectId: firebaseConfig?.projectId
  });
});

app.post("/api/teachers", async (req, res) => {
  if (!firebaseConfig.apiKey) return res.status(500).json({ error: "Firebase API Key not found" });
  let { name, email, password, nip, teaching_class, rank_grade, school_id, principal_id } = req.body;
  
  // Auto-generate email and password if not provided
  if (!email) {
    const cleanNip = nip ? nip.replace(/[^a-zA-Z0-9]/g, '') : Math.random().toString(36).substring(2, 10);
    email = `guru_${cleanNip}@sekolah.local`;
  }
  if (!password || password.length < 6) {
    password = (nip && nip.length >= 6) ? nip : "guru12345";
  }

  try {
    // 1. Create Auth User using REST API
    const apiKey = firebaseConfig.apiKey;
    const signUpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: password || "guru123",
        returnSecureToken: true
      })
    });
    
    const signUpData = await signUpRes.json();
    let uid;
    let idToken;

    if (signUpData.error) {
      if (signUpData.error.message === 'EMAIL_EXISTS') {
        // If email exists, try to sign in to get the UID (useful if teacher was deleted from Firestore but not Auth)
        const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: password || "guru123",
            returnSecureToken: true
          })
        });
        const signInData = await signInRes.json();
        if (signInData.error) {
          throw new Error("Email sudah terdaftar. Jika ini guru yang pernah dihapus, pastikan kata sandi yang dimasukkan sama dengan sebelumnya.");
        }
        uid = signInData.localId;
        idToken = signInData.idToken;
      } else {
        throw new Error(signUpData.error.message);
      }
    } else {
      uid = signUpData.localId;
      idToken = signUpData.idToken;
    }

    // Update displayName
    await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        displayName: name,
        returnSecureToken: false
      })
    });

    res.json({ success: true, id: uid, email, password });
  } catch (e: any) {
    console.error("Error creating teacher:", e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

export default app;
