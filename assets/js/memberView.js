import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { doc, getDoc,getDocs, setDoc,collection, updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast,} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db, auth } from "../credentials/firebaseModule.js";
const viewColCancel = document.getElementById("viewColCancel");
const cancelB = document.getElementById("cancel");
const eventB = document.getElementById("sendBB");
const logoutB = document.getElementById("logout");
const statusButton = document.getElementById("statusButton");
let currentPage = 1; 
const pageSize = 10; 
let lastVisible = null; 
let firstVisible = null; 
const urlParams = new URLSearchParams(window.location.search);
const Name = urlParams.get("memberName");
document.addEventListener('DOMContentLoaded', (event) => {
  displayCollection(); 
  createPaginationControls();
});
document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });
});
onAuthStateChanged(auth, (user) => {
  if (!user) {
    redirectToLogin();
  }
});
const logout = async () => {
  const url = "http://127.0.0.1:5501"; // Adjust the port if necessary
  await signOut(auth);
  window.location.href = url;
};
function redirectToLogin() {
  const url = "http://127.0.0.1:5501";
  signOut(auth);
  window.location.href = url;
}
//==================member=======================================
let globalDocId;
const membersCollectionRef = collection(db, "Members");
const q = query(membersCollectionRef, where("memberName", "==", Name));
try {
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    document.getElementById("accointID").value = data.accountID;
    document.getElementById("name").value = data.memberName;
    document.getElementById("cont").value = data.contactNum;
    document.getElementById("category").value = data.memberCategory;
    document.getElementById("statusButton").textContent = data.memberStatus;
    document.getElementById("recipientNumber").value = '+63' + data.contactNum.substring(1);
    document.getElementById("balance").value = parseFloat(data.lotAmort).toFixed(2);
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
//===============================================================================================================================================
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
//===============================================================================================================================================
function viewCollection(data) {
  const addCol = document.querySelector('#viewCollection');
  if (addCol.style.display === 'none' || addCol.style.display === '') {
    addCol.style.display = 'block';
    document.getElementById('cdTransactionNumber').value = data.TransactionNum;
    document.getElementById('cdAccointIDVal').value = data.accountID;
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
    const newRow = table.insertRow(-1);
    const totalFeeCell = newRow.insertCell(0);
    totalFeeCell.colSpan = 3; 
    totalFeeCell.textContent = `Total Fee: ${data.TotalFee}`;
  } else {
    addCol.style.display = 'none';
  }
}
//===============================================================================================================================================
//===============================================================================================================================================
viewColCancel.addEventListener("click", () => {
  var addCol = document.querySelector('#viewCollection');
  addCol.style.display = 'none';
});
logoutB.addEventListener("click", logout);
eventB.addEventListener("click", () => {
    const pagePath = "newReservation.html";
    window.open(pagePath, '_blank');
});
