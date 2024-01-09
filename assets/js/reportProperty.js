import { getDocs,collection } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
const namekSelect = document.getElementById("name");
const blockSelect = document.getElementById("selecBlock");
const statusSelect = document.getElementById("selectStatus");
const resetB = document.getElementById("reset");
const findB = document.getElementById("fbutton");
const genB =  document.getElementById("reportB");
//=====================================================================================================================================================
document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });
});
async function displayCollection() {
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
      trans.deleteRow(1);
    }
    const collectionRef = collection(db, "Property");
    try {
      const querySnapshot = await getDocs(collectionRef);
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const row = trans.insertRow(-1);
        const memberNameCell = row.insertCell(0);
        memberNameCell.textContent = data.ownerName;
        const lotnumber = row.insertCell(1);
        lotnumber.textContent = data.lotNumber;
        const blocCell = row.insertCell(2);
        blocCell.textContent = data.blockNum;
        const sizeCell = row.insertCell(3);
        sizeCell.textContent = data.lotSize;
        const statusCell = row.insertCell(4);
        statusCell.textContent = data.propertyStatus;
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  async function queryByBlock() {
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
        trans.deleteRow(1);
    }
    const collectionRef = collection(db, "Property");
    try {
        const querySnapshot = await getDocs(collectionRef);
        let propertiesFound = false;
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            if (data.blockNum === blockSelect.value) {
                const row = trans.insertRow(-1);
                const memberNameCell = row.insertCell(0);
                memberNameCell.textContent = data.ownerName;
                const lotnumber = row.insertCell(1);
                lotnumber.textContent = data.lotNumber;
                const blocCell = row.insertCell(2);
                blocCell.textContent = data.blockNum;
                const sizeCell = row.insertCell(3);
                sizeCell.textContent = data.lotSize;
                const statusCell = row.insertCell(4);
                statusCell.textContent = data.propertyStatus;
                propertiesFound = true;
            }
        });
        if (!propertiesFound) {
            const row = trans.insertRow(-1);
            const noPropertyCell = row.insertCell(0);
            noPropertyCell.colSpan = 5; 
            noPropertyCell.textContent = "No properties found in the selected block.";
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}
async function queryByStatus() {
  const trans = document.getElementById("showTable");
  while (trans.rows.length > 1) {
      trans.deleteRow(1);
  }
  const collectionRef = collection(db, "Property");
  try {
      const querySnapshot = await getDocs(collectionRef);
      let propertiesFound = false;
      querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data.propertyStatus === statusSelect.value) {
              const row = trans.insertRow(-1);
              const memberNameCell = row.insertCell(0);
              memberNameCell.textContent = data.ownerName;
              const lotnumber = row.insertCell(1);
              lotnumber.textContent = data.lotNumber;
              const blocCell = row.insertCell(2);
              blocCell.textContent = data.blockNum;
              const sizeCell = row.insertCell(3);
              sizeCell.textContent = data.lotSize;
              const statusCell = row.insertCell(4);
              statusCell.textContent = data.propertyStatus;
              propertiesFound = true;
          }
      });
      if (!propertiesFound) {
          const row = trans.insertRow(-1);
          const noPropertyCell = row.insertCell(0);
          noPropertyCell.colSpan = 5; 
          noPropertyCell.textContent = "No properties found in the selected status.";
      }
  } catch (error) {
      console.error("Error fetching data: ", error);
  }
}
async function queryByName() {
  const trans = document.getElementById("showTable");
  while (trans.rows.length > 1) {
      trans.deleteRow(1);
  }
  const collectionRef = collection(db, "Property");
  try {
      const querySnapshot = await getDocs(collectionRef);
      let propertiesFound = false;
      querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data.ownerName === namekSelect.value) {
              const row = trans.insertRow(-1);
              const memberNameCell = row.insertCell(0);
              memberNameCell.textContent = data.ownerName;
              const lotnumber = row.insertCell(1);
              lotnumber.textContent = data.lotNumber;
              const blocCell = row.insertCell(2);
              blocCell.textContent = data.blockNum;
              const sizeCell = row.insertCell(3);
              sizeCell.textContent = data.lotSize;
              const statusCell = row.insertCell(4);
              statusCell.textContent = data.propertyStatus;
              propertiesFound = true;
          }
      });
      if (!propertiesFound) {
          const row = trans.insertRow(-1);
          const noPropertyCell = row.insertCell(0);
          noPropertyCell.colSpan = 5; 
          noPropertyCell.textContent = "No properties found in the selected name.";
      }
  } catch (error) {
      console.error("Error fetching data: ", error);
  }
}
  //===========================================================================================================
//=================================================================================================
  function convertToCSV(arr) {
    return arr.map(row => row.join(',')).join('\n');
}
function downloadCSV(data, filename) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    a.click();
    window.URL.revokeObjectURL(url);
}
document.getElementById('generateReport').addEventListener('click', function () {
  const table = document.getElementById('showTable');
  const data = [];
  const headerRow = table.getElementsByTagName('tr')[0];
  const headers = Array.from(headerRow.getElementsByTagName('th')).map(th => th.textContent.trim());
  data.push(headers);
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
  const fileName = prompt('Enter a file name (with .csv extension):');
  if (fileName) {
      downloadCSV(convertToCSV(data), fileName);
  }
});
findB.addEventListener('click', queryByName);
  statusSelect.addEventListener("change", function(){
    queryByStatus();
  });
  blockSelect.addEventListener("change",queryByBlock );
  resetB.addEventListener("click", function(){
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
      trans.deleteRow(1);
    }
  });
  genB.addEventListener('click', function(){
displayCollection();
  });