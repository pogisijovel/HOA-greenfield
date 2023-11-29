import { doc,getDocs,collection,deleteDoc, addDoc, getDoc, setDoc, query, where  } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { db } from "../credentials/firebaseModule.js";

const eventDB = collection(db, "EventDatabase");
const eventReq = collection(db, "EventRequest");

var button = document.getElementById('cal');

const eventsTable = document.getElementById("eventsTable");

document.addEventListener('DOMContentLoaded', (event) => {
  displayEvent()
  
});

document.getElementById('selecB').addEventListener("click", displayEvent);

document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    // Check if the pressed key is an arrow key (left, up, right, down)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Prevent the default behavior of arrow keys
      e.preventDefault();
    }
  });
});
async function displayEvent() {
  try {
    const facilitySelect = document.getElementById("facility");
    const selectedFacility = facilitySelect.value; // Get the selected facility value

    // Modify the query to filter based on the selected facility and future dates
    const currentDate = new Date();
    const querySnapshot = await getDocs(query(
      collection(db, 'EventRequest'),
      where('facility', '==', selectedFacility),
      where('datetime', '>=', currentDate.toISOString())
    ));

    // Clear the table
    while (eventsTable.rows.length > 1) {
      eventsTable.deleteRow(1);
    }

    if (querySnapshot.empty) {
      // If there are no reservation requests, display a message
      const noRequestRow = eventsTable.insertRow(-1);
      const noRequestCell = noRequestRow.insertCell(0);
      noRequestCell.textContent = "No reservation Request";
      noRequestCell.colSpan = 7;
    } else {
      // If there are reservation requests, populate the table
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const row = eventsTable.insertRow(-1); // Add a new row to the table

        // Get the document ID
        const docId = docSnapshot.id;

        // Populate the row with event information
        const date = row.insertCell(0);
        date.textContent = data.datetime;

        const facility = row.insertCell(1);
        facility.textContent = data.facility;

        const reservedBy = row.insertCell(2);
        reservedBy.textContent = data.name;

        const time = row.insertCell(3);
        time.textContent = `${data.timeFrom} - ${data.timeTo}`;

        const acceptCell = row.insertCell(4);
        const acceptButton = document.createElement("button");
        acceptButton.textContent = "Confirm";
        acceptButton.addEventListener("click", () => acceptEvent(data, docId));
        acceptCell.appendChild(acceptButton);

        const rejectCell = row.insertCell(5);
        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.addEventListener("click", () => confirmReject(data, docId));
        rejectCell.appendChild(rejectButton);
      });
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}



  async function acceptEvent(data, docId) {
    try {
        // Add the event data to the Event Database
        await addDoc(eventDB, data);
        
        // Remove the accepted event from the Event Request collection
        await deleteDoc(doc(eventReq, docId));

        // Refresh the table to reflect the changes
        displayEvent();
    } catch (error) {
        console.error("Error accepting event: ", error);
    }
}


async function confirmReject(data, docId ) {
    const confirmation = confirm("Are you sure you want to reject this event?");
    if (confirmation) {
        console.log("Document ID to be deleted:", docId);
      try {
        // Delete the event document from the "EventRequest" collection in your Firestore database
        const eventRef = doc(eventReq, docId);
        await deleteDoc(eventRef);
  
        console.log("Event deleted");
        displayEvent();
        
      } catch (error) {
        console.error("Error deleting event: ", error);
      }
    }
  }
  

  

// Add a click event listener to the button
button.addEventListener('click', function() {
    window.open('newReservation.html', '_blank');
});


