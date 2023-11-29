import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { doc, getDoc,getDocs, setDoc,collection, updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast,} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db, auth } from "../credentials/firebaseModule.js";



const viewColCancel = document.getElementById("viewColCancel");
const cancelB = document.getElementById("cancel");
const eventB = document.getElementById("sendBB");
const logoutB = document.getElementById("logout");
const statusButton = document.getElementById("statusButton");
let currentPage = 1; 
const pageSize = 10; 
let lastVisible = null; 
let firstVisible = null; 

// Get the memberID query parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
const Name = urlParams.get("memberName");

document.addEventListener('DOMContentLoaded', (event) => {
  displayCollection(); 
  createPaginationControls();
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

// Add the onAuthStateChanged event listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // User is not authenticated, redirect to the login page
    redirectToLogin();
  }
  // If the user is authenticated, you can add any necessary logic here.
  // You may want to fetch and display user-specific data, etc.
});

// Define a logout function
const logout = async () => {
  const url = "http://127.0.0.1:5500/index.html";
  await signOut(auth);
  window.location.href = url;
};

// Define a redirectToLogin function
function redirectToLogin() {
  const url = "http://127.0.0.1:5500/index.html";
  signOut(auth); // Sign out the user
  window.location.href = url;
}





//==================member=======================================

   
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


//===============================================================================================================================================



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

//===============================================================================================================================================
// Function to display the selected data in "viewCollection" HTML

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


//===============================================================================================================================================



//===============================================================================================================================================

viewColCancel.addEventListener("click", () => {
  var addCol = document.querySelector('#viewCollection');
  addCol.style.display = 'none';
});


logoutB.addEventListener("click", logout);

eventB.addEventListener("click", () => {
  
    const pagePath = "newReservation.html";
    window.open(pagePath, '_blank');
});








