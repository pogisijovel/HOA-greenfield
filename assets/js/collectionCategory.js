
import { doc, getDoc,getDocs, setDoc,collection,updateDoc} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db } from "../credentials/firebaseModule.js";

let CollectionID = document.getElementById("CollectionID");
let collectionName = document.getElementById("collectionName");
let Due = document.getElementById("due");
let Fee = document.getElementById("Fee");
let Status = document.getElementById("Status");

let popCollectionID = document.getElementById("popCollectionID");
let popcollectionName = document.getElementById("popcollectionName");
let popDescription = document.getElementById("popDescription");
let popFee = document.getElementById("popFee");
let popStatus = document.getElementById("popStatus");


const addB = document.getElementById("add");
const closeB = document.getElementById("close");
const remove = document.getElementById("remove");

const memberTable = document.getElementById("bleta");
//=======================add===========================================

document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    // Check if the pressed key is an arrow key (left, up, right, down)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Prevent the default behavior of arrow keys
      e.preventDefault();
    }
  });
});

async function addCategory() {
    const enteredColID = CollectionID?.value;
    
    // Check if enterID is empty or undefined
    if (!enteredColID || !collectionName.value || !Due.value || !Fee.value || !Status.value) {
      alert("Fill all the data before adding new Category.");
      return;
    }
  
    // Check if a document with the same enterID exists
    const docRef = doc(db, "CollectionCategory", enteredColID);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      alert("This ID already existed");
      return;
    }
  
    const data = {
        CollectionID: CollectionID?.value,
        collectionName: collectionName?.value,
        Due: Due?.value,
        Fee: Fee?.value,
        Status: Status?.value
    };
  
    try {
      await setDoc(docRef, data);
      alert("Added Successfully");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    fetchAndPopulateTable();
  }


//==============================================Table======================
// Function to fetch data from Firestore and populate the table
async function fetchAndPopulateTable() {
    
  
    // Clear existing rows in the table
    while (memberTable.rows.length > 1) {
      memberTable.deleteRow(1);
    }
  
    // Reference to the "Members" collection in Firestore
    const membersCollection = collection(db, "CollectionCategory");
  
    try {
      const querySnapshot = await getDocs(membersCollection);
  
      // Loop through the documents in the collection
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const row = memberTable.insertRow(-1); // Add a new row to the table
  
        // Populate the row with member information
        const idCell = row.insertCell(0);
        idCell.textContent = data.CollectionID;
  
        const nameCell = row.insertCell(1);
        nameCell.textContent = data.collectionName;
  
        const feeCell = row.insertCell(2);
        feeCell.textContent = data.Fee;

        const statusCell = row.insertCell(3);
        statusCell.textContent = data.Status;
  
        const viewCell = row.insertCell(4);
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => fillPopupWithData(data));
        
        viewCell.appendChild(viewButton);
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  
  // Call the fetchAndPopulateTable function when the page loads
  fetchAndPopulateTable();

  //===================popup=================================
  function fillPopupWithData(data) {
    document.getElementById("popCollectionID").value = data.CollectionID;
    document.getElementById("popcollectionName").value = data.collectionName;
    document.getElementById("popDue").value = data.Due;
    document.getElementById("popFee").value = data.Fee;
    document.getElementById("popStatus").value = data.Status;
    

    // Show the popup
    togglePopup();
  }

// Function to show/hide the popup
function togglePopup() {
    var popup = document.querySelector('.popup');
    if (popup.style.display === 'none' || popup.style.display === '') {
        popup.style.display = 'block';
    } else {
        popup.style.display = 'none';
    }
    }

    // Function to hide the popup when clicking the close button
    function closePopup() {
    var popup = document.querySelector('.popup');
    popup.style.display = 'none';
    }

    // Attach an event listener to the close button
    var closeButton = document.querySelector('.close-btn');
    closeButton.addEventListener('click', closePopup);

  //================ edit collection======================

  function enableEdit() {
    // Disable the "Edit" button to prevent further edits
    document.getElementById("edit").setAttribute("disabled", "disabled");

    // Call the disableFields function to disable specific input fields
    disableFields(["popCollectionID", "popcollectionName", "popFee"]);

    document.getElementById("popDue").removeAttribute("disabled");
    document.getElementById("popStatus").removeAttribute("disabled");

    var saveButton = document.getElementById("save");
    saveButton.removeAttribute("disabled");
}

function disableFields(idsToDisable) {
    // Loop through the provided IDs and set the "disabled" attribute
    idsToDisable.forEach(function(id) {
        var inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.setAttribute("disabled", "disabled");
        }
    });

    // Enable the "Edit" button
    document.getElementById("edit").removeAttribute("disabled");
}

// Call the disableFields function initially to ensure fields are disabled on page load
disableFields(["popCollectionID", "popcollectionName", "popFee"]);

// Optionally, you can enable the "Description" and "Status" fields on page load if needed



async function updateCAtegory() {


  // Check if a document with the same enterID exists
  const docRef = doc(db, "CollectionCategory", popCollectionID?.value);
  const docSnap = await getDoc(docRef);

  const data = {
    CollectionID: popCollectionID?.value,
    collectionName: popcollectionName?.value,
    Description: popDescription?.value,
    Fee: popFee?.value,
    Status: popStatus?.value
  };

  if (docSnap.exists()) {
      // If the document exists, update it
      try {
          await updateDoc(docRef, data);
          alert("Updated Successfully");

          togglePopup();
          disableFields();
          disableSaveButtonEnableEditButton();
      } catch (e) {
          console.error("Error updating document: ", e);
      }
  } else {
      // If the document does not exist, add a new one
      try {
          await setDoc(docRef, data);
          alert("Added Successfully");
      } catch (e) {
          console.error("Error adding document: ", e);
      }
  }

  fetchAndPopulateTable();
}

function disableSaveButtonEnableEditButton() {
  var editButton = document.getElementById("edit");
  var saveButton = document.getElementById("save");
  
  // Enable the "Edit" button
  editButton.removeAttribute("disabled");
  
  // Disable the "Save" button
  saveButton.setAttribute("disabled", "disabled");
}


document.getElementById("edit").addEventListener("click", enableEdit);
document.getElementById("save").addEventListener("click", updateCAtegory);
addB.addEventListener("click", addCategory);
closeB.addEventListener("click", closePopup);
  