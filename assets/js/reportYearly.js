import {getDocs,collection, query, where, orderBy, limit, startAfter, endBefore, limitToLast } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db } from "../credentials/firebaseModule.js";

let month = document.getElementById("Select");
let year = document.getElementById("selectYear");
let searchName = document.getElementById("searchName");
const resetB = document.getElementById("reset");
const findB = document.getElementById("find");


document.addEventListener("DOMContentLoaded", function() {
    displayCollection();
  addCategoryHeaders();
   populateYearOptions();
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


// Add an event listener to the month select element


// Add an event listener to the year select element
document.getElementById('selectYear').addEventListener("change", function () {
    displayCollection();
 
});

//========================================================================================================================
function populateYearOptions() {
  const selectYear = document.getElementById("selectYear");
  const currentYear = new Date().getFullYear();
  const yearsToDisplay = 10; // Number of previous and future years to display

  for (let i = -yearsToDisplay; i <= yearsToDisplay; i++) {
      const year = currentYear + i;
      const option = document.createElement("option");
      option.value = year.toString(); // Convert to string
      option.text = year;
      selectYear.appendChild(option);
  }

  // Set the selectYear value to the current year
  selectYear.value = currentYear.toString(); // Convert to string
}


//========================================================================================================================
async function displayCollection() {
    // Clear existing rows in the table
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
      trans.deleteRow(1);
    }
  
    // Reference to the "CollectionList" collection in Firestore
    const collectionRef = collection(db, "CollectionList");
    const memberRef = collection(db, "Members");
  
    try {
      const memberSnapshot = await getDocs(memberRef);
      const categoryNames = await getCategoryNames();
      const selectedYear = document.getElementById("selectYear").value;
  
      // Loop through the documents in the "Members" collection
      memberSnapshot.forEach(async (memberDocSnapshot) => {
        const memberData = memberDocSnapshot.data();
        const memberName = memberData.memberName;
  
        // Query the Firestore collection "CollectionList" with the memberName and year filter
        const querySnapshot = await getDocs(
          query(
            collectionRef,
            where("Member", "==", memberName),
            where("Date", ">=", `${selectedYear}-01-01`),
            where("Date", "<=", `${selectedYear}-12-31`)
          )
        );
  
        // Check if member has collections for the selected year
        if (querySnapshot.size === 0) {
          // If no collections, display "No Collection Yet"
          const row = trans.insertRow(-1);
          const memberNameCell = row.insertCell(0);
          memberNameCell.textContent = memberName;
  
          const noCollectionCell = row.insertCell(1);
          noCollectionCell.textContent = "No Collection Yet";
        } else {
          // Loop through the collections
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const row = trans.insertRow(-1);
  
            // Populate the row with the desired fields
            const memberNameCell = row.insertCell(0);
            memberNameCell.textContent = memberName;
  
            const transactionNumCell = row.insertCell(1);
            transactionNumCell.textContent = data.TransactionNum;
  
            const collectorCell = row.insertCell(2);
            collectorCell.textContent = data.Collector;
  
            const dateCell = row.insertCell(3);
            dateCell.textContent = data.Date;
  
            const totalFeeCell = row.insertCell(4);
            totalFeeCell.textContent = data.TotalFee;
  
            const balLotAmort = row.insertCell(5);
            balLotAmort.textContent = data.lotAmortBal;
  
            // Add "Yes" or "No" cells based on category presence
            categoryNames.forEach((categoryName, index) => {
              const categoryCell = row.insertCell(6 + index);
              const matchingCategory = data.Categories.find(
                (category) => category.collectionName === categoryName
              );
  
              if (matchingCategory) {
                categoryCell.textContent = matchingCategory.collectionFee;
              } else {
                categoryCell.textContent = '';
              }
            });
          });
        }
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  
  
    async function addCategoryHeaders() {
        // Reference to the "CollectionCategory" collection in Firestore
        const categoryRef = collection(db, "CollectionCategory");
      
        try {
          const querySnapshot = await getDocs(categoryRef);
      
          // Get the first row of the table (header row)
          const headerRow = document.getElementById("showTable").rows[0];
      
          // Loop through the documents in the "CollectionCategory" collection
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            // Create a new <th> element for each "collectionName"
            const th = document.createElement("th");
            th.textContent = data.collectionName;
            headerRow.appendChild(th);
          });
        } catch (error) {
          console.error("Error fetching category data: ", error);
        }
      }
      
      // Function to get the category names from CollectionCategory
      async function getCategoryNames() {
        const categoryRef = collection(db, "CollectionCategory");
        const categoryNames = [];
      
        try {
          const querySnapshot = await getDocs(categoryRef);
      
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            categoryNames.push(data.collectionName);
          });
        } catch (error) {
          console.error("Error fetching category data: ", error);
        }
      
        return categoryNames;
      }
  //=====================================================================================================================================



//======================================================================================================================================

  // Function to convert a 2D array to a CSV string
  function convertToCSV(arr) {
    return arr.map(row => row.join(',')).join('\n');
}

// Function to download a CSV file with user-selected file name
function downloadCSV(data, filename) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);

    // Trigger a click event to open the browser's save dialog
    a.click();
    window.URL.revokeObjectURL(url);
}

document.getElementById('generateReport').addEventListener('click', function () {
  const table = document.getElementById('showTable');
  const data = [];
  
  // Extract table headers (th elements)
  const headerRow = table.getElementsByTagName('tr')[0];
  const headers = Array.from(headerRow.getElementsByTagName('th')).map(th => th.textContent.trim());
  data.push(headers);

  // Extract table data based on current display (filtered by month and year)
  const rows = table.getElementsByTagName('tr');
  for (let i = 1; i < rows.length; i++) {
      if (rows[i].style.display !== 'none') {
          const row = [];
          const cells = rows[i].getElementsByTagName('td');
          for (let j = 0; j < cells.length; j++) {
              row.push(cells[j].textContent.trim());
          }
          data.push(row);
      }
  }

  // Prompt the user for a file name
  const fileName = prompt('Enter a file name (with .csv extension):');
  if (fileName) {
      downloadCSV(convertToCSV(data), fileName);
  }
});

function deleteRowsAndCells() {
  const trans = document.getElementById("showTable");
  while (trans.rows.length > 1) {
    trans.deleteRow(1);
  }

}


resetB.addEventListener("click",function (){
  deleteRowsAndCells();
  console.log("Table Cleared");

});