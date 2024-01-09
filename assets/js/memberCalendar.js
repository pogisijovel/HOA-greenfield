import {getDocs, query, where,addDoc,collection} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
const requestDB = collection(db, "EventRequest");
const eventDB = collection(db, "EventDatabase");
const eventsSnapshot = await getDocs(collection(db, 'EventDatabase'));
const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventBtn = document.querySelector(".add-event"),
  addEventWrapper = document.querySelector(".add-event-wrapper "),
  addEventCloseBtn = document.querySelector(".close "),
  addEventTitle = document.querySelector(".event-name "),
  addEventFacility = document.querySelector(".event-facility "),
  addReservedBy = document.querySelector(".event-reservedBy "),
  addEventFrom = document.querySelector(".event-time-from "),
  addEventTo = document.querySelector(".event-time-to "),
  addEventSubmit = document.querySelector(".add-event-btn "),
  addEventClear = document.querySelector(".clear-event-btn ");
let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
document.querySelectorAll('input[type="number"]').forEach(function(input) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });
});
const eventsArr = [];
getEvents();
console.log(eventsArr);
//function to add days in days with class day and prev-date next-date on previous month and next month days and active on today
function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;
  date.innerHTML = months[month] + " " + year;
  let days = "";
  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }
  for (let i = 1; i <= lastDate; i++) {
    //check if event is present on that day
    let event = false;
    eventsArr.forEach((eventObj) => {
      if (
        eventObj.day === i &&
        eventObj.month === month + 1 &&
        eventObj.year === year
      ) {
        event = true;
      }
    });
    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
      if (event) {
        days += `<div class="day today active event">${i}</div>`;
      } else {
        days += `<div class="day today active">${i}</div>`;
      }
    } else {
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day ">${i}</div>`;
      }
    }
  }
  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListner();
}
//function to add month and year on prev and next button
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}
function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}
prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);
initCalendar();
//function to add active on day
function addListner() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      getActiveDay(e.target.innerHTML);
      updateEvents(Number(e.target.innerHTML));
      activeDay = Number(e.target.innerHTML);
      //remove active
      days.forEach((day) => {
        day.classList.remove("active");
      });
      //if clicked prev-date or next-date switch to that month
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        //add active to clicked day afte month is change
        setTimeout(() => {
          //add active where no prev-date or next-date
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        //add active to clicked day afte month is changed
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}
todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});
dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  if (e.inputType === "deleteContentBackward") {
    if (dateInput.value.length === 3) {
      dateInput.value = dateInput.value.slice(0, 2);
    }
  }
});
gotoBtn.addEventListener("click", gotoDate);
function gotoDate() {
  console.log("here");
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  alert("Invalid Date");
}
//function get active day day name and date and update eventday eventdate
function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;
}
async function updateEvents(date) {
  let events = "";
  const q = query(eventDB, where("date", "==", date));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      const eventData = doc.data();
      if (eventData && eventData.title && eventData.facility && eventData.time) {
        const eventId = doc.id;
        events += `<div class="event" data-event-id="${eventId}">
        <div class="title">
          <div class="title-info">
            <h3 class="event-title">Title:  ${eventData.title}</h3>
            <h3 class="event-facility">Facility: ${eventData.facility}</h3>
          </div>
          <h3 class="event-reservedBy">Reserved By: ${eventData.reservedBy}</h3>
        </div>
        <div class="event-time">
          <span class="event-time">${eventData.time}</span>
        </div>
      </div>`;
      } else {
        console.error("Invalid event data structure:", eventData);
      }
    });
  }
  if (events === "") {
    events = `<div class="no-event">
            <h3>No Events</h3>
        </div>`;
  }
  eventsContainer.innerHTML = events;
  const eventDivs = document.querySelectorAll('.event');
  eventDivs.forEach((eventDiv) => {
    eventDiv.removeEventListener('click', handleEventClick);
  });
  eventDivs.forEach((eventDiv) => {
    eventDiv.addEventListener('click', handleEventClick);
  });
  function handleEventClick() {
    const eventId = this.dataset.eventId;
  }
}
//function to add event
addEventBtn.addEventListener("click", () => {
  addEventWrapper.classList.toggle("active");
});
addEventCloseBtn.addEventListener("click", () => {
  addEventWrapper.classList.remove("active");
});
document.addEventListener("click", (e) => {
  if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
    addEventWrapper.classList.remove("active");
  }
});
//allow 50 chars in eventtitle
addEventTitle.addEventListener("input", (e) => {
  addEventTitle.value = addEventTitle.value.slice(0, 60);
});
addEventFacility.addEventListener("input", (e) => {
  addEventFacility.value = addEventFacility.value.slice(0, 60);
});
//function to add event to eventsArr
addEventSubmit.addEventListener("click", async () => {
  const eventTitle = addEventTitle.value;
  const eventFacility = addEventFacility.value;
  const eventReservedBy = addReservedBy.value;
  const eventTimeFrom = addEventFrom.value;
  const eventTimeTo = addEventTo.value;
  if (eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "" || eventFacility === "") {
    alert("Please fill all the fields");
    return;
  }
  const timeFrom = convertTime(eventTimeFrom);
  const timeTo = convertTime(eventTimeTo);
  const fullDate = formatDate(activeDay, month, year);
  let eventExist = false;
  eventsArr.forEach((event) => {
    if (event.day === activeDay && event.month === month + 1 && event.year === year) {
      event.events.forEach((event) => {
        if (event.title === eventTitle) {
          eventExist = true;
        }
      });
    }
  });
  if (eventExist) {
    alert("Event already added");
    return;
  }
  const querySnapshot = await getDocs(collection(db, "EventDatabase"));
  let facilityExist = false;
  let timeFromExist = false;
  let timeToExist = false;
  querySnapshot.forEach((doc) => {
    if (doc.data().facility === eventFacility) {
      facilityExist = true;
    }
    if (doc.data().timeFrom === timeFrom) {
      timeFromExist = true;
    }
    if (doc.data().timeTo === timeTo) {
      timeToExist = true;
    }
  });
  if (timeFromExist == true && timeToExist == true && facilityExist == true) {
    alert("The time you selected is reserved already.");
    return;
  }
  const newEvent = {
    date: activeDay,
    fullDate: fullDate,
    title: eventTitle,
    facility: eventFacility,
    reservedBy: eventReservedBy,
    time: timeFrom + " - " + timeTo,
    timeFrom: timeFrom,
    timeTo: timeTo,
  };
  addDoc(requestDB, newEvent);
  eventsArr.push({
    day: activeDay,
    month: month + 1,
    year: year,
    events: [newEvent],
  });
  console.log(eventsArr);
  addEventWrapper.classList.remove("active");
  addEventTitle.value = "";
  addEventFacility.value = "";
  addReservedBy.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
  updateEvents(activeDay);
  const activeDayEl = document.querySelector(".day.active");
  if (!activeDayEl.classList.contains("event")) {
    activeDayEl.classList.add("event");
  }
});
function formatDate(date, month, year) {
  const monthNumber = String(month + 1).padStart(2, '0');
  return `${year} ${monthNumber} ${date}`;
}
addEventClear.addEventListener("click", () => {
  addEventFrom.value = "";
  addEventTo.value = "";
} )
async function getEvents() {
  const eventsSnapshot = await getDocs(eventDB);
  if (eventsSnapshot.size > 0) {
    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      if (eventData.events) {
        eventsArr.push(...eventData.events);
      }
    });
  }
}
function convertTime(time) {
  //convert time to 24 hour format
  let timeArr = time.split(":");
  let timeHour = timeArr[0];
  let timeMin = timeArr[1];
  let timeFormat = timeHour >= 12 ? "PM" : "AM";
  timeHour = timeHour % 12 || 12;
  time = timeHour + ":" + timeMin + " " + timeFormat;
  return time;
}