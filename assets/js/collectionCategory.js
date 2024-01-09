import { doc, getDoc,getDocs, setDoc,collection,updateDoc} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
let CollectionID = document.getElementById("CollectionID");
let collectionName = document.getElementById("collectionName");
let Fee = document.getElementById("Fee");
let Status = document.getElementById("Status");
let popCollectionID = document.getElementById("popCollectionID");
let popcollectionName = document.getElementById("popcollectionName");
let popFee = document.getElementById("popFee");
let popStatus = document.getElementById("popStatus");
const addB = document.getElementById("add");
const closeB = document.getElementById("close");
const remove = document.getElementById("remove");
const memberTable = document.getElementById("bleta");
//=======================add===========================================
document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });
});
async function addCategory() {
    const enteredColID = CollectionID?.value;
    if (!enteredColID || !collectionName.value || !Fee.value || !Status.value) {
      alert("Fill all the data before adding new Category.");
      return;
    }
    const docRef = doc(db, "CollectionCategory", enteredColID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      alert("This ID already existed");
      return;
    }
    const data = {
        CollectionID: CollectionID?.value,
        collectionName: collectionName?.value,
        Fee: Fee?.value,
        Status: Status?.value
    };
    try {
      await setDoc(docRef, data);
      alert("Added Successfully");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    fetchAndPopulateTable();
  }
//==============================================Table======================
async function fetchAndPopulateTable() {
    while (memberTable.rows.length > 1) {
      memberTable.deleteRow(1);
    }
    const membersCollection = collection(db, "CollectionCategory");
    try {
      const querySnapshot = await getDocs(membersCollection);
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const row = memberTable.insertRow(-1);
        const idCell = row.insertCell(0);
        idCell.textContent = data.CollectionID;
        const nameCell = row.insertCell(1);
        nameCell.textContent = data.collectionName;
        const feeCell = row.insertCell(2);
        feeCell.textContent = data.Fee;
        const statusCell = row.insertCell(3);
        statusCell.textContent = data.Status;
        const viewCell = row.insertCell(4);
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => fillPopupWithData(data));
        viewCell.appendChild(viewButton);
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  fetchAndPopulateTable();
  //===================popup=================================
  function fillPopupWithData(data) {
    document.getElementById("popCollectionID").value = data.CollectionID;
    document.getElementById("popcollectionName").value = data.collectionName;
    document.getElementById("popFee").value = data.Fee;
    document.getElementById("popStatus").value = data.Status;
    togglePopup();
  }
function togglePopup() {
    var popup = document.querySelector('.popup');
    if (popup.style.display === 'none' || popup.style.display === '') {
        popup.style.display = 'block';
    } else {
        popup.style.display = 'none';
    }
    }
    function closePopup() {
    var popup = document.querySelector('.popup');
    popup.style.display = 'none';
    }
    var closeButton = document.querySelector('.close-btn');
    closeButton.addEventListener('click', closePopup);
  //================ edit collection======================
  function enableEdit() {
    document.getElementById("edit").setAttribute("disabled", "disabled");
    document.getElementById("popStatus").removeAttribute("disabled");
    document.getElementById("popcollectionName").removeAttribute("disabled");
    var saveButton = document.getElementById("save");
    saveButton.removeAttribute("disabled");
    
}
function disableFields() {

    document.getElementById("edit").removeAttribute("disabled");
    document.getElementById("popcollectionName").setAttribute("disabled", "disabled");
    document.getElementById("popStatus").setAttribute("disabled", "disabled");
}

async function updateCAtegory() {
  const docRef = doc(db, "CollectionCategory", popCollectionID?.value);
  const docSnap = await getDoc(docRef);
  const data = {
    CollectionID: popCollectionID?.value,
    collectionName: popcollectionName?.value,
    Fee: popFee?.value,
    Status: popStatus?.value
  };
  if (docSnap.exists()) {
      try {
          await updateDoc(docRef, data);
          alert("Updated Successfully");
          togglePopup();
          disableFields();
          disableSaveButtonEnableEditButton();
      } catch (e) {
          console.error("Error updating document: ", e);
      }
  } else {
      try {
          await setDoc(docRef, data);
          alert("Added Successfully");
      } catch (e) {
          console.error("Error adding document: ", e);
      }
  }
  fetchAndPopulateTable();
  disableFields();
}
function disableSaveButtonEnableEditButton() {
  var editButton = document.getElementById("edit");
  var saveButton = document.getElementById("save");
  editButton.removeAttribute("disabled");
  saveButton.setAttribute("disabled", "disabled");
}
document.getElementById("edit").addEventListener("click", enableEdit);
document.getElementById("save").addEventListener("click", updateCAtegory);
addB.addEventListener("click", addCategory);
closeB.addEventListener("click", closePopup);
  