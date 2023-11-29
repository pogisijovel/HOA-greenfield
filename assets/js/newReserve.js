import { doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
// import { accountSid, authToken, twilioPhoneNumber } from '../credentials/twillio.js';

const EventDB = collection(db, "EventRequest");
const eventAproveDB = collection(db, "EventDatabase");


let date;

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        weekNumbers: false,
        contentHeight: 'auto',
        selectable: true,
        select: function(info) {
            // Check if the selected date is in the past
            var selectedDate = new Date(info.startStr);
            var currentDate = new Date();
            
            if (selectedDate < currentDate) {
                // Do not allow the selection of past dates
                alert('Cannot select the current and past dates.');
            } else {
                // Set the selected date on the form
                document.getElementById('datetime').value = info.startStr;

                // Clear time fields when a new date is selected
                document.getElementById('timeFrom').value = '';
                document.getElementById('timeTo').value = '';

                const select = info.startStr;
                date = info.startStr;

                displayQueryDate(select);
            }
        },

    });

    calendar.render();
});

async function displayQueryDate(select) {
    // Clear existing rows in the table
    const trans = document.getElementById("reqTable");
    while (trans.rows.length > 1) {
        trans.deleteRow(1);
    }

    try {
        const querySnapshot = await getDocs(eventAproveDB);

        let eventsFound = false; // Flag to track if events are found for the selected date

        const events = []; // Array to store events

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();

            if (select == data.datetime) {
                eventsFound = true; // Set the flag to true since events are found

                events.push({
                    facility: data.facility,
                    date: data.datetime,
                    timeFrom: format12HourTime(data.timeFrom),
                    timeTo: format12HourTime(data.timeTo),
                });
            }
        });

        // Sort events by timeFrom and timeTo in ascending order
        events.sort((a, b) => {
            const timeA = new Date(`2000-01-01 ${a.timeFrom}`);
            const timeB = new Date(`2000-01-01 ${b.timeFrom}`);
            return timeA - timeB;
        });

        // Display sorted events in the table
        events.forEach((event) => {
            const row = trans.insertRow(-1); // Add a new row to the table

            // Populate the row with the desired fields
            const facilityCell = row.insertCell(0);
            facilityCell.textContent = event.facility;

            const date = row.insertCell(1);
            date.textContent = event.date;

            const timeFromCell = row.insertCell(2);
            timeFromCell.textContent = event.timeFrom;

            const timeToCell = row.insertCell(3);
            timeToCell.textContent = event.timeTo;
        });

        // If no events are found, display a message in the table
        if (!eventsFound) {
            const row = trans.insertRow(-1);
            const noEventsCell = row.insertCell(0);
            noEventsCell.colSpan = 4; // Span across all columns
            noEventsCell.textContent = "No events scheduled for this date.";
        }

    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}


// async function displayQueryDate(select) {
//     // Clear existing rows in the table
//     const trans = document.getElementById("reqTable");
//     while (trans.rows.length > 1) {
//         trans.deleteRow(1);
//     }

//     try {
//         const querySnapshot = await getDocs(EventDB);

//         let eventsFound = false; // Flag to track if events are found for the selected date

//         querySnapshot.forEach((docSnapshot) => {
//             const data = docSnapshot.data();

//             if (select == data.datetime) {
//                 eventsFound = true; // Set the flag to true since events are found

//                 const row = trans.insertRow(-1); // Add a new row to the table

//                 // Populate the row with the desired fields
//                 const facilityCell = row.insertCell(0);
//                 facilityCell.textContent = data.facility;

//                 const date = row.insertCell(1);
//                 date.textContent = data.datetime;

//                 const timeFromCell = row.insertCell(2);
//                 timeFromCell.textContent = format12HourTime(data.timeFrom);

//                 const timeToCell = row.insertCell(3);
//                 timeToCell.textContent = format12HourTime(data.timeTo);
//             }
//         });

//         // If no events are found, display a message in the table
//         if (!eventsFound) {
//             const row = trans.insertRow(-1);
//             const noEventsCell = row.insertCell(0);
//             noEventsCell.colSpan = 4; // Span across all columns
//             noEventsCell.textContent = "No events scheduled for this date.";
//         }

//     } catch (error) {
//         console.error("Error fetching data: ", error);
//     }
// }

// Function to format a time string to 12-hour clock format
function format12HourTime(timeString) {
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];

    // Use modulo 12 to convert hours to 12-hour format
    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}


    

document.getElementById('subB').addEventListener('click', addReq);


async function addReq () {
    let contNum = document.getElementById('contNum').value;
    let facility = document.getElementById('facility').value;
    let datetime = document.getElementById('datetime').value;
    let timeFrom = document.getElementById('timeFrom').value;
    let timeTo = document.getElementById('timeTo').value;
    


    // Convert timeFrom and timeTo to 24-hour clock format
    timeFrom = convertTo24HourFormat(timeFrom);
    timeTo = convertTo24HourFormat(timeTo);
    
    console.log('Facility:', facility);
    console.log('Datetime:', datetime);
    console.log('Time From:', timeFrom);
    console.log('Time To:', timeTo);

    // Check if any of the required fields is empty
     if (!facility || !datetime || !timeFrom || !timeTo || !contNum) {
        alert('Please fill in all fields.');
        return;
    }

   
    const isTimeAvailable = await checkTimeAvailability(facility, datetime, timeFrom, timeTo);

    if (!isTimeAvailable) {
        alert('The selected time range is not available for the facility.');
        return;
    }

    // Create a reservation object
    const reservation = {
        contNum: contNum,
        facility: facility,
        datetime: datetime,
        timeFrom: timeFrom,
        timeTo: timeTo,
    };

    // Add the reservation to the Firestore collection
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
function convertTo24HourFormat(time) {
    const timeComponents = time.split(':');

    if (timeComponents.length !== 2) {
        console.error('Invalid time format:', time);
        return null; // Or handle the error in a way that makes sense for your application
    }

    let [hours, minutes] = timeComponents;

    hours = parseInt(hours, 10);

    if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time format:', time);
        return null; // Or handle the error
    }

    // No need to check for AM/PM since we're removing it

    // If the original time was in PM and not 12:00 PM, add 12 hours
    if (hours < 12 && time.toLowerCase().includes('pm')) {
        hours += 12;
    }

    // If the original time was in AM and 12:00 AM, set hours to 0
    if (hours === 12 && time.toLowerCase().includes('am')) {
        hours = 0;
    }

    return `${hours}:${minutes}`;
}


async function checkTimeAvailability(facility, datetime, timeFrom, timeTo) {
    const reservationsRef = collection(db, "EventDatabase");
    const queryRef = query(
        reservationsRef,
        where("facility", "==", facility),
        where("datetime", "==", datetime),
    );

    const querySnapshot = await getDocs(queryRef);

    // Check for overlapping time ranges
    const isTimeAvailable = querySnapshot.docs.every(doc => {
        const { timeFrom: docTimeFrom, timeTo: docTimeTo } = doc.data();
        return timeTo <= docTimeFrom || timeFrom >= docTimeTo;
    });

    return isTimeAvailable;
}

document.querySelectorAll('input[type="number"]').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      // Check if the pressed key is an arrow key (left, up, right, down)
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Prevent the default behavior of arrow keys
        e.preventDefault();
      }
    });
  });

async function sendReservationSMS(contactNumber, facility, datetime, timeFrom, timeTo) {
    // Format the contact number to "+639959831815" format
    const formattedPhoneNumber = `+63${contactNumber.substring(1)}`;
  
    const messageBody = `Please wait for confirmation for your request. - Facility: ${facility}, Date: ${datetime}, Time: ${timeFrom}-${timeTo}`;
  
    // Replace with your Twilio Account SID, Auth Token, and Twilio phone number
    const accountSid = 'ACe50e033216d90c3030623d808fbcdc48';
    const authToken = '422c0436abd710008976da59fcca53cb';
    const twilioNumber = '+15097132957';
  
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
    // Create the Authorization header
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(`${accountSid}:${authToken}`));
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
  
    // Create the request body
    const params = new URLSearchParams();
    params.append('To', formattedPhoneNumber);
    params.append('From', twilioNumber);
    params.append('Body', messageBody);
  
    try {
      // Make the API request
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
          td = tr[i].getElementsByTagName('td')[0]; // Change index to the column you want to filter (0 for the first column, 1 for the second, and so on)
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