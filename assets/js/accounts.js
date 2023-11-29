import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { doc, addDoc,getDocs, setDoc,collection, updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast, } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db, auth } from "../credentials/firebaseModule.js";


const memberRef = collection(db, "Members");

const submit = document.getElementById("submit");

let emailInput = document.getElementById("email");
let userType = document.getElementById("userType");
let memberName = document.getElementById("memName");
let contactNum = document.getElementById("contactNum");
let passwordInput = document.getElementById("password");
let confirmPasswordInput = document.getElementById("Cpassword");
const bleta = document.getElementById("accountsTable");
let currentPage = 1; 
const pageSize = 20; 
let lastVisible = null; 
let firstVisible = null; 
var heading = document.getElementById("myHeading");
let user = document.getElementById("user");




document.addEventListener('DOMContentLoaded', (event) => {
  fetchAndPopulateTable();
  createPaginationControls();
  names();
});

user.addEventListener('change', (event) => {
  fetchAndPopulateTable();
});

async function names() {
  const datalist = document.getElementById("names");

  // Clear existing options
  datalist.innerHTML = "";

  try {
    // Query the Firestore database for member names
    const querySnapshot = await getDocs(memberRef);

    // Create a default option for clarity (optional)
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "Select a name";
    datalist.appendChild(defaultOption);

    querySnapshot.forEach((doc) => {
      // Access the "memberName" field from each document
      const memberName = doc.data().memberName;

      // Create an option element for each member name
      const option = document.createElement("option");
      option.value = memberName;

      // Append the option to the datalist
      datalist.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching member names: ", error);
  }
}


document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    // Check if the pressed key is an arrow key (left, up, right, down)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Prevent the default behavior of arrow keys
      e.preventDefault();
    }
  });
});

memberName.addEventListener("change", async function () {
  if (memberName.value) { 
    const queryRef = query(collection(db, "Members"), where("memberName", "==", memberName.value));
    try { 
      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        document.getElementById("contactNum").value = data.contactNum;
      } else {
        console.log("Member not found.");
      }
    } catch (error) {
      console.log("Error retrieving member information:", error);
    }
  } else {
    console.log("Member name is required.");
  }
});


// Function to create a user account with email verification
async function createAccount() {
  // Get input values
  const email = emailInput?.value;
  const password = passwordInput?.value;
  const confirmPassword = confirmPasswordInput?.value;

  // Validate password match
  if (password !== confirmPassword) {
    alert.error("Passwords do not match");
    return;
  }


  if (!memberName?.value || !emailInput.value || !userType.value || !contactNum.value || !passwordInput.value || !confirmPasswordInput.value) {
    alert("Fill all the empty fields.");
    return;
  }

  // Check if a document with the same member name exists
  const queryRef = query(collection(db, "Members"), where("memberName", "==", memberName?.value));
  const querySnapshot = await getDocs(queryRef);

  const accRef = query(collection(db, "Accounts"), where("memberName", "==", memberName?.value));
  const accSanp = await getDocs(accRef);

  if (!accSanp.empty) {
    alert("This member already has and account.");
    return;
  }


  if (querySnapshot.empty) {
    alert("This member name does not exist in the members list.");
    return;
  }

  // Set up Firestore document reference for the user account
  const userDocRef = doc(collection(db, "Accounts"));

  // Prepare data for the user account
  const userData = {
    email: email,
    userType: userType?.value,
    memberName: memberName?.value,
    contactNum: contactNum?.value,
  };

  try {
    // Add user data to Firestore
    

    // Create user account with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);
    await setDoc(userDocRef, userData);
    // Display success message
    alert("Account has been created. Please check your email for verification.");

    // Fetch and populate the table (assuming these functions are defined elsewhere)
    fetchAndPopulateTable();

    // Clear input fields
    clear();
  } catch (error) {
    // Handle errors
    console.error("Error creating account:", error);
    alert(error);
  }
}




//===================================================================================
function clear(){
 email .value = "";
 userType .value = "";
 memberName .value = "";
 contactNum .value = "";
 passwordInput .value = "";
 confirmPasswordInput .value = "";
}
//===================================================================================
function filterTable() {
  const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
  const accountsTable = document.getElementById("accountsTable");
  const rows = accountsTable.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const nameCell = rows[i].getElementsByTagName("td")[2]; // Get the second cell (name cell)
    if (nameCell) {
      const name = nameCell.textContent.toLowerCase();
      if (name.includes(searchInput)) {
        rows[i].style.display = ""; // Show the row if it matches the search
      } else {
        rows[i].style.display = "none"; // Hide the row if it doesn't match the search
      }
    }
  }
}

// Add an event listener to the search input field
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", filterTable);

// Call the filterTable function when the page loads
document.addEventListener("DOMContentLoaded", filterTable);


//===================================================================================


async function fetchAndPopulateTable(next = true) {
  const collectionRef = collection(db, "Accounts");
  let queryCol;

// Calculate the maximum number of pages
const totalDocumentsQuery = query(collectionRef);
const totalDocumentsSnapshot = await getDocs(totalDocumentsQuery);
const totalDocuments = totalDocumentsSnapshot.size;
let maxPages = Math.ceil(totalDocuments / pageSize);

// Define the base query with a page size limit
if (next && lastVisible && currentPage < maxPages) {
  // If fetching the next page
  queryCol = query(collectionRef, orderBy("memberName", "asc"), startAfter(lastVisible), limit(pageSize));
  currentPage++;
} else if (!next && firstVisible && currentPage > 1) {
  // If fetching the previous page
  queryCol = query(collectionRef, orderBy("memberName", "asc"), endBefore(firstVisible), limitToLast(pageSize));
  currentPage--;
} else {
  // This is the default query for the first page
  queryCol = query(collectionRef, orderBy("memberName", "asc"), limit(pageSize));
  currentPage = 1; // Reset to the first page
  firstVisible = null; // Reset first document snapshot
  lastVisible = null; // Reset last document snapshot
}


  // Clear existing rows in the table
  while (bleta.rows.length > 1) {
    bleta.deleteRow(1);
  }

  try {
    const querySnapshot = await getDocs(queryCol);
    const documentSnapshots = querySnapshot.docs;

    // Pagination controls update
    if (documentSnapshots.length > 0) {
      // Set the first and last document for pagination controls
      firstVisible = documentSnapshots[0];
      lastVisible = documentSnapshots[documentSnapshots.length - 1];
    }

    // Populate the table with the documents
    documentSnapshots.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // ... populate the row with data ...
      if (data.userType === user.value) {
                const row = bleta.insertRow(-1); // Add a new row to the table
        
                // Populate the row with member information
                const transactionID = row.insertCell(0);
                transactionID.textContent = data.userType;
        
                const memberName = row.insertCell(1);
                memberName.textContent = data.email;
        
                const date = row.insertCell(2);
                date.textContent = data.memberName;
        
                const amount = row.insertCell(3);
                amount.textContent = data.contactNum;
        
                const resetCell = row.insertCell(4);
                const resetButton = document.createElement("button");
                resetButton.textContent = "Reset Password";
                resetButton.addEventListener("click", () => {
                        // Call the password reset function with the user's email
                requestPasswordReset(data.email);
                });
                resetCell.appendChild(resetButton);
        
              }
    });

    updatePageDisplay(currentPage, maxPages); // Update the page display
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

function updatePageDisplay(currentPage, maxPages) {
  const pageInfo = document.getElementById('pageInfo');
  if (!pageInfo) {
    console.error('Page information element not found!');
    return;
  }
  pageInfo.textContent = `Page ${currentPage} / ${maxPages}`;
}

function createPaginationControls() {
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.onclick = () => fetchAndPopulateTable(true);

  // const prevButton = document.createElement("button");
  // prevButton.textContent = "Previous";
  // prevButton.onclick = () => fetchAndPopulateTable(false);

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  let alreadyAutoClicked = false; // Flag to ensure the auto-click only happens once
  
  prevButton.addEventListener('click', function handlePrevButtonClick() {
    fetchAndPopulateTable(false); // Call your function to handle the click
  
    // Check if the button has not been auto-clicked yet
    if (!alreadyAutoClicked) {
      // Set the flag to true to prevent further auto-clicks
      alreadyAutoClicked = true;
      // Dispatch a new click event programmatically
      prevButton.dispatchEvent(new MouseEvent('click'));
    }
  });


  // Assuming you have a div with id="paginationControls" in your HTML
  const controlsContainer = document.getElementById('paginationControls');
  controlsContainer.appendChild(prevButton);
  controlsContainer.appendChild(nextButton);
  const pageInfo = document.createElement('div');
  pageInfo.id = 'pageInfo';
  pageInfo.textContent = 'Page 1 / 1'; // Initial text
  controlsContainer.appendChild(pageInfo);
}

// // Function to fetch data from Firestore and populate the table
// async function fetchAndPopulateTable() {
//   const accountTable = document.getElementById("accountsTable");

//   // Clear existing rows in the table
//   while (accountTable.rows.length > 1) {
//     accountTable.deleteRow(1);
//   }

//   // Reference to the "Members" collection in Firestore
//   const accountCollection = collection(db, "Accounts");

//   try {
//     const querySnapshot = await getDocs(accountCollection);

//     // Loop through the documents in the collection
//     querySnapshot.forEach((docSnapshot) => {
//       const data = docSnapshot.data();
//       const row = accountTable.insertRow(-1); // Add a new row to the table

//       const typeCell = row.insertCell(0);
//       typeCell.textContent = data.userType;

//       const emailCell = row.insertCell(1);
//       emailCell.textContent = data.email;

//       const nameCell = row.insertCell(2);
//       nameCell.textContent = data.memberName;

//       const contactCell = row.insertCell(3);
//       contactCell.textContent = data.contactNum;

//       const resetCell = row.insertCell(4);
//       const resetButton = document.createElement("button");
//       resetButton.textContent = "Reset Password";
//       resetButton.addEventListener("click", () => {
//         // Call the password reset function with the user's email
//         requestPasswordReset(data.email);
//       });
//       resetCell.appendChild(resetButton);
//     });
//   } catch (error) {
//     console.error("Error fetching data: ", error);
//   }
// }

async function requestPasswordReset(email) {
  try {
    // Send a password reset email
    await sendPasswordResetEmail(auth, email);

    // Display success message to the user
    alert(`Password reset email sent to ${email}. Check your inbox for further instructions.`);
  } catch (error) {
    // Handle errors
    const errorCode = error.code;
    const errorMessage = error.message;

    // Display error message to the user
    alert(`Error sending password reset email: ${errorMessage}`);
    console.error("Error sending password reset email:", errorCode, errorMessage);
  }
}

async function toggleUpdate() {

var formContainer = document.querySelector('.form-container');
        if (formContainer.style.display === 'none' || formContainer.style.display === '') {
            formContainer.style.display = 'flex';
        } else {
            formContainer.style.display = 'none';
            heading.textContent = "Create Account";
            clear();
        }
}

//===================================================================================

submit.addEventListener("click", createAccount);

    
    
