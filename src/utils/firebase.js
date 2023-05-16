import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//     apiKey: "AIzaSyB-ZDm4LrJKZbpNOGHQbQq0HRkWron5sWo",
//     authDomain: "fyp-bb1b4.firebaseapp.com",
//     projectId: "fyp-bb1b4",
//     storageBucket: "fyp-bb1b4.appspot.com",
//     messagingSenderId: "620602328917",
//     appId: "1:620602328917:web:99cee7a60afda43b9091dc"
// };

const firebaseConfig = {
    apiKey: "AIzaSyA13VTKDcceN-3cIIJ6Ehq3xywh_3ms5yI",
    authDomain: "deploy-fleadisc.firebaseapp.com",
    projectId: "deploy-fleadisc",
    storageBucket: "deploy-fleadisc.appspot.com",
    messagingSenderId: "280199512333",
    appId: "1:280199512333:web:ab53865ff23f2a2ff0b044",
    measurementId: "G-BS6LDVV2F7"
};

const app = initializeApp(firebaseConfig);
export const Storage = getStorage(app);