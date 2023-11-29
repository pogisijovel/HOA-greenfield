import {doc, getDoc,getDocs, setDoc,collection, updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast, } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { auth } from "../credentials/firebaseModule.js";

import { accountSid, authToken, twilioPhoneNumber } from '../credentials/twilioCredentials.js';






const viewColCancel = document.getElementById("viewColCancel");
const addB =  document.getElementById("addCollection");
const collectionAdd =  document.getElementById("add");
const cancelB =  document.getElementById("cancel");
const deleteButton = document.getElementById("moveBin");
const editB = document.getElementById("Edit");
const closeB = document.getElementById("close");
const updateB = document.getElementById("updateMember");
const sendBbb = document.getElementById("sendBB");
const sendB =  document.getElementById("send");
const memName =  document.getElementById("memName");
const messageBody = document.getElementById('messageBody').value;
const recipientPhoneNumber = document.getElementById('recipientNumber').value;


let totalFee = 0; 
let lotAmortVal; 
let inputFee;
let penaltyFee;
let firstFee; 
let secondFee;
let currentPage = 1; 
const pageSize = 10; 
let lastVisible = null; 
let firstVisible = null; 

document.addEventListener('DOMContentLoaded', (event) => {
  displayCollection(); 
  createPaginationControls();
  collectionMenu();
  
});
document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    // Check if the pressed key is an arrow key (left, up, right, down)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Prevent the default behavior of arrow keys
      e.preventDefault();
    }
  });
});

// Get the memberID query parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
const Name = urlParams.get("memberName");
//Elements
const statusButton = document.getElementById("statusButton");
console.log(Name);


//================================================================================================================================
let globalDocId;

const membersCollectionRef = collection(db, "Members");
const q = query(membersCollectionRef, where("memberName", "==", Name));

try {
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Assuming you're interested in the first match if there are multiple documents with the same name
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
  
    // Update your HTML elements with the data
    
    document.getElementById("name").value = data.memberName;
    document.getElementById("cont").value = data.contactNum;
    document.getElementById("category").value = data.memberCategory;
    document.getElementById("statusButton").textContent = data.memberStatus;
    document.getElementById("recipientNumber").value = '+63' + data.contactNum.substring(1);
    document.getElementById("balance").value = parseFloat(data.lotAmort).toFixed(2);

    lotAmortVal = parseFloat(data.lotAmort).toFixed(2);

    // ... (any other code that uses the data)

  } else {
    console.log("No such document with the provided name!");
  }
} catch (error) {
  console.error("Error getting document by name:", error);
}


const buttonText = statusButton.textContent.toLowerCase();

if (buttonText === "active") {
  statusButton.style.backgroundColor = "#03AC13";
} else {
  statusButton.style.backgroundColor = "#ff0000"; 
}


  const lotTable = document.getElementById("lotTable");
  const lotTableBody = lotTable.querySelector('tbody');

  // Clear existing rows in the table body
  while (lotTableBody.rows.length > 1) {
    lotTableBody.deleteRow(1);
  }



  const PropertyCollectionRef = collection(db, "Property");
const p = query(PropertyCollectionRef, where("ownerName", "==", Name));

  try {
    const querySnapshot = await getDocs(p);

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      // Create a new row for each document and populate the cells
      const newRow = lotTableBody.insertRow(-1);
      const blockCell = newRow.insertCell(0);
      const lotCell = newRow.insertCell(1);
      const lotSizeCell = newRow.insertCell(2);

      blockCell.textContent = data.lotNumber;
      lotCell.textContent = data.blockNum;
      lotSizeCell.textContent = data.lotSize;
    });

    if (querySnapshot.empty) {


      // Display a message in the first row if no data is found
      const noDataMessage = lotTableBody.insertRow(-1);
      const messageCell = noDataMessage.insertCell(0);
      messageCell.textContent = "No Property Yet";
      messageCell.colSpan = 3; // Span across all columns
    }
  } catch (error) {
    console.error("Error getting documents:", error);
  }


//==================Edit=================================================================================================

async function updateHTMLElements() {
  const w = query(membersCollectionRef, where("memberName", "==", Name));

  try {
    const querySnapshot = await getDocs(w);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref; // Get a reference to the first document
      globalDocId = docRef.id;
      // Assuming you want to update the elements with the first document found
      const data = querySnapshot.docs[0].data();


      document.getElementById('memberName').value = data.memberName || '';
      document.getElementById('spouseName').value = data.spouseName || '';
      document.getElementById('occupation').value = data.occupation || '';
      document.getElementById('age').value = data.age || '';
      document.getElementById('birthday').value = data.birthday || '';
      document.getElementById('civilStatus').value = data.civilStatus || '';
      document.getElementById('citizenship').value = data.citizenship || '';
      document.getElementById('contactNum').value = data.contactNum || '';
      document.getElementById('memberCategory').value = data.memberCategory || '';
      document.getElementById('memberStatus').value = data.memberStatus || '';
      document.getElementById('gender').value = data.gender || '';

      console.log('memberCategory:', data.memberCategory);
      console.log('memberStatus:', data.memberStatus);
      console.log('gender:', data.gender);

    } else {
      console.log("No such document with the provided name!");
    }
  } catch (error) {
    console.error("Error getting documents:", error);
  }
}


  function poppop() {
  var pop = document.querySelector('#popup');
  if (pop.style.display === 'none' || pop.style.display === '') {
    pop.style.display = 'grid';
  } else {
    pop.style.display = 'none';
  }
  } 
//================================================Upadate=================================================================

async function updateMember() {

  if (!globalDocId) {
    console.error("No document ID is set. Please fetch the member details first.");
    return;
  }

  // Check if a document with the same enterID exists
  const docRef = doc(db, "Members", globalDocId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.error("enterID not found. This ID does not exist in the database.");
    return;
  }

  const data = {
    
    memberName: memberName?.value,
    spouseName: spouseName?.value,
    occupation: occupation?.value,
    age: age?.value,
    birthday: birthday?.value,
    civilStatus: civilStatus?.value,
    citizenship: citizenship?.value,
    contactNum: contactNum?.value,
    memberCategory: memberCategory?.value,
    memberStatus: memberStatus?.value,
    gender: gender?.value
  };

  const updateConfirmed = confirm("Please check again before updating this member's information?");
  if (updateConfirmed) {
    // If the user confirmed, proceed with the update
    try {
      await updateDoc(docRef, data); // Update the document using the global document ID
      alert("Updated Successfully");
      location.reload(); // Consider the implications of reloading the page here
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  } else {
    // If the user did not confirm, log it and stop the function
    console.log("Update canceled by the user.");
  }
}

// //===============================================================================================================================================

// Move outside of collectionMenu

function updateTotalFee(totalFee) {
  const totalFeeCell = document.getElementById("totalFee");
  if (totalFeeCell) {
    totalFeeCell.textContent = `Total Fee: $${totalFee.toFixed(2)}`;
  }
}

async function collectionMenu() {

  document.getElementById("memName").value = Name;

  // Clear existing rows in the table, but keep the first row (header)
  while (addColTable.rows.length > 1) {
    addColTable.deleteRow(1);
  }

  // Reference to the "Members" collection in Firestore
  const membersCollection = collection(db, "CollectionCategory");

  try {
    const querySnapshot = await getDocs(membersCollection);

    // Loop through the documents in the collection
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.Status === "Active") {
        const row = addColTable.insertRow(-1); // Add a new row to the table

        // Create and populate table cells for each data field
        const checkboxCell = row.insertCell(0);
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkboxCell.appendChild(checkBox); // Append checkbox to the cell

        const idCell = row.insertCell(1);
        idCell.textContent = data.CollectionID;

        const nameCell = row.insertCell(2);
        nameCell.textContent = data.collectionName;

        const feeCell = row.insertCell(3);

        let feeValue = parseFloat(data.Fee);
        if (isNaN(feeValue)) {
          feeValue = 0; // Set default value for calculation
        }

       
if (data.CollectionID === "001") {
  inputFee = document.createElement("input");
  inputFee.type = "number";
  inputFee.placeholder = "Enter fee";
  inputFee.value = firstFee || ''; // Use the firstFee value holder

  let timeout;

  inputFee.addEventListener("input", (event) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const newFee = parseFloat(event.target.value);
      feeValue = isNaN(newFee) ? 0 : newFee;
      feeCell.textContent = isNaN(newFee) ? "" : newFee.toFixed(2);

      // Update the specific value holder for CollectionID "001"
      firstFee = event.target.value; // Store the input value in firstFee

      // ... (existing code)
    }, 2000);
  });

  feeCell.appendChild(inputFee);
} else if (data.CollectionID === "008") {
  inputFee = document.createElement("input");
  inputFee.type = "number";
  inputFee.placeholder = "Enter fee";
  inputFee.value = secondFee || ''; // Use the secondFee value holder

  let timeout;

  inputFee.addEventListener("input", (event) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const newFee = parseFloat(event.target.value);
      feeValue = isNaN(newFee) ? 0 : newFee;
      feeCell.textContent = isNaN(newFee) ? "" : newFee.toFixed(2);

      // Update the specific value holder for CollectionID "008"
      secondFee = event.target.value; // Store the input value in secondFee

      // ... (existing code)
    }, 2000);
  });

  feeCell.appendChild(inputFee);
} else {
  feeCell.textContent = feeValue.toFixed(2);
}

        checkBox.addEventListener("change", () => {
          if (checkBox.checked) {
            totalFee += feeValue;
          } else {
            totalFee -= feeValue;
          }
          updateTotalFee(totalFee);
        });
      }
    });

    const totalFeeRow = document.createElement("tr");
    const totalFeeCell = document.createElement("td");
    totalFeeCell.textContent = `Total Fee: ₱${totalFee.toFixed(2)}`;
    totalFeeCell.colSpan = 4;
    totalFeeCell.id = "totalFee";
    totalFeeRow.appendChild(totalFeeCell);
    addColTable.appendChild(totalFeeRow);
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}


// //===============================================================================================================================================




// //===============================================================================================================================================

function togglePopup() {
  var addCol = document.querySelector('#addCol');
  if (addCol.style.display === 'none' || addCol.style.display === '') {
      addCol.style.display = 'flex';
  } else {
      addCol.style.display = 'none';
      document.getElementById("tranNum").value = "";
      document.getElementById("memName").value = "";
      document.getElementById("tranDate").value = "";
    collectionMenu();
    cancelCollcetion();
  }
  }
// //===============================================================================================================================================
  function cancelCollcetion() {
    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });

    // Set totalFee to 0
    totalFee = 0;
    
    // Update the "Total Fee" row
    updateTotalFee();
}

// //===============================================================================================================================================
async function addCollection() {

  const buttonText = statusButton.textContent.toLowerCase();
  let currentBal = lotAmortVal;
  if (buttonText != "active") {
    alert("The member is currently INACTIVE");
    return
  }
  
  const checkedRows = Array.from(document.querySelectorAll('#colCat table input[type="checkbox"]:checked'));
  const dataToAdd = {
      TransactionNum: document.getElementById('tranNum').value, 
      Date: document.getElementById('tranDate').value,
      Collector: document.getElementById('collName').value, 
      Member: document.getElementById('memName').value,  
      TotalFee: totalFee,
      lotAmortBal: currentBal,
      Categories: []
  };

  if (checkedRows.length === 0) {
      alert("Select at least 1 collection.");
  } else {
      // Insert data based on checked rows
      checkedRows.forEach((row) => {
          if (row.parentElement.tagName === 'TD') {
              // Exclude the header row
              const cells = row.parentElement.parentElement.cells; // Get the cells from the parent row
              const idCell = cells[1].textContent;
              const nameCell = cells[2].textContent;
              const feeCell = parseFloat(cells[3].textContent);
              dataToAdd.Categories.push({ collectionID: idCell, collectionName: nameCell, collectionFee: feeCell }); // Use the correct field names
          }
      });
      
      const userConfirmed = confirm("Are you sure you want to add this collection?");
      if (userConfirmed) {
      try {
          const transactionRef = doc(db, "CollectionList", dataToAdd.TransactionNum); // Use dataToAdd.TransactionNum
          const snapshot = await getDoc(transactionRef);

          if (snapshot.exists()) {
              alert("Transaction number already exists. Please enter a different number.");
              document.getElementById('tranNum').focus(); // Corrected how to set focus
          } else {
              await setDoc(transactionRef, dataToAdd);
              updateLotAmort();
              alert("Data added successfully");
              
          }
      } catch (error) {
          alert("Error adding data: " + error);
      }

    }else {
        alert("Data addition cancelled by user.");
    }
  }
  
}
//====================================================================================================================================
async function updateLotAmort() {
  const q = query(membersCollectionRef, where("memberName", "==", Name));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Get the first document from the query results
    const docRef = querySnapshot.docs[0].ref;
    globalDocId = docRef.id; // Assign the document ID to the global variable
  } else {
    console.log("No such document with the provided name!");
  }


  // Ensure globalDocId is the ID of the member you wish to update
  if (!globalDocId) {
    console.error("Document ID (globalDocId) is not set.");
    return;
  }

  // Ensure that inputFee is defined and is a number
  if (isNaN(inputFee) || inputFee === "") {
    console.error("Input Fee (inputFee) is not a valid number.");
    return;
  }

  // Reference the document
  const docRef = doc(db, "Members", globalDocId);
  
  try {
    // Get the current document snapshot
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Get the current value and parse it as a float
      const currentLotAmort = parseFloat(docSnap.data().lotAmort);
      console.log(`Current Lot Amortization: ${currentLotAmort}`);

      // Parse the input fee and perform the subtraction
      const parsedInputFee = parseFloat(inputFee);
      console.log(`Input Fee: ${parsedInputFee}`);

      // Subtract the input fee from the current lot amortization
      const newLotAmort = currentLotAmort - parsedInputFee;
      console.log(`New Lot Amortization: ${newLotAmort}`);

      // Update the document
      await updateDoc(docRef, { lotAmort: newLotAmort });
      console.log("Lot amortization updated successfully.");

    } else {
      console.error("Document does not exist.");
    }
  } catch (e) {
    console.error("Error updating lot amortization:", e);
  }
}




// //===============================================================================================================================================


async function displayCollection(next = true) {
  const collectionRef = collection(db, "CollectionList");
  let queryCol;

  // Calculate the maximum number of pages
  const totalDocumentsQuery = query(collectionRef, where("Member", "==", Name));
  const totalDocumentsSnapshot = await getDocs(totalDocumentsQuery);
  const totalDocuments = totalDocumentsSnapshot.size;
  let maxPages = Math.ceil(totalDocuments / pageSize);

  // Define the base query with a page size limit
  if (next && lastVisible && currentPage < maxPages) {
    // If fetching the next page
    queryCol = query(collectionRef, where("Member", "==", Name), orderBy("TransactionNum", "desc"), startAfter(lastVisible), limit(pageSize));
    currentPage++;
  } else if (!next && firstVisible && currentPage > 1) {
    // If fetching the previous page
    queryCol = query(collectionRef, where("Member", "==", Name), orderBy("TransactionNum", "desc"), endBefore(firstVisible), limitToLast(pageSize));
    currentPage--;
  } else {
    // This is the default query for the first page
    queryCol = query(collectionRef, where("Member", "==", Name), orderBy("TransactionNum", "desc"), limit(pageSize));
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
      if (data.Member === Name) {
                const row = bleta.insertRow(-1); // Add a new row to the table
        
                // Populate the row with member information
                const transactionID = row.insertCell(0);
                transactionID.textContent = data.TransactionNum;
        
                const memberName = row.insertCell(1);
                memberName.textContent = data.Member;
        
                const date = row.insertCell(2);
                date.textContent = data.Date;
        
                const amount = row.insertCell(3);
                amount.textContent = data.TotalFee;
        
                const viewCell = row.insertCell(4);
                const viewButton = document.createElement("button");
                viewButton.textContent = "View";
                viewButton.addEventListener("click", () => viewCollection(data));
                viewCell.appendChild(viewButton);
        
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
  nextButton.onclick = () => displayCollection(true);

  // const prevButton = document.createElement("button");
  // prevButton.textContent = "Previous";
  // prevButton.onclick = () => displayCollection(false);

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  let alreadyAutoClicked = false; // Flag to ensure the auto-click only happens once
  
  prevButton.addEventListener('click', function handlePrevButtonClick() {
    displayCollection(false); // Call your function to handle the click
  
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







// //===============================================================================================================================================
// // Function to display the selected data in "viewCollection" HTML

function viewCollection(data) {
  const addCol = document.querySelector('#viewCollection');
  if (addCol.style.display === 'none' || addCol.style.display === '') {
    addCol.style.display = 'block';

    // Populate the HTML elements with data
    document.getElementById('cdTransactionNumber').value = data.TransactionNum;
    document.getElementById('cdMemberID').value = data.MemberID;
    document.getElementById('cdMemberName').value = data.Member;
    document.getElementById('cdCollectorName').value = data.Collector;
    document.getElementById('cdTranDate').value = data.Date;
    document.getElementById('bal').value = data.lotAmortBal;
    // Clear the table
    const table = document.getElementById('cdTable');
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }

    // Populate the table with collection data
    data.Categories.forEach((category) => {
      const row = table.insertRow(-1);
      const collectionIDCell = row.insertCell(0);
      const collectionNameCell = row.insertCell(1);
      const feeCell = row.insertCell(2);

      collectionIDCell.textContent = category.collectionID;
      collectionNameCell.textContent = category.collectionName;
      feeCell.textContent = category.collectionFee;
    });

    // Add a new row at the very end of the table with the value of data.TotalFee
    const newRow = table.insertRow(-1);
    const totalFeeCell = newRow.insertCell(0);
    totalFeeCell.colSpan = 3; // Span the cell across all columns
    totalFeeCell.textContent = `Total Fee: ${data.TotalFee}`;






  } else {
    addCol.style.display = 'none';
  }
}



// //===============================================================================================================================================

viewColCancel.addEventListener("click", () => {
  var addCol = document.querySelector('#viewCollection');
  addCol.style.display = 'none';
});






// //===============================================================================================================================================




function toggleButton() {
  var button = document.getElementById("smsForm");
  


  button.style.display = (button.style.display === "block") ? "none" : "block";
}


// //===============================================================================================================================================








function sendSMS() {
 
  
  
  const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  try {
  
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioPhoneNumber,
        To: recipientPhoneNumber,
        Body: messageBody,
      }),
    })
      .then(response => response.json())
      .then(data => console.log(data.sid))
      .catch(error => console.error(error));
    
    toggleButton();
  } catch (error) {
      console.error('An unexpected error occurred:', error);
      alert('An unexpected error occurred. Please check the console for details.');
  }
  
}



async function sendNoticeSMS() {
  // Format the contact number to "+639959831815" format
  // const formattedPhoneNumber = `+63${contactNumber.substring(1)}`;


  // Replace with your Twilio Account SID, Auth Token, and Twilio phone number
  const accountSid = 'ACe50e033216d90c3030623d808fbcdc48';
  const authToken = '422c0436abd710008976da59fcca53cb';
  const twilioNumber = '+15097132957';

  // Twilio API endpoint
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  // Create the Authorization header
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${accountSid}:${authToken}`));
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  // Create the request body
  const params = new URLSearchParams();
  params.append('To', recipientPhoneNumber);
  params.append('From', twilioNumber);
  params.append('Body', messageBody);

  try {
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: params,
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('SMS sent successfully:', responseData);
    } else {
      const errorData = await response.json();
      console.error('Error sending SMS:', errorData);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

collectionAdd.addEventListener("click", addCollection);
addB.addEventListener("click", togglePopup);
cancelB.addEventListener("click", togglePopup);
closeB.addEventListener("click", poppop);
updateB.addEventListener("click", updateMember);
sendBbb.addEventListener("click", toggleButton);
sendB.addEventListener("click", sendNoticeSMS);
editB.addEventListener("click", () => {
  updateHTMLElements();
  poppop();
});