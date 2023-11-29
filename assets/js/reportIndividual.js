import {getDocs,collection, query, where, orderBy, limit, startAfter, endBefore, limitToLast } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db } from "../credentials/firebaseModule.js";

let month = document.getElementById("Select");
let year = document.getElementById("selectYear");
let searchName = document.getElementById("searchName");
const resetB = document.getElementById("reset");


const collectionRef = collection(db, "CollectionList");
const memberRef = collection(db, "Members");

document.addEventListener("DOMContentLoaded", function() {
  addCategoryHeaders();
  names()
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


async function names(){
const datalist = document.getElementById("names");

// Query the Firestore database for member names
getDocs(memberRef).then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    // Access the "memberName" field from each document
    const memberName = doc.data().memberName;

    // Create an option element for each member name
    const option = document.createElement("option");
    option.value = memberName;

    // Append the option to the datalist
    datalist.appendChild(option);
  });
});
}

//========================================================================================================================



//========================================================================================================================
async function displayQueryNameCollection() {
    const trans = document.getElementById("showTable");

    // Clear existing rows in the table
    while (trans.rows.length > 1) {
        trans.deleteRow(1);
    }

    try {
        // Get the value of the searchName input
        const searchNameValue = searchName.value;

        // Query the Firestore collection with the search condition
        const querySnapshot = await getDocs(query(collectionRef, where("Member", "==", searchNameValue)));

        // Get the categories from CollectionCategory for checking later
        const categoryNames = await getCategoryNames();

        let searchNameFound = false; // Flag to check if any matching record is found

        // Process the query results
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const docName = data.Member;

            // Set the flag to true since a matching record is found
            searchNameFound = true;

            const row = trans.insertRow(-1); // Add a new row to the table

            // Populate the row with the desired fields
            const transactionNumCell = row.insertCell(0);
            transactionNumCell.textContent = data.TransactionNum;

            const memberNameCell = row.insertCell(1);
            memberNameCell.textContent = data.Member;

            const collectorCell = row.insertCell(2);
            collectorCell.textContent = data.Collector;

            const dateCell = row.insertCell(3);
            dateCell.textContent = data.Date; // Use the converted date string

            const totalFeeCell = row.insertCell(4);
            totalFeeCell.textContent = data.TotalFee;

            const balLotAmort = row.insertCell(5);
            balLotAmort.textContent = data.lotAmortBal;

            // Add "Yes" or "No" cells based on category presence
            categoryNames.forEach((categoryName, index) => {
                const categoryCell = row.insertCell(6 + index);
                const matchingCategory = data.Categories.find(category => category.collectionName === categoryName);

                if (matchingCategory) {
                    categoryCell.textContent = matchingCategory.collectionFee; // Display the collectionFee
                } else {
                    categoryCell.textContent = ''; // Leave a blank cell for unpaid
                }
            });
        });

        // Check if the searchName was not found and display an alert
        if (!searchNameFound) {
            alert(`No matching record found for ${searchNameValue}`);
        }

    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

  



  async function displayCollection() {
    // Clear existing rows in the table
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
      trans.deleteRow(1);
    }
  
    // Reference to the "CollectionList" collection in Firestore
    const collectionRef = collection(db, "CollectionList");
  
    // Create a query with a filter on the Member field
    const queryName = query(collectionRef, where("Member", "==", searchName));
  
    try {
      const querySnapshot = await getDocs(queryName);
  
      // Get the categories from CollectionCategory for checking later
      const categoryNames = await getCategoryNames();
  
      // Get the first row of the table (header row)
      const headerRow = document.getElementById("showTable").rows[0];
  
      // Loop through the documents in the filtered query
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const row = trans.insertRow(-1); // Add a new row to the table
  
        // Populate the row with the desired fields
        const transactionNumCell = row.insertCell(0);
        transactionNumCell.textContent = data.TransactionNum;
  
        const memberNameCell = row.insertCell(1);
        memberNameCell.textContent = data.Member;
  
        const collectorCell = row.insertCell(2);
        collectorCell.textContent = data.Collector;
  
        const dateCell = row.insertCell(3);
        dateCell.textContent = data.Date; // Use the converted date string
  
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
            categoryCell.textContent = matchingCategory.collectionFee; // Display the collectionFee
          } else {
            categoryCell.textContent = ''; // Leave a blank cell for unpaid
          }
        });
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

document.getElementById("find").addEventListener('click',function (){
    displayQueryNameCollection();
   console.log("sadsad");
  
  });

resetB.addEventListener("click",function (){
  deleteRowsAndCells();
  console.log("Table Cleared");

});