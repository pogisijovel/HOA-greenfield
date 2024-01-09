import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { auth } from "./firebaseModule.js";
const urlParams = new URLSearchParams(window.location.search);
const signInEmail = urlParams.get("email");
const signInUserType = urlParams.get("userType");
let email = signInEmail;
let userType = signInUserType;
const emailElement = document.getElementById("Email");
const userTypeElement = document.getElementById("userType");
const adminModuleWrapper = document.getElementById("adminModule");
const signOutButton = document.getElementById("signOut");
document.addEventListener('DOMContentLoaded', (event) => {
onLoad();
  });



signOutButton.addEventListener("click", logout);

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (!signInEmail || !signInUserType) {
            redirectToLogin();
            return;
        }
        if (signInUserType === 'staff') {
            adminModuleWrapper.style.display = 'none';
        } else if (signInUserType === 'admin') {
            adminModuleWrapper.style.display = 'block';
        }
        signOutButton.addEventListener('click', logout);
    } else {
        redirectToLogin();
    }
});
function redirectToLogin() {
    const url = 'http://127.0.0.1:5501/';
    signOut(auth);
    window.location.href = url;
}


function onLoad() {
    emailElement.textContent = signInEmail;
    userTypeElement.textContent = signInUserType;
    if (userType === 'staff') {
        adminModuleWrapper.style.display = 'none';
    } else if (userType === 'admin') {
        adminModuleWrapper.style.display = 'block';
    }else {
        disableModules();
    }
}
function disableModules() {
    const modules = [
        'member', 'collectionList', 'property', 'reserve', 'certificateSelect', 'account',
         'individual', 'monthly', 'yearly', 'propertyrep', 'reservation', 'colCat',
    ];
    modules.forEach(moduleId => {
        const moduleElement = document.getElementById(moduleId);
        moduleElement.style.display = 'none';
    });
}




async function logout() {
    try {
        await signOut(auth);
        const url = 'http://127.0.0.1:5501/';
        window.location.replace(url);
    } catch (error) {
        console.error("Error logging out:", error.message);
    }
}


  //start modules  
  document.getElementById('member').addEventListener('click', showMemberDetails);
  document.getElementById('collectionList').addEventListener('click', showCollectionlist);
  document.getElementById('property').addEventListener('click', showProperty);
  document.getElementById('reserve').addEventListener('click', Reservation);
  document.getElementById('certificateSelect').addEventListener('change', handleCertificateSelection);
  document.getElementById('account').addEventListener('click', Account);
  document.getElementById('colCat').addEventListener('click', collectionCat);
  document.getElementById('signOut').addEventListener('click', logout);
  document.getElementById('individual').addEventListener('click', individualRep);
  document.getElementById('monthly').addEventListener('click', monthlyRep);
  document.getElementById('yearly').addEventListener('click', yearlyRep);
  document.getElementById('propertyrep').addEventListener('click', propertyRep);
  document.getElementById('reservation').addEventListener('click',reservationRep);
//end modules
function reservationRep() {
    if (activeIframe) { 
        activeIframe.style.display = 'none';
    }
    var reservationRep = document.querySelector('.reservationRep-iframe-wrapper');
    reservationRep.style.display = 'block';
    reservationRep.style.width = '100%';
    var propertyIframe = document.getElementById('reservationRep-iframe');
    propertyIframe.src = 'reportReservation.html';
    activeIframe = reservationRep;
    }
function propertyRep() {
    if (activeIframe) {
        activeIframe.style.display = 'none';
    }
    var propertyRep = document.querySelector('.propertyRep-iframe-wrapper');
    propertyRep.style.display = 'block';
    propertyRep.style.width = '100%';
    var propertyIframe = document.getElementById('propertyRep-iframe');
    propertyIframe.src = 'reportProperty.html';
    activeIframe = propertyRep;
    }
function yearlyRep() {
    if (activeIframe) {
        activeIframe.style.display = 'none';
    }
    var yearlyRep = document.querySelector('.yearlyRep-iframe-wrapper');
    yearlyRep.style.display = 'block';
    yearlyRep.style.width = '100%';
    var propertyIframe = document.getElementById('yearlyRep-iframe');
    propertyIframe.src = 'reportYearly.html';
    activeIframe = yearlyRep;
    }
function monthlyRep() {
    if (activeIframe) {
        activeIframe.style.display = 'none';
    }
    var monthlyRep = document.querySelector('.monthlyRep-iframe-wrapper');
    monthlyRep.style.display = 'block';
    monthlyRep.style.width = '100%';
    var propertyIframe = document.getElementById('monthlyRep-iframe');
    propertyIframe.src = 'reportMonthly.html';
    activeIframe = monthlyRep;
    }
function individualRep() {
    if (activeIframe) {
        activeIframe.style.display = 'none';
    }
    var individualRep = document.querySelector('.individualRep-iframe-wrapper');
    individualRep.style.display = 'block';
    individualRep.style.width = '100%';
    var propertyIframe = document.getElementById('individualRep-iframe');
    propertyIframe.src = 'reportIndividual.html';
    activeIframe = individualRep;
    }
    function collectionCat() {
        if (activeIframe) {
            activeIframe.style.display = 'none';
        }
        var colCat = document.querySelector('.colCat-iframe-wrapper');
        colCat.style.display = 'block';
        colCat.style.width = '100%';
        var propertyIframe = document.getElementById('colCat-iframe');
        propertyIframe.src = 'collectionCategory.html';
        activeIframe = colCat;
        }
    function reservationReport() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var reservationReport = document.querySelector('.reservationReport-iframe-wrapper');
            reservationReport.style.display = 'block';
            reservationReport.style.width = '100%';
            var propertyIframe = document.getElementById('reservationReport-iframe');
            propertyIframe.src = 'reportReservation.html';
            activeIframe = reservationReport;
            }
    function propertyReport() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var collectionReport = document.querySelector('.collectionReport-iframe-wrapper');
            collectionReport.style.display = 'block';
            collectionReport.style.width = '100%';
            var propertyIframe = document.getElementById('collectionReport-iframe');
            propertyIframe.src = 'reportProperty.html';
            activeIframe = collectionReport;
            }
    function collectionListReport() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var collectionReport = document.querySelector('.collectionReport-iframe-wrapper');
            collectionReport.style.display = 'block';
            collectionReport.style.width = '100%';
            var propertyIframe = document.getElementById('collectionReport-iframe');
            propertyIframe.src = 'reportCollectionList.html';
            activeIframe = collectionReport;
            }
            function handleCertificateSelection(event) {
                var selectElement = event.target;
                var selectedValue = selectElement.value;
                if (selectedValue === "building") {
                    building();
                } else if (selectedValue === "membership") {
                    membership();
                } else if (selectedValue === "owner") {
                    owner();
                }
            }
        var activeIframe = null;
        function showMemberDetails() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var memberlistIframeWrapper = document.querySelector('.memberdetails-iframe-wrapper');
            memberlistIframeWrapper.style.display = 'block';
            var memberlistIframe = document.getElementById('memberdetails-iframe');
            memberlistIframe.src = 'members.html';
            memberlistIframe.style.height = '100%';
            activeIframe = memberlistIframeWrapper;
        }
                function showCollectionlist() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var collectionIframeWrapper = document.querySelector('.collectionlist-iframe-wrapper');
            collectionIframeWrapper.style.display = 'block';
            var collectionIframe = document.getElementById('collectionlist-iframe');
            collectionIframe.src = 'collectionList.html';
            activeIframe = collectionIframeWrapper;
            }
            function showProperty() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var propertyIframeWrapper = document.querySelector('.property-iframe-wrapper');
            propertyIframeWrapper.style.display = 'block';
            var propertyIframe = document.getElementById('property-iframe');
            propertyIframe.src = 'property.html';
            activeIframe = propertyIframeWrapper;
            }
            function Reservation() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var reservationIframeWrapper = document.querySelector('.reservation-iframe-wrapper');
            reservationIframeWrapper.style.display = 'block';
            reservationIframeWrapper.style.width = '100%';
            var propertyIframe = document.getElementById('reservation-iframe');
            propertyIframe.src = 'requestEvent.html';
            activeIframe = reservationIframeWrapper;
            }
            function building() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var buildingIframeWrapper = document.querySelector('.building-iframe-wrapper');
            buildingIframeWrapper.style.display = 'block';
            buildingIframeWrapper.style.width = '100%';
            var propertyIframe = document.getElementById('building-iframe');
            propertyIframe.src = 'buildingclearance.html';
            activeIframe = buildingIframeWrapper;
            }
            function membership() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var membershipIframeWrapper = document.querySelector('.membership-iframe-wrapper');
            membershipIframeWrapper.style.display = 'block';
            membershipIframeWrapper.style.width = '100%';
            var propertyIframe = document.getElementById('membership-iframe');
            propertyIframe.src = 'certificateofmembership.html';
            activeIframe = membershipIframeWrapper;
            }
            function owner() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var ownerIframeWrapper = document.querySelector('.owner-iframe-wrapper');
            ownerIframeWrapper.style.display = 'block';
            ownerIframeWrapper.style.width = '100%';
            var propertyIframe = document.getElementById('owner-iframe');
            propertyIframe.src = 'titlecertificate.html';
            activeIframe = ownerIframeWrapper;
            }
        function Account() {
            if (activeIframe) {
                activeIframe.style.display = 'none';
            }
            var accountIframeWrapper = document.querySelector('.accounts-iframe-wrapper');
            accountIframeWrapper.style.display = 'block';
            accountIframeWrapper.style.width = '100%';
            var propertyIframe = document.getElementById('accounts-iframe');
            propertyIframe.src = 'accounts.html';
            activeIframe = accountIframeWrapper;
            }