import {doc, getDoc,getDocs, setDoc,collection, updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast, } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { auth } from "../credentials/firebaseModule.js";
const viewColCancel = document.getElementById("viewColCancel");
const addB =  document.getElementById("addCollection");
const collectionAdd =  document.getElementById("add");
const cancelB =  document.getElementById("cancel");
const deleteButton = document.getElementById("moveBin");
const editB = document.getElementById("Edit");
const closeB = document.getElementById("close");
const updateB = document.getElementById("updateMember");
const sendBbb = document.getElementById("sendBB");
const sendB =  document.getElementById("send");
const memName =  document.getElementById("memName");
let totalFee = 0; 
let lotAmortVal; 
let inputFee;
let penaltyFee;
let firstFee; 
let secondFee;
let currentPage = 1; 
const pageSize = 10; 
let lastVisible = null; 
let firstVisible = null; 
document.addEventListener('DOMContentLoaded', (event) => {
  load();
  displayCollection(); 
  createPaginationControls();
  collectionMenu();
});
const urlParams = new URLSearchParams(window.location.search);
const Name = urlParams.get("memberName");
//Elements
const statusButton = document.getElementById("statusButton");
console.log(Name);
const membersCollectionRef = collection(db, "Members");
//================================================================================================================================
let globalDocId;
async function load(){
const q = query(membersCollectionRef, where("memberName", "==", Name));
try {
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    document.getElementById("accountIDVal").value = data.accountID;
    document.getElementById("accountID").value = data.accountID;
    document.getElementById("name").value = data.memberName;
    document.getElementById("cont").value = data.contactNum;
    document.getElementById("category").value = data.memberCategory;
    document.getElementById("statusButton").textContent = data.memberStatus;
    document.getElementById("recipientNumber").value = '+63' + data.contactNum.substring(1);
    document.getElementById("balance").value = parseFloat(data.lotAmort).toFixed(2);
    lotAmortVal = parseFloat(data.lotAmort).toFixed(2);
  } else {
    console.log("No such document with the provided name!");
  }
} catch (error) {
  console.error("Error getting document by name:", error);
}
const buttonText = statusButton.textContent.toLowerCase();
if (buttonText === "active") {
  statusButton.style.backgroundColor = "#03AC13";
} else {
  statusButton.style.backgroundColor = "#ff0000"; 
}
  const lotTable = document.getElementById("lotTable");
  const lotTableBody = lotTable.querySelector('tbody');
  while (lotTableBody.rows.length > 1) {
    lotTableBody.deleteRow(1);
  }
  const PropertyCollectionRef = collection(db, "Property");
const p = query(PropertyCollectionRef, where("ownerName", "==", Name));
  try {
    const querySnapshot = await getDocs(p);
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const newRow = lotTableBody.insertRow(-1);
      const blockCell = newRow.insertCell(0);
      const lotCell = newRow.insertCell(1);
      const lotSizeCell = newRow.insertCell(2);
      blockCell.textContent = data.lotNumber;
      lotCell.textContent = data.blockNum;
      lotSizeCell.textContent = data.lotSize;
    });
    if (querySnapshot.empty) {
      const noDataMessage = lotTableBody.insertRow(-1);
      const messageCell = noDataMessage.insertCell(0);
      messageCell.textContent = "No Property Yet";
      messageCell.colSpan = 3;
    }
  } catch (error) {
    console.error("Error getting documents:", error);
  }
}
//==================Edit=================================================================================================
async function updateHTMLElements() {
  const w = query(membersCollectionRef, where("memberName", "==", Name));
  try {
    const querySnapshot = await getDocs(w);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      globalDocId = docRef.id;
      const data = querySnapshot.docs[0].data();
      document.getElementById('memberName').value = data.memberName || '';
      document.getElementById('spouseName').value = data.spouseName || '';
      document.getElementById('occupation').value = data.occupation || '';
      document.getElementById('age').value = data.age || '';
      document.getElementById('birthday').value = data.birthday || '';
      document.getElementById('civilStatus').value = data.civilStatus || '';
      document.getElementById('citizenship').value = data.citizenship || '';
      document.getElementById('contactNum').value = data.contactNum || '';
      document.getElementById('sourceOfIncome').value = data.sourceOfIncome || '';
      document.getElementById('memberCategory').value = data.memberCategory || '';
      document.getElementById('memberStatus').value = data.memberStatus || '';
      document.getElementById('gender').value = data.gender || '';
    } else {
      console.log("No such document with the provided name!");
    }
  } catch (error) {
    console.error("Error getting documents:", error);
  }
}
  function poppop() {
  var pop = document.querySelector('#popup');
  if (pop.style.display === 'none' || pop.style.display === '') {
    pop.style.display = 'grid';
  } else {
    pop.style.display = 'none';
  }
  } 
//================================================Upadate=================================================================
async function updateMember() {
  if (!globalDocId) {
    console.error("No document ID is set. Please fetch the member details first.");
    return;
  }
  if(!memberCategory?.value || ! memberStatus?.value || !gender?.value || ! memberName?.value ||
     !spouseName?.value || !occupation?.value || !age?.value || ! civilStatus?.value || !citizenship?.value ||
     !contactNum?.value
     ){
      alert("Please check if there is an empty field.");
      return
    }
  const docRef = doc(db, "Members", globalDocId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    console.error("enterID not found. This ID does not exist in the database.");
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
    gender: gender?.value
  };
  const updateConfirmed = confirm("Please check again before updating this member's information?");
  if (updateConfirmed) {
    try {
      await updateDoc(docRef, data);
      alert("Updated Successfully");
      location.reload();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  } else {
    console.log("Update canceled by the user.");
  }
}
function updateTotalFee(totalFee) {
  const totalFeeCell = document.getElementById("totalFee");
  if (totalFeeCell) {
    totalFeeCell.textContent = `Total Fee: $${totalFee.toFixed(2)}`;
  }
}
async function collectionMenu() {
  document.getElementById("memName").value = Name;

  while (addColTable.rows.length > 1) {
    addColTable.deleteRow(1);
  }
  const membersCollection = collection(db, "CollectionCategory");
  try {
    const querySnapshot = await getDocs(membersCollection);
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.Status === "Active") {
        const row = addColTable.insertRow(-1);
        const checkboxCell = row.insertCell(0);
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkboxCell.appendChild(checkBox);
        const idCell = row.insertCell(1);
        idCell.textContent = data.CollectionID;
        const nameCell = row.insertCell(2);
        nameCell.textContent = data.collectionName;
        const feeCell = row.insertCell(3);
        let feeValue = parseFloat(data.Fee);
        if (isNaN(feeValue)) {
          feeValue = 0;
        }
if (data.CollectionID === "001") {
  inputFee = document.createElement("input");
  inputFee.type = "number";
  inputFee.placeholder = "Enter fee";
  inputFee.value = firstFee || '';
  let timeout;
  inputFee.addEventListener("input", (event) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const newFee = parseFloat(event.target.value);
      feeValue = isNaN(newFee) ? 0 : newFee;
      feeCell.textContent = isNaN(newFee) ? "" : newFee.toFixed(2);
      firstFee = event.target.value;
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
      }
    });
    const totalFeeRow = document.createElement("tr");
    const totalFeeCell = document.createElement("td");
    totalFeeCell.textContent = `Total Fee: ₱${totalFee.toFixed(2)}`;
    totalFeeCell.colSpan = 4;
    totalFeeCell.id = "totalFee";
    totalFeeRow.appendChild(totalFeeCell);
    addColTable.appendChild(totalFeeRow);
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}
function togglePopup() {
  var addCol = document.querySelector('#addCol');
  if (addCol.style.display === 'none' || addCol.style.display === '') {
      addCol.style.display = 'flex';
  } else {
      addCol.style.display = 'none';
      document.getElementById("tranNum").value = "";
      document.getElementById("memName").value = "";
      document.getElementById("tranDate").value = "";
    collectionMenu();
    cancelCollcetion();
  }
  }
  function cancelCollcetion() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    totalFee = 0;
    updateTotalFee();
}
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
  const buttonText = statusButton.textContent.toLowerCase();
  let currentBal = lotAmortVal;
  if (buttonText != "active") {
    alert("The member is currently INACTIVE");
    return
  }
  const checkedRows = Array.from(document.querySelectorAll('#colCat table input[type="checkbox"]:checked'));
  const dataToAdd = {
      TransactionNum: document.getElementById('tranNum').value, 
      accountID: document.getElementById("accountID").value,
      Date: document.getElementById('tranDate').value,
      Collector: document.getElementById('collName').value, 
      Member: document.getElementById('memName').value,  
      TotalFee: totalFee,
      lotAmortBal: currentBal,
      Categories: []
  };
  if (checkedRows.length === 0) {
      alert("Select at least 1 collection.");
  } else {
      checkedRows.forEach((row) => {
          if (row.parentElement.tagName === 'TD') {
              const cells = row.parentElement.parentElement.cells;
              const idCell = cells[1].textContent;
              const nameCell = cells[2].textContent;
              const feeCell = parseFloat(cells[3].textContent);
              dataToAdd.Categories.push({ collectionID: idCell, collectionName: nameCell, collectionFee: feeCell });
          }
      });
      const userConfirmed = confirm("Are you sure you want to add this collection?");
      if (userConfirmed) {
      try {
          const transactionRef = doc(db, "CollectionList", dataToAdd.TransactionNum);
          const snapshot = await getDoc(transactionRef);
          if (snapshot.exists()) {
              alert("Transaction number already exists. Please enter a different number.");
              document.getElementById('tranNum').focus();
          } else {
              await setDoc(transactionRef, dataToAdd);
              updateLotAmort();
              alert("Data added successfully");
          }
      } catch (error) {
          alert("Error adding data: " + error);
      }
    }else {
        alert("The operation is cancelled by user.");
    }
  }
  displayCollection(); 

}
//====================================================================================================================================
async function updateLotAmort() {
  const q = query(membersCollectionRef, where("memberName", "==", Name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    globalDocId = docRef.id;
  } else {
    console.log("No such document with the provided name!");
  }
  if (!globalDocId) {
    console.error("Document ID (globalDocId) is not set.");
    return;
  }
console.log(inputFee.value);
  const parsedInputFee = parseFloat(inputFee.value);
  if (isNaN(parsedInputFee)) {
    console.error("Parsed Input Fee is not a valid number.");
    return;
  }
  const docRef = doc(db, "Members", globalDocId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentLotAmort = parseFloat(docSnap.data().lotAmort);
      const newLotAmort = currentLotAmort - parsedInputFee;
      await updateDoc(docRef, { lotAmort: newLotAmort });
      console.log("Lot amortization updated successfully.");
    } else {
      console.error("Document does not exist.");
    }
  } catch (e) {
    console.error("Error updating lot amortization:", e);
  }
  togglePopup();
  load();
}
async function displayCollection(next = true) {
  const collectionRef = collection(db, "CollectionList");
  let queryCol;
  const totalDocumentsQuery = query(collectionRef, where("Member", "==", Name));
  const totalDocumentsSnapshot = await getDocs(totalDocumentsQuery);
  const totalDocuments = totalDocumentsSnapshot.size;
  let maxPages = Math.ceil(totalDocuments / pageSize);
  if (next && lastVisible && currentPage < maxPages) {
    queryCol = query(collectionRef, where("Member", "==", Name), orderBy("TransactionNum", "desc"), startAfter(lastVisible), limit(pageSize));
    currentPage++;
  } else if (!next && firstVisible && currentPage > 1) {
    queryCol = query(collectionRef, where("Member", "==", Name), orderBy("TransactionNum", "desc"), endBefore(firstVisible), limitToLast(pageSize));
    currentPage--;
  } else {
    queryCol = query(collectionRef, where("Member", "==", Name), orderBy("TransactionNum", "desc"), limit(pageSize));
    currentPage = 1;
    firstVisible = null;
    lastVisible = null;
  }
  while (bleta.rows.length > 1) {
    bleta.deleteRow(1);
  }
  try {
    const querySnapshot = await getDocs(queryCol);
    const documentSnapshots = querySnapshot.docs;
    if (documentSnapshots.length > 0) {
      firstVisible = documentSnapshots[0];
      lastVisible = documentSnapshots[documentSnapshots.length - 1];
    }
    documentSnapshots.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.Member === Name) {
                const row = bleta.insertRow(-1);
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
              }
    });
    updatePageDisplay(currentPage, maxPages);
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
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
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  let alreadyAutoClicked = false;
  prevButton.addEventListener('click', function handlePrevButtonClick() {
    displayCollection(false);
    if (!alreadyAutoClicked) {
      alreadyAutoClicked = true;
      prevButton.dispatchEvent(new MouseEvent('click'));
    }
  });
  const controlsContainer = document.getElementById('paginationControls');
  controlsContainer.appendChild(prevButton);
  controlsContainer.appendChild(nextButton);
  const pageInfo = document.createElement('div');
  pageInfo.id = 'pageInfo';
  pageInfo.textContent = 'Page 1 / 1';
  controlsContainer.appendChild(pageInfo);
}
function viewCollection(data) {
  const addCol = document.querySelector('#viewCollection');
  if (addCol.style.display === 'none' || addCol.style.display === '') {
    addCol.style.display = 'block';
    document.getElementById('cdTransactionNumber').value = data.TransactionNum;
    document.getElementById('cdMemberID').value = data.accountID;
    document.getElementById('cdMemberName').value = data.Member;
    document.getElementById('cdCollectorName').value = data.Collector;
    document.getElementById('cdTranDate').value = data.Date;
    document.getElementById('bal').value = data.lotAmortBal;
    const table = document.getElementById('cdTable');
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }
    data.Categories.forEach((category) => {
      const row = table.insertRow(-1);
      const collectionIDCell = row.insertCell(0);
      const collectionNameCell = row.insertCell(1);
      const feeCell = row.insertCell(2);
      collectionIDCell.textContent = category.collectionID;
      collectionNameCell.textContent = category.collectionName;
      feeCell.textContent = category.collectionFee;
    });
    const newRow = table.insertRow(-1);
    const totalFeeCell = newRow.insertCell(0);
    totalFeeCell.colSpan = 3;
    totalFeeCell.textContent = `Total Fee: ${data.TotalFee}`;
  } else {
    addCol.style.display = 'none';
  }
}
viewColCancel.addEventListener("click", () => {
  var addCol = document.querySelector('#viewCollection');
  addCol.style.display = 'none';
});
function toggleButton() {
  var button = document.getElementById("smsForm");
  button.style.display = (button.style.display === "block") ? "none" : "block";
}

async function sendSMS() {
  // const formattedPhoneNumber = `+63${contactNumber.substring(1)}`;
  // const messageBody = `Please wait for confirmation for your request. - Facility: ${facility}, Date: ${datetime}, Time: ${format12HourTime(timeFrom)}-${format12HourTime(timeTo)}`;
  const recipientPhoneNumber = document.getElementById('recipientNumber').value;
  const messageBody = document.getElementById('messageBody').value;
  const accountSid = 'AC9822d43e56372f236f136adf4230d182';
  const authToken = '58cccb1bb1bee61842e2af5fd68487d8';
  const twilioNumber = '+12679152818';
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${accountSid}:${authToken}`));
  headers.set('Content-Type', 'application/x-www-form-urlencoded');
  const params = new URLSearchParams();
  params.append('To', recipientPhoneNumber);
  params.append('From', twilioNumber);
  params.append('Body', messageBody);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: params,
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log('SMS sent successfully:', responseData);
    } else {
      const errorData = await response.json();
      console.error('Error sending SMS:', errorData);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}
collectionAdd.addEventListener("click", addCollection);
addB.addEventListener("click", togglePopup);
cancelB.addEventListener("click", togglePopup);
closeB.addEventListener("click", poppop);
updateB.addEventListener("click", updateMember);
sendBbb.addEventListener("click", toggleButton);
sendB.addEventListener("click", sendSMS);
editB.addEventListener("click", () => {
  updateHTMLElements();
  poppop();
});