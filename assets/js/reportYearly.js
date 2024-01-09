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
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });
});
document.getElementById('genn').addEventListener("click", function () {
    displayCollection();
});
//========================================================================================================================
function populateYearOptions() {
  const selectYear = document.getElementById("selectYear");
  const currentYear = new Date().getFullYear();
  const yearsToDisplay = 10;
  for (let i = -yearsToDisplay; i <= yearsToDisplay; i++) {
      const year = currentYear + i;
      const option = document.createElement("option");
      option.value = year.toString();
      option.text = year;
      selectYear.appendChild(option);
  }
  selectYear.value = currentYear.toString();
}
//========================================================================================================================
async function displayCollection() {
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
      trans.deleteRow(1);
    }
    const collectionRef = collection(db, "CollectionList");
    const memberRef = collection(db, "Members");
    try {
      const memberSnapshot = await getDocs(memberRef);
      const categoryNames = await getCategoryNames();
      const selectedYear = document.getElementById("selectYear").value;
      memberSnapshot.forEach(async (memberDocSnapshot) => {
        const memberData = memberDocSnapshot.data();
        const memberName = memberData.memberName;
        const querySnapshot = await getDocs(
          query(
            collectionRef,
            where("Member", "==", memberName),
            where("Date", ">=", `${selectedYear}-01-01`),
            where("Date", "<=", `${selectedYear}-12-31`)
          )
        );
        if (querySnapshot.size === 0) {
          const row = trans.insertRow(-1);
          const idCell = row.insertCell(0);
          idCell.textContent = memberData.accountID;
          const memberNameCell = row.insertCell(1);
          memberNameCell.textContent = memberName;
          const noCollectionCell = row.insertCell(2);
          noCollectionCell.textContent = "No Collection This Month";
        } else {
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const row = trans.insertRow(-1);
            const idCell = row.insertCell(0);
            idCell.textContent = data.accountID;
            const memberNameCell = row.insertCell(1);
            memberNameCell.textContent = memberName;
            const transactionNumCell = row.insertCell(2);
            transactionNumCell.textContent = data.TransactionNum;
            const collectorCell = row.insertCell(3);
            collectorCell.textContent = data.Collector;
            const dateCell = row.insertCell(4);
            dateCell.textContent = data.Date;
            const totalFeeCell = row.insertCell(5);
            totalFeeCell.textContent = data.TotalFee;
            const balLotAmort = row.insertCell(6);
            balLotAmort.textContent = data.lotAmortBal;
            categoryNames.forEach((categoryName, index) => {
              const categoryCell = row.insertCell(7 + index);
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
        const categoryRef = collection(db, "CollectionCategory");
        try {
          const querySnapshot = await getDocs(categoryRef);
          const headerRow = document.getElementById("showTable").rows[0];
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const th = document.createElement("th");
            th.textContent = data.collectionName;
            headerRow.appendChild(th);
          });
        } catch (error) {
          console.error("Error fetching category data: ", error);
        }
      }
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