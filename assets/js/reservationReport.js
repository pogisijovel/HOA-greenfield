import { getDocs,collection } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db } from "../credentials/firebaseModule.js"


displayCollection();

// Get references to the select elements
const selectMonth = document.getElementById("Select");
const selectYear = document.getElementById("selectYear");
const resetB = document.getElementById("reset");


// Add an event listener to the month select element
selectMonth.addEventListener("change", function () {
  const selectedMonth = selectMonth.value;
  console.log("Selected Month: " + selectedMonth);
});

// Add an event listener to the year select element
selectYear.addEventListener("change", function () {
  const selectedYear = selectYear.value;
  console.log("Selected Year: " + selectedYear);
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

//========================================================================================================================
function populateYearOptions() {
    const selectYear = document.getElementById("selectYear");
    const currentYear = new Date().getFullYear();
    const yearsToDisplay = 10; // Number of previous and future years to display

    for (let i = -yearsToDisplay; i <= yearsToDisplay; i++) {
        const year = currentYear + i;
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        selectYear.appendChild(option);
    }
}

    // Call the function to populate year options
    populateYearOptions();


//========================================================================================================================    

    function resetTable() {
        // Get a reference to the table element by its ID
        const table = document.getElementById("showTable");
      
        // Check if the table exists
        if (table) {
          // Remove all rows except the header (first row)
          const rowCount = table.rows.length;
          for (let i = rowCount - 1; i > 0; i--) {
            table.deleteRow(i);
          }
        } else {
          console.log("Table not found.");
        }
      }

//========================================================================================================================
      
      async function displayCollection() {
        // Clear existing rows in the table
        const trans = document.getElementById("showTable");
        while (trans.rows.length > 1) {
          trans.deleteRow(1);
        }
      
        // Reference to the "CollectionList" collection in Firestore
        const collectionRef = collection(db, "EventDatabase");
      
        try {
          const querySnapshot = await getDocs(collectionRef);
      
  
          // Loop through the documents in the CollectionList collection
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const row = trans.insertRow(-1); // Add a new row to the table
      
            // Populate the row with the desired fields
            const transactionNumCell = row.insertCell(0);
            transactionNumCell.textContent = data.reservedBy;
      
            const memberNameCell = row.insertCell(1);
            memberNameCell.textContent = data.title;
      
            const memberIDCell = row.insertCell(2);
            memberIDCell.textContent = data.facility;
      
            const collectorCell = row.insertCell(3);
            collectorCell.textContent = data.fullDate;
      
            const dateCell = row.insertCell(4);
            dateCell.textContent = data.time;
      
      
          });
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
 
      

  //=====================================================================================================================================


  function filterTableYear() {
    const selectedYear = document.getElementById("selectYear").value;
    const memberTable = document.getElementById("showTable");
    const rows = memberTable.getElementsByTagName("tr");
  
    for (let i = 1; i < rows.length; i++) {
      const dateCell = rows[i].getElementsByTagName("td")[3]; // Get the cell with the date (modify the index if needed)
      if (dateCell) {
        const date = dateCell.textContent.trim(); // Get the date value
        const parts = date.split(" "); // Split the date into its parts
  
        if (parts.length === 3) {
          const year = parts[0];
          if (selectedYear === "All" || year === selectedYear) {
            rows[i].style.display = ""; // Show the row if it matches the selected year or "All"
          } else {
            rows[i].style.display = "none"; // Hide the row if it doesn't match the selected year
          }
        }
      }
    }
  }
  
  // Add an event listener to the select element
  selectYear.addEventListener("change", filterTableYear);
  
  // Call the filterTableYear function when the page loads with "All" selected
  document.addEventListener("DOMContentLoaded", () => {
    // Set "All" as the default value
    selectYear.value = "All";
    filterTableYear();
  });

//======================================================================================================================================

function filterTableMonth() {
  const selectedMonth = document.getElementById("Select").value;
  const memberTable = document.getElementById("showTable");
  const rows = memberTable.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const dateCell = rows[i].getElementsByTagName("td")[3]; // Get the cell with the date (modify the index if needed)
    if (dateCell) {
      const date = dateCell.textContent.trim(); // Get the date value
      const dateParts = date.split(" "); // Split the date by space
      if (dateParts.length === 3 && dateParts[1] === selectedMonth) {
        rows[i].style.display = ""; // Show the row if it matches the selected month
      } else {
        rows[i].style.display = "none"; // Hide the row if it doesn't match the selected month
      }
    }
  }
}


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
















selectMonth.addEventListener("change", filterTableMonth);

// Call the filterTableMonth function when the page loads with "Select Month" selected
document.addEventListener("DOMContentLoaded", () => {
    // Set "Select Month" as the default value
    selectMonth.value = "";
    filterTableMonth();
});

resetB.addEventListener("click", function() {
  displayCollection();
  selectMonth.selectedIndex = 0; 
  selectYear.selectedIndex = 0; 
});