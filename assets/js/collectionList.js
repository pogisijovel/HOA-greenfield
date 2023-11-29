
import { doc, getDoc,getDocs, setDoc,collection,updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast   } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db } from "../credentials/firebaseModule.js";


let memID = document.getElementById("memID");

const add = document.getElementById("add");
const cancel = document.getElementById("cancel");
const popupMenu = document.getElementById("popupMenu");
const viewColCancel = document.getElementById("viewColCancel");
// const deleteButton = document.getElementById("moveBin");

let totalFee = 0; 
let inputFee = 0;
let lotAmortVal;
let firstFee; 
let secondFee;

let currentPage = 1; 
const pageSize = 10; 
let lastVisible = null; 
let firstVisible = null; 
let collection001Value;
let collection008Value;

document.addEventListener('DOMContentLoaded', (event) => {
  displayCollection();
  collectionMenu();
  createPaginationControls();
});

function togglePopup() {
  var addCol = document.querySelector('#addCol');
  if (addCol.style.display === 'none' || addCol.style.display === '') {
      addCol.style.display = 'block';
  } else {
  
      addCol.style.display = 'none';
  }
  }
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

function updateTotalFee() {
  const totalFeeCell = document.getElementById("totalFee");
  if (totalFeeCell) {
      totalFeeCell.textContent = `Total Fee: $${totalFee.toFixed(2)}`;
  }
}


async function updateLotAmort() {
  const name = document.getElementById('memName').value;

  if (!name) {
      alert("Please provide a member name.");
      return;
  }

  let parsedLotAmortVal = parseFloat(lotAmortVal);
  let parsedInputFee = parseFloat(firstFee);

  let subResult = parsedLotAmortVal - parsedInputFee;

  // Check if a document with the same enterID exists
  const querySnapshot = await getDocs(query(collection(db, 'Members'), where('memberName', '==', name)));

  querySnapshot.forEach(async (doc) => {
      const data = {
          lotAmort: subResult
      };

      try {
          await updateDoc(doc.ref, data); // Using doc.ref to access the document reference
          console.log(subResult);
          location.reload();
      } catch (e) {
          alert("Error updating document: " + e);
      }
  });
}



async function collectionMenu() {


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
    });

    const totalFeeRow = document.createElement("tr");
    const totalFeeCell = document.createElement("td");
    totalFeeCell.textContent = `Total Fee: $${totalFee.toFixed(2)}`;
    totalFeeCell.colSpan = 4;
    totalFeeCell.id = "totalFee";
    totalFeeRow.appendChild(totalFeeCell);
    addColTable.appendChild(totalFeeRow);
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}






//================================================================================================================
async function displayCollection(next = true) {
  const bleta = document.getElementById('trans');
  const collectionRef = collection(db, "CollectionList");
  let queryCol;

  // Calculate the maximum number of pages
  const totalDocumentsSnapshot = await getDocs(collectionRef);
  const totalDocuments = totalDocumentsSnapshot.size;
  let maxPages = Math.ceil(totalDocuments / pageSize);

  // Define the base query with a page size limit
  if (next && lastVisible && currentPage < maxPages) {
    // If fetching the next page
    queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), startAfter(lastVisible), limit(pageSize));
    currentPage++;
  } else if (!next && firstVisible && currentPage > 1) {
    // If fetching the previous page
    queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), endBefore(firstVisible), limitToLast(pageSize));
    currentPage--;
  } else {
    // This is the default query for the first page
    queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), limit(pageSize));
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
      const row = bleta.insertRow(-1); // Add a new row to the table
      
      // ... populate the row with data ...
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
    });

    updatePageDisplay(currentPage, maxPages); // Update the page display
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
  filterTable();
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



function closePopup() {
  var addCol = document.querySelector('#addCol');
  addCol.style.display = 'none';

  document.getElementById("tranNum").value = "";
  document.getElementById("memName").value = "";
  document.getElementById("tranDate").value = "";
firstFee = " ";
secondFee = " ";
collectionMenu();
  cancelCollcetion();
}
  




//=================add Collection=========================================

async function addCollection() {

  if (
    !document.getElementById('tranNum').value ||
    !document.getElementById('tranDate').value ||
    !document.getElementById('collName').value ||
    !document.getElementById('memName').value
      ){
          alert("Fields are empty. Please fill in all required fields.");
          return;
        }


  

  const querySnapshot = await getDocs(query(collection(db, 'Members'), where('memberName', '==', document.getElementById('memName').value)));
 
  querySnapshot.forEach((doc) => {
      const memberData = doc.data();
      const memberStatus = memberData.memberStatus.toLowerCase();
       lotAmortVal = memberData.lotAmort;
  
      if ( memberStatus !== "active") {
          alert("The member is currently INACTIVE");
          return;
      }
  });
  
  if (querySnapshot.empty) {
      alert("Member not found");
  }
  
  const checkedRows = Array.from(document.querySelectorAll('#colCat table input[type="checkbox"]:checked'));
  const dataToAdd = {
      TransactionNum: document.getElementById('tranNum').value, 
      Date: document.getElementById('tranDate').value,
      Collector: document.getElementById('collName').value, 
      Member: document.getElementById('memName').value,  
      TotalFee: totalFee,
      lotAmortBal: lotAmortVal,
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







//===============================display member Name=============================================

//=================================display Collection List========================================================
// Function to fetch data from Firestore and populate the table

  
  //===============================Search Bar======================================================

function filterTable() {
    const searchInput = document.getElementById("searchBar").value.trim().toLowerCase();
    const memberTable = document.getElementById("trans");
    const rows = memberTable.getElementsByTagName("tr");
  
    for (let i = 1; i < rows.length; i++) {
      const nameCell = rows[i].getElementsByTagName("td")[1];
      if (nameCell) {
        const name = nameCell.textContent.toLowerCase();
        if (name.includes(searchInput)) {
          rows[i].style.display = ""; 
        } else {
          rows[i].style.display = "none";
        }
      }
    }
  }

  // Add an event listener to the search input field
  const searchInput = document.getElementById("searchBar");
  searchInput.addEventListener("input", filterTable);
  // Call the filterTable function when the page loads
  document.addEventListener("DOMContentLoaded", filterTable);

//================================View Collection==================================================================
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

        // Add a click event listener to the delete button
        // deleteButton.addEventListener("click", () => transferDataToRecyCollection(data));
    }else{
        addCol.style.display = 'none';
    }
}

//==================================tranfer RecyCOllection========================================


  


  

cancel.addEventListener("click", () => {
  closePopup();
console.log(collection001Value);
    console.log(collection008Value);
   

  // collection001Value = ''; 
  // collection008Value = '';


  // collectionMenu();
});



popupMenu.addEventListener("click", togglePopup);
add.addEventListener("click", addCollection);
viewColCancel.addEventListener("click", () => {
    var addCol = document.querySelector('#viewCollection');
    addCol.style.display = 'none';
});

// deleteButton.addEventListener("click", () => {
//     var addCol = document.querySelector('#viewCollection');
//     addCol.style.display = 'none';
// });