const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { admin, db } = require("../config/firebase");
const ROLES = require("../constants/roles");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Force role to STUDENT
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: ROLES.STUDENT,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("users").add(newUser);

    res
      .status(201)
      .json({
        message: "Student registered successfully",
        user: { id: docRef.id, email, role: ROLES.STUDENT },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { id: userId, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );


      // exports.login — update the response
res.status(200).json({
  message: 'Login successful',
  token,
  role: userData.role,
  name: userData.name,       // ← already there ✓
  isGoogleUser: false        // ← ADD THIS
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    //  Firebase token verify
    const decoded = await admin.auth().verifyIdToken(token);

    const { email, name, uid } = decoded;

    //  check user exist
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    let userId;
    let userData;

    if (userSnapshot.empty) {
      //  New Google user
      const newUser = {
        name: name || "Google User",
        email,
        role: ROLES.STUDENT,
        googleId: uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await db.collection("users").add(newUser);
      userId = docRef.id;
      userData = newUser;
    } else {
      //  Existing user
      userId = userSnapshot.docs[0].id;
      userData = userSnapshot.docs[0].data();

      if (!userData.googleId) {
        await db.collection("users").doc(userId).update({
          googleId: uid,
        });
      }
    }

    //  JWT generate
    const jwtToken = jwt.sign(
      { id: userId, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

// googleLogin — only ONE response, remove the duplicate normal-login block
res.status(200).json({
  message: 'Google login successful',
  token: jwtToken,
  role: userData.role,
  name: userData.name,
  isGoogleUser: true
});
// DELETE the second res.status(200).json block that says "normal login"
  } catch (error) {
    res.status(401).json({ message: "Invalid Google token" });
  }
};
