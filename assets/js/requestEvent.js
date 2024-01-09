import { doc,getDocs,collection,deleteDoc, addDoc, getDoc, setDoc, query, where  } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
const eventDB = collection(db, "EventDatabase");
const eventReq = collection(db, "EventRequest");
var button = document.getElementById('cal');
const eventsTable = document.getElementById("eventsTable").getElementsByTagName('tbody')[0];;
document.addEventListener('DOMContentLoaded', (event) => {
  displayRequestEvent();
  
});
document.getElementById('selecB').addEventListener("click", displayRequestEvent);
document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });
});

async function displayQueryDate() {
  const facilitySelect = document.getElementById("facility");
  const selectedFacility = facilitySelect.value;
  const trans = document.getElementById("reqTable").getElementsByTagName('tbody')[0];
  while (trans.rows.length > 0) {
    trans.deleteRow(0);
  }
  try {
    const currentDate = new Date(); // Get the current date and time

    const querySnapshot = await getDocs(eventDB);
    let eventsFound = false;
    const events = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (selectedFacility == data.facility) {
        // Parse the event date and time
        const eventDateTime = new Date(`${data.datetime} ${data.timeFrom}`);
        
        // Check if the event date is in the future
        if (eventDateTime > currentDate) {
          eventsFound = true;
          events.push({
            facility: data.facility,
            date: data.datetime,
            timeFrom: format12HourTime(data.timeFrom),
            timeTo: format12HourTime(data.timeTo),
          });
        }
      }
    });
    events.sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.timeFrom}`);
      const timeB = new Date(`2000-01-01 ${b.timeFrom}`);
      return timeA - timeB;
    });
    events.forEach((event) => {
      const row = trans.insertRow(-1);
      const facilityCell = row.insertCell(0);
      facilityCell.textContent = event.facility;
      const date = row.insertCell(1);
      date.textContent = event.date;
      const timeFromCell = row.insertCell(2);
      timeFromCell.textContent = event.timeFrom;
      const timeToCell = row.insertCell(3);
      timeToCell.textContent = event.timeTo;
    });
    if (!eventsFound) {
      const row = trans.insertRow(-1);
      const noEventsCell = row.insertCell(0);
      noEventsCell.colSpan = 4;
      noEventsCell.textContent = "No events scheduled for this date.";
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

async function displayRequestEvent() {
  displayQueryDate()
  try {
    const facilitySelect = document.getElementById("facility");
    const selectedFacility = facilitySelect.value;
    const currentDate = new Date();
    const querySnapshot = await getDocs(query(
      collection(db, 'EventRequest'),
      where('facility', '==', selectedFacility),
      where('datetime', '>=', currentDate.toISOString())
    ));
    while (eventsTable.rows.length > 1) {
      eventsTable.deleteRow(1);
    }
    if (querySnapshot.empty) {
      const noRequestRow = eventsTable.insertRow(-1);
      const noRequestCell = noRequestRow.insertCell(0);
      noRequestCell.textContent = "No reservation Request";
      noRequestCell.colSpan = 7;
    } else {
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const row = eventsTable.insertRow(-1);
        row.style.height = '10px';
        const timeFrom =  format12HourTime(data.timeFrom);
        const timeTo =  format12HourTime(data.timeTo);
        const docId = docSnapshot.id;
        const date = row.insertCell(0);
        date.textContent = data.datetime;
        const nameCell = row.insertCell(1);
        nameCell.textContent = data.name;
        const facility = row.insertCell(2);
        facility.textContent = data.facility;
        const reservedBy = row.insertCell(3);
        reservedBy.textContent = data.contNum;
        const time = row.insertCell(4);
        time.textContent = `${timeFrom} - ${timeTo}`;
        const acceptCell = row.insertCell(5);
        const acceptButton = document.createElement("button");
        acceptButton.textContent = "Confirm";
        acceptButton.addEventListener("click", () => acceptEvent(data, docId));
        acceptCell.appendChild(acceptButton);
        const rejectCell = row.insertCell(6);
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

function format12HourTime(timeString) {
  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = timeParts[1];
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}
async function checkTimeAvailability(data) {
  const reservationsRef = collection(db, "EventDatabase");
  const queryRef = query(
      reservationsRef,
      where("facility", "==", data.facility),
      where("datetime", "==", data.datetime),
  );
  const querySnapshot = await getDocs(queryRef);
  const isTimeAvailable = querySnapshot.docs.every(doc => {
      const { timeFrom: docTimeFrom, timeTo: docTimeTo } = doc.data();
      return data.timeTo <= docTimeFrom || data.timeFrom >= docTimeTo;
  });
  return isTimeAvailable;
}

  async function acceptEvent(data, docId) {
    const userConfirmed = confirm("Do you want to confirm this request?");
        if (!userConfirmed) {
            return;
        }

    const isTimeAvailable = await checkTimeAvailability(data);
    if (!isTimeAvailable) {
        alert('The selected time range is not available for the facility.');
        return;
    }
    try {
        await addDoc(eventDB, data);
        sendReservationSMS(data);
        alert("Event Confirmed.");
        await deleteDoc(doc(eventReq, docId));
        displayRequestEvent();
    } catch (error) {
        console.error("Error accepting event: ", error);
    }
}
async function confirmReject(data, docId ) {
  const confirmation = confirm("Are you sure you want to reject this event?");
  if (confirmation) {
      console.log("Document ID to be deleted:", docId);
    try {
      const eventRef = doc(eventReq, docId);
      await deleteDoc(eventRef);
      alert("Event Rejected.");
      console.log("Event deleted");
      displayRequestEvent();
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  }
}

async function sendReservationSMS(data) {
  const contactNumber = data.contNum;
  const formattedPhoneNumber = `+63${contactNumber.substring(1)}`;
  const messageBody = `Your request has confirmed. - Facility: ${data.facility}, Date: ${data.datetime}, Time: ${format12HourTime(data.timeFrom)}-${format12HourTime(data.timeTo)}`;
  const accountSid = 'AC9822d43e56372f236f136adf4230d182';
  const authToken = '58cccb1bb1bee61842e2af5fd68487d8';
  const twilioNumber = '+12679152818';
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${accountSid}:${authToken}`));
  headers.set('Content-Type', 'application/x-www-form-urlencoded');
  const params = new URLSearchParams();
  params.append('To', formattedPhoneNumber);
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

button.addEventListener('click', function() {
    window.open('newReservation.html', '_blank');
});
