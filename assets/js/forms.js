import { doc, getDoc,getDocs, setDoc,collection,updateDoc, query, where, orderBy, limit, startAfter, endBefore, limitToLast   } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "../credentials/firebaseModule.js";
const memberRef = collection(db, "Members");
document.addEventListener('DOMContentLoaded', (event) => {
    names();
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