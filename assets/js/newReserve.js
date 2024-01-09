import { doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";

const EventDB = collection(db, "EventRequest");
const eventAproveDB = collection(db, "EventDatabase");
const accountSid = 'AC9822d43e56372f236f136adf4230d182';
const authToken = '58cccb1bb1bee61842e2af5fd68487d8';
const twilioNumber = '+12679152818';
let date;
const memberRef = collection(db, "Members");


document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        weekNumbers: false,
        contentHeight: 'auto',
        selectable: true,
        select: function(info) {
            var selectedDate = new Date(info.startStr);
            var currentDate = new Date();
            if (selectedDate < currentDate) {
                alert('Cannot select the current and past dates.');
            } else {
                document.getElementById('datetime').value = info.startStr;
                document.getElementById('timeFrom').value = '';
                document.getElementById('timeTo').value = '';
                const select = info.startStr;
                date = info.startStr;
                displayQueryDate(select);
            }
        },
    });
    calendar.render();
    names();
});
async function names(){
    const datalist = document.getElementById("namesList");
    getDocs(memberRef).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const memberName = doc.data().memberName;
        const option = document.createElement("option");
        option.value = memberName;
        datalist.appendChild(option);
      });
    });
    }
    async function queryName() {
      const q = query(memberRef, where("memberName", "==", document.getElementById('name').value));
      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          return docSnap.id; 
        } else {
          console.log("No such document with the provided name!");
          return null;
        }
      } catch (error) {
        console.error("Error getting document by name:", error);
        return null;
      }
    }
async function displayQueryDate(select) {
    const trans = document.getElementById("reqTable");
    while (trans.rows.length > 1) {
        trans.deleteRow(1);
    }
    try {
        const querySnapshot = await getDocs(eventAproveDB);
        let eventsFound = false;
        const events = [];
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            if (select == data.datetime) {
                eventsFound = true;
                events.push({
                    facility: data.facility,
                    date: data.datetime,
                    timeFrom: format12HourTime(data.timeFrom),
                    timeTo: format12HourTime(data.timeTo),
                });
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
function format12HourTime(timeString) {
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}
document.getElementById('subB').addEventListener('click', function() {
    // Disable the button to prevent multiple clicks
    document.getElementById('subB').disabled = true;

    // Call the addReq function
    addReq();

    // Enable the button after 3 seconds
    setTimeout(function() {
        document.getElementById('subB').disabled = false;
    }, 3000); // 3000 milliseconds = 3 seconds
});
async function addReq () {
    const ownerIdRef = await queryName();
    if (!ownerIdRef) {
      alert("You are not a member of this association you cant reserve a facility.");
      return;
    }
    let name = document.getElementById('name').value;
    let contNum = document.getElementById('contNum').value;
    let facility = document.getElementById('facility').value;
    let datetime = document.getElementById('datetime').value;
    let timeFrom = document.getElementById('timeFrom').value;
    let timeTo = document.getElementById('timeTo').value;
    let dateFrom = new Date('2020-01-01 ' + timeFrom);
    let dateTo = new Date('2020-01-01 ' + timeTo);
    timeFrom = convertTo24HourFormat(timeFrom);
    timeTo = convertTo24HourFormat(timeTo);
     if (!facility || !datetime || !timeFrom || !timeTo || !contNum || !name) {
        alert('Please fill in all fields.');
        return;
    }

    if (timeFrom == timeTo) {
        alert('Invalid time range. Please make sure the "From" time is before the "To" time.');
        return;
    }
    if (dateFrom > dateTo) {
        alert('Invalid time range. Please make sure the "From" time is before the "To" time.');
        return false;
    }
    const isTimeAvailable = await checkTimeAvailability(facility, datetime, timeFrom, timeTo);
    if (!isTimeAvailable) {
        alert('The selected time range is not available for the facility.');
        return;
    }

    const isDuplicateTime = await checkDuplicateTime(facility, datetime, timeFrom, timeTo);
    if (isDuplicateTime) {
        const userConfirmed = confirm("The chosen time slot has already been booked by another user. Would you like to proceed with booking this time slot?");
        if (!userConfirmed) {
            return;
        }
    }
    
    const reservation = {
        name: name,
        contNum: contNum,
        facility: facility,
        datetime: datetime,
        timeFrom: timeFrom,
        timeTo: timeTo,
    };
    setDoc(doc(EventDB), reservation)
        .then(() => {
            sendReservationSMS(contNum, facility, datetime, timeFrom, timeTo);
            alert('Reservation submitted successfully!');
        })
        .catch((error) => {
            console.error('Error adding reservation: ', error);
            alert('An error occurred while submitting the reservation.');
        });
}

async function checkDuplicateTime(facility, datetime, timeFrom, timeTo) {
    const reservationsRef = collection(db, "EventRequest");
    const queryRef = query(
        reservationsRef,
        where("facility", "==", facility),
        where("datetime", "==", datetime),
    );
    const querySnapshot = await getDocs(queryRef);

    const isTimeUnavailable = querySnapshot.docs.some(doc => {
        const { timeFrom: docTimeFrom, timeTo: docTimeTo } = doc.data();
        return (timeFrom <= docTimeTo && timeTo >= docTimeFrom);
    });

    return isTimeUnavailable;
}

async function checkTimeAvailability(facility, datetime, timeFrom, timeTo) {
    const reservationsRef = collection(db, "EventDatabase");
    const queryRef = query(
        reservationsRef,
        where("facility", "==", facility),
        where("datetime", "==", datetime),
    );
    const querySnapshot = await getDocs(queryRef);
    const isTimeAvailable = querySnapshot.docs.every(doc => {
        const { timeFrom: docTimeFrom, timeTo: docTimeTo } = doc.data();
        return timeTo <= docTimeFrom || timeFrom >= docTimeTo;
    });
    return isTimeAvailable;
}

function convertTo24HourFormat(time) {
    const timeComponents = time.split(':');
    if (timeComponents.length !== 2) {
        console.error('Invalid time format:', time);
        return null;
    }
    let [hours, minutes] = timeComponents;
    hours = parseInt(hours, 10);
    if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time format:', time);
        return null;
    }
    if (hours < 12 && time.toLowerCase().includes('pm')) {
        hours += 12;
    }
    if (hours === 12 && time.toLowerCase().includes('am')) {
        hours = 0;
    }
    return `${hours}:${minutes}`;
}

document.querySelectorAll('input[type="number"]').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    });
  });
async function sendReservationSMS(contactNumber, facility, datetime, timeFrom, timeTo) {
    const formattedPhoneNumber = `+63${contactNumber.substring(1)}`;
    const messageBody = `Please wait for confirmation for your request. - Facility: ${facility}, Date: ${datetime}, Time: ${format12HourTime(timeFrom)}-${format12HourTime(timeTo)}`;
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
  document.getElementById('queryFac').addEventListener('input', function() {
      var input, filter, table, tr, td, i, txtValue;
      input = document.getElementById('queryFac');
      filter = input.value.toUpperCase();
      table = document.getElementById('reqTable');
      tr = table.getElementsByTagName('tr');
      for (i = 0; i < tr.length; i++) {
          td = tr[i].getElementsByTagName('td')[0];
          if (td) {
              txtValue = td.textContent || td.innerText;
              if (txtValue.toUpperCase().indexOf(filter) > -1) {
                  tr[i].style.display = '';
              } else {
                  tr[i].style.display = 'none';
              }
          }
      }
  });