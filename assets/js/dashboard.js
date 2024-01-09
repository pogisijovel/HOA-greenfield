import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
    import { doc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

    import { db, auth } from "../credentials/firebaseModule.js";

    
    const urlParams = new URLSearchParams(window.location.search);

   
    const signInEmail = urlParams.get("email");
    const singInUserType = urlParams.get("userType");

    const signOutB = document.getElementById('signOut');
    const adminModuleWrapper = document.getElementById('adminModule'); 

    onLoad();

    function onLoad() {
        document.getElementById("Email").textContent = signInEmail;
        document.getElementById("userType").textContent = singInUserType;

        
        if (singInUserType === 'staff') {
            adminModuleWrapper.style.display = 'none'; 
        }
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

    const logout = async () => {
        const url = `http://127.0.0.1:5500/index.html`;
        await signOut(auth);
        window.location.href = url;
        window.location.replace(url);
    }

    signOutB.addEventListener("click", logout);

    document.addEventListener("DOMContentLoaded", function () {
        showMemberDetails(); 
    });