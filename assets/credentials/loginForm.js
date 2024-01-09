import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db, auth } from "../credentials/firebaseModule.js";

var adminEmail = document.getElementById('adminEmail');
var adminPassword = document.getElementById('adminPassword');
var memberEmail = document.getElementById('memberEmail');
var memberPassword = document.getElementById('memberPassword');

const adminSubmitB = document.getElementById('adminSubmit');
const memberSubmitB = document.getElementById('memberSubmit');

const userCollectionRef = collection(db, "Accounts");


function handleDashboard(email, userType) {
  // Create a URL with email and userType as query parameters
  const url = `http://127.0.0.1:5501/view/dashboard.html?email=${encodeURIComponent(email)}&userType=${encodeURIComponent(userType)}`;
  // Use window.location.replace() to prevent going back to the login form
  window.location.replace(url);
}

function handleMemberView(memberName) {
  // Create a URL with memID as a query parameter
  const url = `http://127.0.0.1:5501/view/memberView.html?&memberName=${encodeURIComponent(memberName)}`;
  // Use window.location.replace() to prevent going back to the login form
  window.location.replace(url);
}
document.getElementById("adminPassword").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault(); 
    adminSignIn();
  }
});


document.getElementById("memberPassword").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault(); 
    memberSignIn();
  }
});

async function adminSignIn() {
  const email = adminEmail.value;
  const password = adminPassword.value;

  const q = query(userCollectionRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.size === 0) {
    alert("Admin/Staff not found.");
    return;
  }

  const userDoc = querySnapshot.docs[0];
  const userType = userDoc.data().userType;

  if (userType === "admin" || userType === "staff") {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login Success");
      handleDashboard(email, userType);
    } catch (error) {
      alert("Login Failed. Please check your email and password and try again.");
      console.log(`There was an error: ${error}`);
      console.log(error);
    }
  } else {
    alert("You are not an admin.");
  }
}

async function memberSignIn() {
  const email = memberEmail.value;
  const password = memberPassword.value;

  const q = query(userCollectionRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.size === 0) {
    alert("Member not found.");
    return;
  }

  const userDoc = querySnapshot.docs[0];
  const memberName = userDoc.data().memberName;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login Success");
    handleMemberView(memberName);
  } catch (error) {
    alert("Login Failed. Please check your email and password and try again.");
    console.log(`There was an error: ${error}`);
    console.log(error);
  }
}

adminSubmitB.addEventListener('click', adminSignIn);
memberSubmitB.addEventListener('click', memberSignIn);
