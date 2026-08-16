/* ============================================================
   FIREBASE CONFIG (public pages) — index.html & search.html
   Only initializes Firestore for reading live artisan listings.
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAlHyZuB0MwjNNmukVfVv-t4iRiNSxPh7Y",
  authDomain: "naijafix-3227b.firebaseapp.com",
  projectId: "naijafix-3227b",
  storageBucket: "naijafix-3227b.firebasestorage.app",
  messagingSenderId: "605013760653",
  appId: "1:605013760653:web:38e3bb29ba17cc72e5e0c4",
  measurementId: "G-3WH516R6QH"
};

firebase.initializeApp(firebaseConfig);

const appCheck = firebase.appCheck();
appCheck.activate(
  '6LdTQlgtAAAAAHl5H1kdmB5cCsi8wQrMRZ8glE0W',
  true // auto-refresh the token
);

const db = firebase.firestore();
