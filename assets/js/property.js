import {doc,getDocs, updateDoc,collection, query, where ,orderBy, limit, startAfter, endBefore, limitToLast, addDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
//Elements
let accountID = document.getElementById("accountID");
let ownerName = document.getElementById("ownerName");
let lotNumber = document.getElementById("lotNumber");
let blockNum = document.getElementById("blockNum");
let lotSize = document.getElementById("lotSize");
let propertyStatus = document.getElementById("propertyStatus");
let lastVisible; 
let firstVisible;
let currentPage = 1;
let popupownerName = document.getElementById("popupownerName");
let popuplotNum = document.getElementById("popuplotNum");
let popupblockNum = document.getElementById("popupblockNum");
let popuplotSize = document.getElementById("popuplotSize");
let popuppropertyStatus = document.getElementById("popuppropertyStatus");
const propertyTable = document.getElementById("table");
const propertyCollection = collection(db, "Property");
const memberRef = collection(db, "Members");
const insert = document.getElementById("insert");
const editB = document.getElementById("Edit");
const updateB = document.getElementById("updateB");
const Property = collection(db, "Property");
const accountIDInput = document.getElementById("accountID");
const popupAccountID = document.getElementById("popupAccountID");
  document.addEventListener('DOMContentLoaded', (event) => {
    createPaginationControls();
    fetchAndPopulateTable();
    names();
    accountIDs();
  });
  document.querySelectorAll('input[type="number"]').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    });
  });
  
//==========================AddProperty============================================================
async function names(){
  const datalist = document.getElementById("names");
  getDocs(memberRef).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const memberName = doc.data().memberName;
      const option = document.createElement("option");
      option.value = memberName;
      datalist.appendChild(option);
    });
  });
  }
  async function accountIDs(){
    const datalist = document.getElementById("ids");
    getDocs(memberRef).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const accountID = doc.data().accountID;
        const option = document.createElement("option");
        option.value = accountID;
        datalist.appendChild(option);
      });
    });
    }
      accountIDInput.addEventListener("change", async function () {
        const selectedAccountID = accountIDInput.value;
      
        if (selectedAccountID) {
          const q = query(memberRef, where("accountID", "==", selectedAccountID));
          const querySnapshot = await getDocs(q);
      
          if (!querySnapshot.empty) {
            // Assuming you want to retrieve the memberName property from the first document
            const data = querySnapshot.docs[0].data();
            const ownerNameInput = document.getElementById("ownerName");
      
            // Assuming your document structure has a property 'memberName'
            ownerNameInput.value = data.memberName;
          } else {
            // Handle the case where no matching document is found
            console.log("No matching document found for the given accountID");
          }
        }
      });
    
    popupAccountID.addEventListener("change", async function () {
      const selectedAccountID = popupAccountID.value;
    
      if (selectedAccountID) {
        const q = query(memberRef, where("accountID", "==", selectedAccountID));
        const querySnapshot = await getDocs(q);
    
        if (!querySnapshot.empty) {
          // Assuming you want to retrieve the memberName property from the first document
          const data = querySnapshot.docs[0].data();
          const ownerNameInput = document.getElementById("popupownerName");
    
          // Assuming your document structure has a property 'memberName'
          ownerNameInput.value = data.memberName;
        } else {
          // Handle the case where no matching document is found
          console.log("No matching document found for the given accountID");
        }
      }
    });


  async function queryName() {
    const q = query(memberRef, where("memberName", "==", ownerName.value));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return docSnap.id; // Return the document ID
      } else {
        console.log("No such document with the provided name!");
        return null;
      }
    } catch (error) {
      console.error("Error getting document by name:", error);
      return null;
    }
  }
//=============================================================================================================================
// async function addProperty() {
//   let lotNumberVal = lotNumber.value;
//   let blockNumVal = blockNum?.value;
//   let lotSizeVal = lotSize?.value;
//   let propertyStatusVal = propertyStatus?.value;
//   let Name = ownerName?.value;
//   const lotNumberQuery = query(Property, where('lotNumber', '==', lotNumberVal));
//   const existingLotNumberSnapshot = await getDocs(lotNumberQuery);
// if (!existingLotNumberSnapshot.empty) {
//   alert("Lot number already exists. Please choose a different lot number.");
//   return;
// }
// if(!lotNumberVal || !blockNumVal || !lotSizeVal || !propertyStatusVal){
//   alert("Please fill all the information needed.");
//   return
// }
//   if (!Name) {
//     let data = {
//       ownerName: " ",
//       lotNumber: lotNumberVal,
//       blockNum: blockNumVal,
//       lotSize: lotSizeVal,
//       propertyStatus: propertyStatusVal,
//     };
//     try {
//       if(propertyStatusVal != "Vacant"){
//         alert("The property should be Vacant");
//         return
//       }
//       const docRef = await addDoc(Property, data);
//       alert("Property added successfully.");
//       fetchAndPopulateTable();
//     } catch (e) {
//       alert.error("Error adding property: ", e);
//     }
//   } else {
//     const ownerIdRef = await queryName();
//     if (!ownerIdRef) {
//       console.log("Owner ID not found. Cannot add property.");
//       return;
//     }
//     console.log(ownerIdRef);
//     try {
//       const data = {
//         ownerRef: ownerIdRef,
//         lotNumber: lotNumberVal,
//         ownerName: Name,
//         blockNum: blockNumVal,
//         lotSize: lotSizeVal,
//         propertyStatus: propertyStatusVal,
//       };
//       try {
//         const docRef = await addDoc(Property, data); 
//         alert("Property added successfully.");
//         fetchAndPopulateTable();
//       } catch (e) {
//         console.error("Error adding document: ", e);
//       }
//     } catch (error) {
//       console.error("Error checking owner ID in Members: ", error);
//     }
//   }
// }
async function addProperty() {
  
  let accountIDVal = accountID.value;
  let lotNumberVal = lotNumber.value;
  let blockNumVal = blockNum?.value;
  let lotSizeVal = lotSize?.value;
  let propertyStatusVal = propertyStatus?.value;
  let Name = ownerName?.value;

  const existingOwnerNameQuery = query(Property, where('lotNumber', '==', lotNumberVal), where('ownerName', '==', Name));
  const existingOwnerNameSnapshot = await getDocs(existingOwnerNameQuery);
  
  // Query to check if the lot number exists
  const existingLotNumberQuery = query(Property, where('lotNumber', '==', lotNumberVal));
  const existingLotNumberSnapshot = await getDocs(existingLotNumberQuery);
  
  // Check if required information is filled
  if (!lotNumberVal || !blockNumVal || !lotSizeVal || !propertyStatusVal) {
    alert("Please fill in all the required information.");
    return;
  }

  // If the lot number exists
  if (!existingLotNumberSnapshot.empty) {
    if (propertyStatusVal !== "Rented") {
      alert("The property status should be 'Rented' somebody owned this lot number.");
      return;
    }
  
    // Get the data from the main property document
    const data = existingLotNumberSnapshot.docs[0].data();
  
    // Check if the owner name already exists for the same lot number
    if (!existingOwnerNameSnapshot.empty) {
      alert("Renter name already exists for the same lot number. Please choose a different renter name.");
      return;
    }
  
    // Check if the property already has an owner with the same name
    if (data.ownerName === Name && data.propertyStatus === "Owned") {
      alert("The property cannot have two owners with the same name.");
      return;
    }

    if (!Name) {
      alert("Please provide the renter's name for an existing lot number.");
      return;
    }
  }
    // Check if the renter's name is provided
  if (!Name && propertyStatusVal == "Owned") {
    alert("Please provide the owners's name for an owned lot number.");
    return;
  }

  if (!Name) {
    // Adding a property without a renter's name
    let data = {
      accountID: " ",
      ownerName: " ",
      lotNumber: lotNumberVal,
      blockNum: blockNumVal,
      lotSize: lotSizeVal,
      propertyStatus: propertyStatusVal,
    };

    try {
      const docRef = await addDoc(Property, data);
      alert("Property added successfully.");
      fetchAndPopulateTable();
    } catch (e) {
      console.error("Error adding property: ", e);
    }
  } else {
    // Adding a property with a renter's name
    const ownerIdRef = await queryName();
    if (!ownerIdRef) {
      console.log("Owner ID not found. Cannot add property.");
      return;
    }

    console.log(ownerIdRef);

    try {
      const data = {
        accountID: accountIDVal,
        ownerRef: ownerIdRef,
        lotNumber: lotNumberVal,
        ownerName: Name,
        blockNum: blockNumVal,
        lotSize: lotSizeVal,
        propertyStatus: propertyStatusVal,
      };

      try {
        const docRef = await addDoc(Property, data);
        alert("Property added successfully.");
        fetchAndPopulateTable();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } catch (error) {
      console.error("Error checking owner ID in Members: ", error);
    }
  }
}


//==========================Update============================================================
async function updateProperty() {
  const accointID = accountIDInput.value;
  const lotNum = popuplotNum?.value;
  const owner = popupownerName?.value;
  const stat = popuppropertyStatus?.value;
  const propertyCollection = collection(db, "Property");
  const querySnapshot = await getDocs(query(propertyCollection, where('lotNumber', '==', lotNum)));
  if (owner && stat === "Vacant") {
    alert('Cannot set property as Vacant if there is an owner');
    return;
  }
  if (!owner && stat === "Owned") {
    alert('Cannot set property as Owned if there is no owner');
    return;
  }
  if (!owner && stat === "Rented") {
    alert('Cannot set property as Rented if there is no renter');
    return;
  }
  try {
    if (querySnapshot.empty) {
      throw new Error('No document found with the provided lot number');
    }
    const docRef = querySnapshot.docs[0].ref;
    const data = {
      accountID: accointID,
      ownerName: popupownerName?.value,
      lotNumber: popuplotNum?.value,
      blockNum: popupblockNum?.value,
      lotSize: popuplotSize?.value,
      propertyStatus: popuppropertyStatus?.value
    };
    await updateDoc(docRef, data);
    togglePopup();
    fetchAndPopulateTable();
    alert('Updated successfully');
  } catch (error) {
    console.error('Error updating document:', error.message);
    alert('Error updating document: ' + error.message);
  }
}
//==========================Table============================================================
document.getElementById('sad').addEventListener('change', function() {
  fetchAndPopulateTable();
});
async function fetchAndPopulateTable(next = true) {
  firstVisible = null;
  lastVisible = null;
  let block = document.getElementById("sad")?.value; 
  const pageSize = 20;
  const totalDocumentsQuery = query(propertyCollection);
  const totalDocumentsSnapshot = await getDocs(totalDocumentsQuery);
  const totalDocuments = totalDocumentsSnapshot.size;
  while (propertyTable.rows.length > 1) {
    propertyTable.deleteRow(1);
  }
let maxPages = Math.ceil(totalDocuments / pageSize);
let queryMem;
if (next && lastVisible && currentPage < maxPages) {
  queryMem = query(propertyCollection, orderBy("blockNum"), startAfter(lastVisible), limit(pageSize));
  currentPage++;
} else if (!next && firstVisible && currentPage > 1) {
  queryMem = query(propertyCollection, orderBy("blockNum"), endBefore(firstVisible), limitToLast(pageSize));
  currentPage--;
} else {
  queryMem = query(propertyCollection, orderBy("blockNum"), limit(pageSize));
  currentPage = 1;
}
  try {
    const querySnapshot = await getDocs(queryMem);
    const documentSnapshots = querySnapshot.docs;
    firstVisible = documentSnapshots[0];
    lastVisible = documentSnapshots[documentSnapshots.length - 1];
    documentSnapshots.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const row = propertyTable.insertRow(-1);
      const num = 1;
      if( block == data.blockNum){
        const nameCell = row.insertCell(0);
        nameCell.textContent = data.ownerName;
        const categoryCell = row.insertCell(1);
        categoryCell.textContent = data.lotNumber;
        const blockCell = row.insertCell(2);
        blockCell.textContent = data.blockNum;
        const sizeCell = row.insertCell(3);
        sizeCell.textContent = data.lotSize;
        const statusCell = row.insertCell(4);
        statusCell.textContent = data.propertyStatus;
        const viewCell = row.insertCell(5);
        const viewButton = document.createElement("button");
        viewButton.textContent = "View Property";
        viewButton.addEventListener("click", () => {
          fillPopupWithData(data);
        });
        viewCell.appendChild(viewButton);
      }
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
  updatePageDisplay(currentPage, maxPages);
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
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.onclick = () => fetchAndPopulateTable(false);
  const controlsContainer = document.getElementById('paginationControls');
  controlsContainer.appendChild(prevButton);
  controlsContainer.appendChild(nextButton);
  const pageInfo = document.createElement('div');
  pageInfo.id = 'pageInfo';
  pageInfo.textContent = 'Page 1 / 1';
  controlsContainer.appendChild(pageInfo);
}
//===================================Search Bar==============================================
document.getElementById('find').addEventListener('click',queryPropertyByLotNumber );
async function queryPropertyByLotNumber() {
  let lotnam = document.getElementById('searchInput')?.value;
  const propertyCollection = collection(db, "Property");
  const querySnapshot = await getDocs(query(propertyCollection, where('lotNumber', '==', lotnam)));
  if (querySnapshot.empty) {
    alert('No matching Lot Number found');
    return;
  }
  const data = querySnapshot.docs[0].data();
  findPopup(data);
}
//====================================popup==================================================
function findPopup(data) {
  document.getElementById("popupAccountID").value = data.accountID,
  document.getElementById("popupownerName").value = data.ownerName;
  document.getElementById("popuplotNum").value = data.lotNumber;
  document.getElementById("popupblockNum").value = data.blockNum;
  document.getElementById("popuplotSize").value = data.lotSize;
  document.getElementById("popuppropertyStatus").value = data.propertyStatus;
  togglePopup();
}
function fillPopupWithData(data) {
  document.getElementById("popupAccountID").value = data.accountID;
  document.getElementById("popupownerName").value = data.ownerName;
  document.getElementById("popuplotNum").value = data.lotNumber;
  document.getElementById("popupblockNum").value = data.blockNum;
  document.getElementById("popuplotSize").value = data.lotSize;
  document.getElementById("popuppropertyStatus").value = data.propertyStatus;
  togglePopup();
}
//===========================================================================
function enableInputFields() {
  var editableFields = document.querySelectorAll('#popupownerName, #popuppropertyStatus, #popupAccountID');
  for (var i = 0; i < editableFields.length; i++) {
    editableFields[i].removeAttribute('disabled');
  }
  var updateButton = document.querySelector('#updateB');
  updateButton.style.display = 'block';
}
function disableInputFields() {
  var inputFields = document.querySelectorAll('.popup input, .popup select');
  for (var i = 0; i < inputFields.length; i++) {
    inputFields[i].setAttribute('disabled', 'disabled');
  }
  var saveButton = document.querySelector('.save-btn');
  saveButton.style.display = 'none';
}
insert.addEventListener("click", addProperty);
editB.addEventListener("click", enableInputFields);
updateB.addEventListener("click", updateProperty);
function closePopup() {
  var popup = document.querySelector('.popup');
  popup.style.display = 'none';
  disableInputFields();
}
var closeButton = document.querySelector('.close-btn');
closeButton.addEventListener('click', closePopup);
document.getElementById('addProp').addEventListener('click', () => {
  toggleaddProp();
});
document.getElementById('clB').addEventListener('click', () => {
  toggleaddProp();
});
function toggleaddProp() {
  var popup = document.querySelector('.form-container');
  if (popup.style.display === 'none' || popup.style.display === '') {
    popup.style.display = 'flex';
    
  } else {
    popup.style.display = 'none';
    document.getElementById('addProp').textContent = "Add Property";
  }
}
