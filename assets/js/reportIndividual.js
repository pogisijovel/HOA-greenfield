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
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });
});
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
//========================================================================================================================
//========================================================================================================================
async function displayQueryNameCollection() {
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
        trans.deleteRow(1);
    }
    try {
        const searchNameValue = searchName.value;
        const querySnapshot = await getDocs(query(collectionRef, where("Member", "==", searchNameValue)));
        const categoryNames = await getCategoryNames();
        let searchNameFound = false;
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const docName = data.Member;
            searchNameFound = true;
            const row = trans.insertRow(-1);
            const transactionNumCell = row.insertCell(0);
            transactionNumCell.textContent = data.accountID;
            const idCell = row.insertCell(1);
            idCell.textContent = data.Member;
            const memberNameCell = row.insertCell(2);
            memberNameCell.textContent = data.TransactionNum;
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
                const matchingCategory = data.Categories.find(category => category.collectionName === categoryName);
                if (matchingCategory) {
                    categoryCell.textContent = matchingCategory.collectionFee;
                } else {
                    categoryCell.textContent = '';
                }
            });
        });
        if (!searchNameFound) {
            alert(`No matching record found for ${searchNameValue}`);
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}
  async function displayCollection() {
    const trans = document.getElementById("showTable");
    while (trans.rows.length > 1) {
      trans.deleteRow(1);
    }
    const collectionRef = collection(db, "CollectionList");
    const queryName = query(collectionRef, where("Member", "==", searchName));
    try {
      const querySnapshot = await getDocs(queryName);
      const categoryNames = await getCategoryNames();
      const headerRow = document.getElementById("showTable").rows[0];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const row = trans.insertRow(-1);
        const transactionNumCell = row.insertCell(0);
        transactionNumCell.textContent = data.TransactionNum;
        const memberNameCell = row.insertCell(1);
        memberNameCell.textContent = data.Member;
        const collectorCell = row.insertCell(2);
        collectorCell.textContent = data.Collector;
        const dateCell = row.insertCell(3);
        dateCell.textContent = data.Date;
        const totalFeeCell = row.insertCell(4);
        totalFeeCell.textContent = data.TotalFee;
        const balLotAmort = row.insertCell(5);
        balLotAmort.textContent = data.lotAmortBal;
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
document.getElementById("find").addEventListener('click',function (){
    displayQueryNameCollection();
   console.log("sadsad");
  });
resetB.addEventListener("click",function (){
  deleteRowsAndCells();
  console.log("Table Cleared");
});