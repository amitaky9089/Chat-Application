// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {collection, doc, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_ddPmBAU94rT01RNCPjBvnscnuG1Nieg",
  authDomain: "chat-application-caa1a.firebaseapp.com",
  projectId: "chat-application-caa1a",
  storageBucket: "chat-application-caa1a.appspot.com",
  messagingSenderId: "432702580802",
  appId: "1:432702580802:web:a1d792c98ae94d9ba065db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);//intialise with app instance
const db=getFirestore(app);//database intialisation

//writing signup function and creating a new user account
const signup=async(username,email,password)=>{
    try{
        const res=await createUserWithEmailAndPassword(auth,email,password);
        const user=res.user; //storing user data in another variable
        //storing user data in user collection
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, There I am using chat app",
            lastSeen:Date.now()
        })
        //storing chat data of user
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    }catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async (email,password) =>{
    try{
        await signInWithEmailAndPassword(auth,email,password);
    } catch(error){
         console.error(error);
         toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async() => {
    try{
   await signOut(auth);
    }catch(error){
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const resetPass = async (email) =>{
    if(!email){
        toast.error("Enter your mail")
        return null;
    }
    try{
        const userRef=collection(db,'users');
        const q=query(userRef,where("email","==",email));
        const querySnap=await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset email sent")
        }
        else{
            toast.error("Email doesn't exists")
        }
    }catch(error){
           console.error(error);
           toast.error(error.message)
    }
}
export {signup,login,logout,auth,db,resetPass}