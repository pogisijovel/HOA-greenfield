import { doc, getDoc,getDocs, setDoc,collection,updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast   } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
const memberRef = collection(db, "Members");
const add = document.getElementById("add");
const cancel = document.getElementById("cancel");
const popupMenu = document.getElementById("popupMenu");
const viewColCancel = document.getElementById("viewColCancel");
const accountIDInput = document.getElementById("accountID");
let totalFee = 0; 
let inputFee = 0;
let allContactNumbers = [];
let lotAmortVal;
let firstFee; 

let currentPage = 1; 
const pageSize = 10; 
let lastVisible = null; 
let firstVisible = null; 

document.addEventListener('DOMContentLoaded', (event) => {
  displayCollection();
  collectionMenu();
  createPaginationControls();
  names();
  accountIDs();
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
          const ownerNameInput = document.getElementById("memName");
    
          // Assuming your document structure has a property 'memberName'
          ownerNameInput.value = data.memberName;
        } else {
          // Handle the case where no matching document is found
          console.log("No matching document found for the given accountID");
        }
      }
    });
function togglePopup() {
  var addCol = document.querySelector('#addCol');
  if (addCol.style.display === 'none' || addCol.style.display === '') {
      addCol.style.display = 'block';
  } else {
      addCol.style.display = 'none';
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
function updateTotalFee() {
  const totalFeeCell = document.getElementById("totalFee");
  if (totalFeeCell) {
      totalFeeCell.textContent = `Total Fee: ₱${totalFee.toFixed(2)}`;
  }
}
async function updateLotAmort() {
  const name = document.getElementById('memName').value;
  if (!name) {
      alert("Please provide a member name.");
      return;
  }
  let parsedLotAmortVal = parseFloat(lotAmortVal);
  let parsedInputFee = parseFloat(firstFee);
  let subResult = parsedLotAmortVal - parsedInputFee;
  const querySnapshot = await getDocs(query(collection(db, 'Members'), where('memberName', '==', name)));
  querySnapshot.forEach(async (doc) => {
      const data = {
          lotAmort: subResult
      };
      try {
          await updateDoc(doc.ref, data);
          console.log(subResult);
          location.reload();
      } catch (e) {
          alert("Error updating document: " + e);
      }
  });
}
async function collectionMenu() {
  while (addColTable.rows.length > 1) {
    addColTable.deleteRow(1);
  }
  const membersCollection = collection(db, "CollectionCategory");
  try {
    const querySnapshot = await getDocs(membersCollection);
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
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
}else {
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
//================================================================================================================
async function displayCollection(next = true) {
  const bleta = document.getElementById('trans');
  const collectionRef = collection(db, "CollectionList");
  let queryCol;
  const totalDocumentsSnapshot = await getDocs(collectionRef);
  const totalDocuments = totalDocumentsSnapshot.size;
  let maxPages = Math.ceil(totalDocuments / pageSize);
  if (next && lastVisible && currentPage < maxPages) {
    queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), startAfter(lastVisible), limit(pageSize));
    currentPage++;
  } else if (!next && firstVisible && currentPage > 1) {
    queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), endBefore(firstVisible), limitToLast(pageSize));
    currentPage--;
  } else {
    queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), limit(pageSize));
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
function closePopup() {
  var addCol = document.querySelector('#addCol');
  addCol.style.display = 'none';
  document.getElementById("tranNum").value = "";
  document.getElementById("memName").value = "";
  document.getElementById("tranDate").value = "";
firstFee = " ";
collectionMenu();
  cancelCollcetion();
}
//=================add Collection=========================================
async function addCollection() {
  if (
    !document.getElementById('tranNum').value ||
    !document.getElementById('tranDate').value ||
    !document.getElementById('collName').value ||
    !document.getElementById('memName').value ||
    !document.getElementById('accountID').value
      ){
          alert("Fields are empty. Please fill in all required fields.");
          return;
        }
  const querySnapshot = await getDocs(query(collection(db, 'Members'), where('memberName', '==', document.getElementById('memName').value)));
  querySnapshot.forEach((doc) => {
      const memberData = doc.data();
      const memberStatus = memberData.memberStatus.toLowerCase();
       lotAmortVal = memberData.lotAmort;
      if ( memberStatus !== "active") {
          alert("The member is currently INACTIVE");
          return;
      }
  });
  if (querySnapshot.empty) {
      alert("Member not found");
  }
  const checkedRows = Array.from(document.querySelectorAll('#colCat table input[type="checkbox"]:checked'));
  const dataToAdd = {
      TransactionNum: document.getElementById('tranNum').value, 
      Date: document.getElementById('tranDate').value,
      Collector: document.getElementById('collName').value, 
      Member: document.getElementById('memName').value,
      accountID: document.getElementById('accountID').value,
      TotalFee: totalFee,
      lotAmortBal: lotAmortVal,
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
        alert("Data addition cancelled by user.");
    }
  }
}

  //===============================Search Bar======================================================

//================================View Collection==================================================================
function viewCollection(data) {
    const addCol = document.querySelector('#viewCollection');
    if (addCol.style.display === 'none' || addCol.style.display === '') {
        addCol.style.display = 'block';
        document.getElementById('cdTransactionNumber').value = data.TransactionNum;
        document.getElementById('accountIDView').value = data.accountID;
        document.getElementById('cdMemberName').value = data.Member;
        document.getElementById('cdCollectorName').value = data.Collector;
        document.getElementById('cdTranDate').value = data.Date;
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
    }else{
        addCol.style.display = 'none';
    }
}
//==================================tranfer RecyCOllection========================================
cancel.addEventListener("click", () => {
  closePopup();
});
popupMenu.addEventListener("click", togglePopup);
add.addEventListener("click", addCollection);
viewColCancel.addEventListener("click", () => {
    var addCol = document.querySelector('#viewCollection');
    addCol.style.display = 'none';
});


async function getAllContactNumbers() {
  try {
    // Reference to the "Members" collection
    const membersCollectionRef = collection(db, "Members");

    // Get a snapshot of all documents in the collection
    const querySnapshot = await getDocs(membersCollectionRef);

    // Iterate through each document in the snapshot
    querySnapshot.forEach((doc) => {
      // Get the data of the document
      const data = doc.data();

      // Check if the document has a "contactNum" property
      if (data && data.contactNum) {
        // Replace leading "0" with "+63" and add to the global variable
        const formattedContactNum = data.contactNum.replace(/^0/, '+63');
        allContactNumbers.push(formattedContactNum);
      }
    });

    // Log the global variable for demonstration purposes
    console.log("All Contact Numbers:", allContactNumbers);

    // You can use the "allContactNumbers" array in other parts of your code
  } catch (error) {
    console.error("Error getting contact numbers:", error);
  }
}


async function sendSMS() {
  await getAllContactNumbers();
  if (confirm("Send the notice manually?")) {
    console.log("send");
  } else {
    alert("Canceled.");
    return;
  }
  const messageBody = document.getElementById('messageBody').value;
  const accountSid = 'AC9822d43e56372f236f136adf4230d182';
  const authToken = '58cccb1bb1bee61842e2af5fd68487d8';
  const twilioNumber = '+12679152818';
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${accountSid}:${authToken}`));
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const sanitizedNumbers = allContactNumbers.map(number => number.replace(/\D/g, '')); // Remove non-numeric characters
console.log(sanitizedNumbers);
  const params = new URLSearchParams();
  params.append('To', sanitizedNumbers.join(',')); // Pass a comma-separated string of sanitized numbers
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
      alert("Notice Sent.");
      console.log('SMS sent successfully:', responseData);
    } else {
      const errorData = await response.json();
      console.error('Error sending SMS:', errorData);
      alert("Notice Not Sent.");
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
  poppop();
}
function poppop() {
  var pop = document.querySelector('#smsForm');
  if (pop.style.display === 'none' || pop.style.display === '') {
    pop.style.display = 'block';
    document.getElementById("sendNotice").textContent = "Close"
  } else {
    pop.style.display = 'none';
    document.getElementById("sendNotice").textContent = "Send Notice"
  }
  } 

  async function automaticSMS() {
    await getAllContactNumbers();
    const messageBody = document.getElementById('messageBody').value;
    const accountSid = 'AC9822d43e56372f236f136adf4230d182';
    const authToken = '58cccb1bb1bee61842e2af5fd68487d8';
    const twilioNumber = '+12679152818';
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(`${accountSid}:${authToken}`));
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
  
    const sanitizedNumbers = allContactNumbers.map(number => number.replace(/\D/g, '')); // Remove non-numeric characters
  console.log(sanitizedNumbers);
    const params = new URLSearchParams();
    params.append('To', sanitizedNumbers.join(',')); // Pass a comma-separated string of sanitized numbers
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
        alert("Notice Sent.");
        console.log('SMS sent successfully:', responseData);
      } else {
        const errorData = await response.json();
        console.error('Error sending SMS:', errorData);
        alert("Notice Not Sent.");
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
    poppop();
  }
  function updateCountdown() {
    let now = new Date();
    let targetDate;
  
    if (now.getDate() >= 20) {
      // If the current date is on or after the 20th, set the target date to the 20th of the next month
      targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 20);
    } else {
      // If the current date is before the 20th, set the target date to the 20th of the current month
      targetDate = new Date(now.getFullYear(), now.getMonth(), 20);
    }
  
    let timeRemaining = targetDate.getTime() - now.getTime();
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    // Display remaining days and hours
    document.getElementById("countD").value = `${days} Days ${hours} Hours  ${minutes} Minutes`;

    if (now.getDate() === 20) {
      automaticSMS();
    }
  }
  
  // Initial call to set the initial countdown
  updateCountdown();
  
  // Set up an interval to update the countdown every minute
  setInterval(updateCountdown, 60000);

  async function displayName(next = true) {
    const bleta = document.getElementById('trans');
    const collectionRef = collection(db, "CollectionList");
    let queryCol;
    const totalDocumentsSnapshot = await getDocs(collectionRef);
    const totalDocuments = totalDocumentsSnapshot.size;
    let maxPages = Math.ceil(totalDocuments / pageSize);
    const searchBarValue = document.getElementById('searchBar').value.trim().toLowerCase();
  
    if (next && lastVisible && currentPage < maxPages) {
      queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), startAfter(lastVisible), limit(pageSize));
      currentPage++;
    } else if (!next && firstVisible && currentPage > 1) {
      queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), endBefore(firstVisible), limitToLast(pageSize));
      currentPage--;
    } else {
      queryCol = query(collectionRef, orderBy("TransactionNum", "desc"), limit(pageSize));
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
        // Filter based on the searchBar value
        const memberNameLowercase = data.Member.toLowerCase();
        if (memberNameLowercase.includes(searchBarValue)) {
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

document.getElementById("reset").addEventListener('click', displayCollection);
document.getElementById("find").addEventListener('click', displayName);
document.getElementById("send").addEventListener('click', sendSMS);
document.getElementById("sendNotice").addEventListener('click', poppop);
document.getElementById("closeForm").addEventListener('click', poppop);