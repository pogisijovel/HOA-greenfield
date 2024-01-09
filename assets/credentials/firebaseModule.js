import { getAuth } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCR5B40sAXSzKPHMwS_Q10OsY34HEV0TY",
  authDomain: "mycapstone-edacd.firebaseapp.com",
  projectId: "mycapstone-edacd",
  storageBucket: "mycapstone-edacd.appspot.com",
  messagingSenderId: "821528014335",
  appId: "1:821528014335:web:75906e7123e3616d310bca",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export { db , auth};