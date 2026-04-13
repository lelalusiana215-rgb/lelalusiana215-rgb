import express from "express";
import fs from "fs";
import path from "path";
import admin from "firebase-admin";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Firebase Config
let firebaseConfig: any;
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

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    const options: any = {};
    if (firebaseConfig.projectId) {
      options.projectId = firebaseConfig.projectId;
      console.log("Initializing Firebase Admin with project ID:", options.projectId);
    }
    
    admin.initializeApp(options);
    console.log("Firebase Admin initialized successfully");
  } catch (e) {
    console.error("Firebase Admin initialization failed:", e);
  }
}

// API Routes
app.get("/api/test-firebase", async (req, res) => {
  let identityToolkitStatus = "unknown";
  let adminAuthStatus = "unknown";

  if (firebaseConfig.apiKey) {
    try {
      const testRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "password", returnSecureToken: false })
      });
      const data = await testRes.json();
      if (data.error && data.error.message === "EMAIL_EXISTS") {
        identityToolkitStatus = "active";
      } else if (data.error && (data.error.message.includes("SERVICE_DISABLED") || data.error.code === 403)) {
        identityToolkitStatus = "disabled";
      } else {
        identityToolkitStatus = "active"; // Most other errors mean the API is reachable
      }
    } catch (e) {
      identityToolkitStatus = "error";
    }
  }

  if (admin.apps.length > 0) {
    try {
      // Try a simple auth operation to check if Admin SDK is working for Auth
      await admin.auth().getUserByEmail("non-existent@test.com").catch((e) => {
        if (e.code === 'auth/user-not-found') adminAuthStatus = "working";
        else throw e;
      });
    } catch (e: any) {
      adminAuthStatus = `error: ${e.code} (${e.message?.substring(0, 50)}...)`;
    }
  }

  res.json({
    firebaseConfigLoaded: !!firebaseConfig,
    projectId: firebaseConfig?.projectId,
    adminInitialized: admin.apps.length > 0,
    adminProjectId: admin.apps.length > 0 ? admin.app().options.projectId : "not initialized",
    identityToolkitStatus,
    adminAuthStatus
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
    let uid;
    const apiKey = firebaseConfig.apiKey;
    if (!apiKey) throw new Error("Firebase API Key not found");

    console.log("Attempting to create/update teacher via REST API:", email);
    
    // 1. Try to create user via REST API (always uses the correct project via API Key)
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
    
    if (signUpData.error) {
      if (signUpData.error.message === 'EMAIL_EXISTS') {
        console.log("Email exists, attempting to get UID...");
        
        // Try to get UID via Admin SDK first (if it works)
        if (admin.apps.length > 0) {
          try {
            const userRecord = await admin.auth().getUserByEmail(email);
            uid = userRecord.uid;
            console.log("Found existing UID via Admin SDK:", uid);
            
            // Update password if needed
            await admin.auth().updateUser(uid, { password, displayName: name });
          } catch (adminErr: any) {
            console.warn("Admin SDK failed to get/update user, falling back to REST sign-in:", adminErr.code);
            // Fallback to sign-in to get UID
            const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password: password || "guru123", returnSecureToken: true })
            });
            const signInData = await signInRes.json();
            if (signInData.error) {
              throw new Error("Email sudah terdaftar dengan kata sandi berbeda. Silakan gunakan NIP yang benar sebagai kata sandi.");
            }
            uid = signInData.localId;
          }
        } else {
          // Fallback to sign-in to get UID
          const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: password || "guru123", returnSecureToken: true })
          });
          const signInData = await signInRes.json();
          if (signInData.error) {
            throw new Error("Email sudah terdaftar. Gunakan NIP sebagai kata sandi untuk masuk.");
          }
          uid = signInData.localId;
        }
      } else {
        throw new Error(signUpData.error.message);
      }
    } else {
      uid = signUpData.localId;
      console.log("New user created via REST API:", uid);
    }

    res.json({ success: true, id: uid, email, password });
  } catch (e: any) {
    console.error("Final error in /api/teachers:", e);
    let errorMessage = e.message || String(e);
    
    if (errorMessage.includes("identitytoolkit.googleapis.com") || errorMessage.includes("SERVICE_DISABLED")) {
      errorMessage = "Sistem Autentikasi sedang dalam proses aktivasi oleh Google. Mohon tunggu 5-10 menit lalu coba lagi. Jika masalah berlanjut, hubungi pengembang.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

app.delete("/api/teachers/:id", async (req, res) => {
  const { id } = req.params;
  
  if (admin.apps.length === 0) {
    return res.status(500).json({ error: "Firebase Admin not initialized" });
  }

  try {
    await admin.auth().deleteUser(id);
    res.json({ success: true, message: "User deleted from Auth" });
  } catch (e: any) {
    console.error("Error deleting user from Auth:", e);
    // If user not found in Auth, it's fine, they might have been deleted already
    if (e.code === 'auth/user-not-found') {
      return res.json({ success: true, message: "User already deleted or not found in Auth" });
    }
    res.status(500).json({ error: e.message || String(e) });
  }
});

export default app;
