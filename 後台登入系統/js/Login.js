// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
    getAuth,
    signOut,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { myFirebase } from "./firebase.js";

// Initialize Firebase
// const firebaseConfig = {
//     apiKey: "AIzaSyBqQ5T0uy3_68BVFhfTqS98VNWUmgLkir0",
//     authDomain: "orderhippo-store.firebaseapp.com",
//     projectId: "orderhippo-store",
//     storageBucket: "orderhippo-store.appspot.com",
//     messagingSenderId: "777247881627",
//     appId: "1:777247881627:web:6bc31c0a8fd80a4def493e"
// };

const myLoginFirebase = new myFirebase();
myLoginFirebase.initFirebase();

// Initialize Firebase
// initializeApp(firebaseConfig);

let email = document.getElementById("email");
let passwd = document.getElementById("password");

let mailLoginBnt = document.getElementById("loginBnt");
let resetPasswd = document.getElementById("resetPasswd");

setSignBntStatus();

function storeMailLogin(e) {
    e.preventDefault();

    const storeMail = getStoreMail();
    const storePassword = getStorePassword();
    const auth = getAuth();

    signInWithEmailAndPassword(auth, storeMail, storePassword)
        .then((userCredential) => {
            // Signed in 
            let STORE_ID = auth.currentUser.uid;

            fetch(`http://localhost:8080/api/getToken/${STORE_ID}`, {
                method: "GET"
            }).then(res => {
                return res.text();
            }).then(resultToken => {
                localStorage.setItem('storeToken', resultToken);
                fetch(`http://localhost:8080/api/${STORE_ID}/stores?token=${resultToken}`, {
                    method: "GET"
                }).then(res => {
                    return res.json();
                }).then(result => {
                    let queryResult = result[0];
                    addLocalstorage(queryResult);

                    welcomeToUse(queryResult.STORE_NAME);
                    setInterval(() => {
                        window.location.href = "homepage.html"
                    }, 2000); // 等待2秒導向回到登入頁面
                })
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(`${errorCode}-${errorMessage}`);
            errorCodeDisplay(errorCode);
        });
}

function storeChangePasswd(e) {
    e.preventDefault();
    const storeMail = getStoreMail();
    const auth = getAuth();
    sendPasswordResetEmail(auth, storeMail)
        .then(() => {
            sendStorePasswdAlert();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(`${errorCode}-${errorMessage}`);
        });
}

function errorCodeDisplay(errorCode) {
    let errorText = "";
    if (errorCode === "auth/wrong-password") {
        errorText = "密碼輸入錯誤";
        setErrorCodeDisplay(errorText);
    } else if (errorCode === "auth/user-not-found") {
        errorText = "帳號不存在";
        setErrorCodeDisplay(errorText);
    }
}

function getStoreMail() {
    return email.value;
}
function getStorePassword() {
    return passwd.value;
}

function sendStorePasswdAlert() {
    Swal.fire({
        icon: 'success',
        title: "已寄送更改密碼連結到您的信箱",
        showConfirmButton: false,
        timer: 1500
    });
}

function setErrorCodeDisplay(errorText) {
    Swal.fire({
        icon: 'error',
        title: errorText,
        showConfirmButton: false,
        timer: 1500
    });
}

function welcomeToUse(storeName) {
    if (storeName === null) {
        storeName = "";
    }
    Swal.fire({
        icon: 'success',
        title: `Hi, ${storeName} 歡迎使用`,
        showConfirmButton: false,
        timer: 1500
    });
}

// function alreadyLogin() {
//     Swal.fire({
//         icon: 'success',
//         title: `Hi, 你已經登入囉`,
//         showConfirmButton: false,
//         timer: 1500
//     });
// }

function addLocalstorage(storeInfo) {
    localStorage.removeItem('storeinfo');
    localStorage.setItem('storeinfo', JSON.stringify(storeInfo));
}

function setSignBntStatus() {
    const auth = getAuth();
    auth.onAuthStateChanged((store) =>{
        if (store) { // 登入
            welcomeToUse(JSON.parse(localStorage.getItem('storeinfo')).STORE_NAME);
            setInterval(() => {
                window.location.href = "homepage.html"
            }, 1500); // 等待2秒導向回到登入頁面
        }
    });
}

mailLoginBnt.addEventListener("click", (e) => {
    storeMailLogin(e);
});

resetPasswd.addEventListener("click", (e) => {
    storeChangePasswd(e);
});

