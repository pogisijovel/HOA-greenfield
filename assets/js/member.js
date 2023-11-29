
import {doc,getDocs, setDoc,collection, query, where ,orderBy, limit, startAfter, endBefore, limitToLast, addDoc  } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db } from "../credentials/firebaseModule.js";
//Elements

// Create a reference to the collection where members are stored


let memberName = document.getElementById("memberName");
let spouseName = document.getElementById("spouseName");
let occupation = document.getElementById("occupation");
let age = document.getElementById("age");
let birthday = document.getElementById("birthday");
let civilStatus = document.getElementById("civilStatus");
let citizenship = document.getElementById("citizenship");
let contactNum = document.getElementById("contactNum");
let memberCategory = document.getElementById("memberCategory");
let memberStatus = document.getElementById("memberStatus");
let gender = document.getElementById("gender");
let balance = document.getElementById("bal"); 


let lastVisible; 
let firstVisible;
let currentPage = 1;
let totalDocuments; 
//Buttons

const addData = document.getElementById("addMember");
const update = document.getElementById("updateMember");
const clear = document.getElementById("clear");


document.addEventListener('DOMContentLoaded', (event) => {
  createPaginationControls();
  fetchAndPopulateTable();
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

//========================add Member==============================================



async function addMember() {
  const membersRef = collection(db, "Members");

    const enteredmemberName = memberName?.value;
    const enteredspouseName = spouseName?.value;
    const enteredoccupation = occupation?.value;
    
    const enteredage = age?.value;
    const enteredbirthday = birthday?.value;
    const enteredcivilStatus = civilStatus?.value;
    const enteredcitizenship = citizenship?.value;
    const enteredcontactNum = contactNum?.value;
    
    const enteredmemberCategory = memberCategory?.value;
    const enteredmemberStatus = memberStatus?.value;
    const enteredgender = gender?.value;
    const enteredbalance = balance?.value;
  
    // Check if enterID is empty or undefined
    if (!enteredmemberName || !enteredspouseName  || !enteredoccupation||
        !enteredage       || !enteredbirthday   || !enteredcivilStatus || !enteredcitizenship || !enteredcontactNum || !enteredmemberCategory || !enteredmemberStatus || !enteredgender || !enteredbalance) {
      alert("Please fill all the information.");
      return;
    }

// Create a query against the collection for the memberNameValue
const queryRef = query(membersRef, where("memberName", "==", memberName?.value));

// Execute the query
const querySnapshot = await getDocs(queryRef);

if (!querySnapshot.empty) {
  // Handle the case where the memberName already exists in the Members collection
  alert("This member name already exists");
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
    gender: gender?.value,
    lotAmort: balance?.value
  };


  const updateConfirmed = confirm("Please check again before adding this member's information.");
  if (updateConfirmed) {
  try {
    const docRef = await addDoc(collection(db, "Members"), data);

    // Firestore now automatically generates an ID, which you can access if needed
    console.log("Document written with ID: ", docRef.id);

    alert("Added Successfully");
      fetchAndPopulateTable();
      clearFields();
  } catch (e) {
    alert("Data not Added");
    console.error("Error adding document: ", e);
  } 
  } else {
    // If the user did not confirm, log it and stop the function
    console.log("Canceled by the user.");
  }
  
}
//====================================upadte Member===================================================


//=========================clear==============================================================
function clearFields() {
  memberName.value = "";
  spouseName.value = "";
  occupation.value = "";
  age.value = "";
  birthday.value = "";
  civilStatus.value = "";
  citizenship.value = "";
  contactNum.value = "";
  memberCategory.value = "";
  memberStatus.value = "";
  gender.value = "";
  balance.value = "";
}

//======================Table=================================================




// async function fetchAndPopulateTable(next = true) {
//   // Reset pagination state
//   firstVisible = null;
//   lastVisible = null;

//   let categSelect = document.getElementById("categ")?.value; 
//   let statSelect = document.getElementById("stat")?.value; 
//   const memberTable = document.getElementById("memberTable");
//   const membersCollection = collection(db, "Members");
//   const pageSize = 20; // Set the number of records per page

//   // Clear existing rows in the table
//   while (memberTable.rows.length > 1) {
//     memberTable.deleteRow(1);
//   }

//   // Define the base query with a page size limit
//   let queryMem = query(membersCollection, orderBy("memberName"), limit(pageSize));

//   try {
//     const querySnapshot = await getDocs(queryMem);

//     // Set the first and last document for pagination controls
//     const documentSnapshots = querySnapshot.docs;
//     firstVisible = documentSnapshots[0];
//     lastVisible = documentSnapshots[documentSnapshots.length - 1];

//     // Populate the table with the documents
//     documentSnapshots.forEach((docSnapshot) => {
//       const data = docSnapshot.data();
//       const row = memberTable.insertRow(-1); // Add a new row to the table

//       if( categSelect === data.memberCategory &&  statSelect === data.memberStatus ){ 
        
//          // Populate the row with member information
//         const nameCell = row.insertCell(0);
//         nameCell.textContent = data.memberName;

//         const categoryCell = row.insertCell(1);
//         categoryCell.textContent = data.memberCategory;

//         const statusCell = row.insertCell(2);
//         statusCell.textContent = data.memberStatus;

//         const viewCell = row.insertCell(3);
//         const viewButton = document.createElement("button");
//         viewButton.textContent = "View Profile";
//         viewButton.addEventListener("click", () => {
//           // const memberId = data.enterID; // Get the member ID
//           // openProfileTab(memberId);
//         });
//         viewCell.appendChild(viewButton);
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching data: ", error);
//   }
// }


async function fetchAndPopulateTable(next = true) {
  // Reset pagination state
  firstVisible = null;
  lastVisible = null;

  let categSelect = document.getElementById("categ")?.value; 
  let statSelect = document.getElementById("stat")?.value; 
  const memberTable = document.getElementById("memberTable");
  const membersCollection = collection(db, "Members");
  const pageSize = 10; // Set the number of records per page

  const totalDocumentsQuery = query(membersCollection);
  const totalDocumentsSnapshot = await getDocs(totalDocumentsQuery);
  const totalDocuments = totalDocumentsSnapshot.size;

  // Clear existing rows in the table
  while (memberTable.rows.length > 1) {
    memberTable.deleteRow(1);
  }

// Calculate the maximum number of pages
let maxPages = Math.ceil(totalDocuments / pageSize);

// Define the base query with a page size limit
let queryMem;

if (next && lastVisible && currentPage < maxPages) {
  // If fetching next page
  queryMem = query(membersCollection, orderBy("memberName"), startAfter(lastVisible), limit(pageSize));
  currentPage++;
} else if (!next && firstVisible && currentPage > 1) {
  // If fetching previous page
  queryMem = query(membersCollection, orderBy("memberName"), endBefore(firstVisible), limitToLast(pageSize));
  currentPage--;
} else {
  // This is the default query for the first page
  queryMem = query(membersCollection, orderBy("memberName"), limit(pageSize));
  currentPage = 1; // Reset to first page
}

  // // Define the base query with a page size limit
  // let queryMem = query(membersCollection, orderBy("memberName"), limit(pageSize));

  try {
    const querySnapshot = await getDocs(queryMem);

    // Set the first and last document for pagination controls
    const documentSnapshots = querySnapshot.docs;
    firstVisible = documentSnapshots[0];
    lastVisible = documentSnapshots[documentSnapshots.length - 1];

    // Populate the table with the documents
    documentSnapshots.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const row = memberTable.insertRow(-1); // Add a new row to the table

      if ((categSelect === "All" || categSelect === data.memberCategory) && statSelect === data.memberStatus) { 
        
         // Populate the row with member information
        const nameCell = row.insertCell(0);
        nameCell.textContent = data.memberName;

        const categoryCell = row.insertCell(1);
        categoryCell.textContent = data.memberCategory;

        const statusCell = row.insertCell(2);
        statusCell.textContent = data.memberStatus;

        const viewCell = row.insertCell(3);
        const viewButton = document.createElement("button");
        viewButton.textContent = "View Profile";
        viewButton.addEventListener("click", () => {
          const memberName = data.memberName; // Get the member ID
          openProfileTab(memberName);
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

 


  // Assuming you have a div with id="paginationControls" in your HTML
  const controlsContainer = document.getElementById('paginationControls');
  controlsContainer.appendChild(prevButton);
  controlsContainer.appendChild(nextButton);
  const pageInfo = document.createElement('div');
  pageInfo.id = 'pageInfo';
  pageInfo.textContent = 'Page 1 / 1'; // Initial text
  controlsContainer.appendChild(pageInfo);
}







//===================================Search Bar==============================================

// Function to filter the table based on the search input
function filterTable() {
  const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
  const memberTable = document.getElementById("memberTable");
  const rows = memberTable.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const nameCell = rows[i].getElementsByTagName("td")[0]; // Get the second cell (name cell)
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

//=============================open profile=============================

function openProfileTab(memberName) {
  // Create a URL with the memberId as a query parameter
  const url = `profile.html?memberName=${encodeURIComponent(memberName)}`;


  window.open(url, '_blank');
}

//==================================popup========================================

document.getElementById('categ').addEventListener('change', function() {
  fetchAndPopulateTable();
});

document.getElementById('stat').addEventListener('change', function() {
  fetchAndPopulateTable();
});

document.getElementById('Gen').addEventListener('click', function() {
  window.open('memberRenterReport.html');
});


addData.addEventListener("click", addMember);
clear.addEventListener("click", clearFields);
// update.addEventListener("click", updateMember);

document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu-item');

  function hideAllIframeWrappers() {
      document.querySelectorAll('.iframe-wrapper').forEach(wrapper => {
          wrapper.style.display = 'none';
          wrapper.style.zIndex = '-1'; // Ensure it's behind other content
      });
  }

  function showIframe(wrapperId) {
      hideAllIframeWrappers();
      const iframeWrapper = document.getElementById(wrapperId);
      if (iframeWrapper) {
          iframeWrapper.style.display = 'block';
          // Make sure the iframe is above other content
          iframeWrapper.style.zIndex = '1000';
      }
  }

  menuItems.forEach(item => {
      item.addEventListener('click', () => {
          const iframeId = 'iframeWrapper_' + item.id;
          showIframe(iframeId);
      });
  });

  // Additional code for the "Members Details" item
  const memberDetailsMenuItem = document.getElementById('member');
  memberDetailsMenuItem.addEventListener('click', () => {
      hideAllIframeWrappers();
      showIframe('iframeWrapper_memberdetails');
  });

  // Additional code for the "Collection List" item
  const collectionListItem = document.getElementById('collectionList');
  collectionListItem.addEventListener('click', () => {
      hideAllIframeWrappers();
      showIframe('iframeWrapper_collectionlist');
  });

  // Set "Members Details" as the default iframe to display
  showIframe('iframeWrapper_memberdetails');
});