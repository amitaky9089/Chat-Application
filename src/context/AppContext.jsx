//All data realated to chat are stored here.

import {doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext,useEffect,useState } from "react";
import {auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    //function or object which are present in this value object can be accessed anywhere in the project.
    const navigate = useNavigate();
    const [userData,setUserData] = useState(null);
    const [chatData,setChatData] = useState(null);
    const [messagesId,setMessagesId] = useState(null);
    const [messages,setMessages] = useState([]);
    const [chatUser,setChatUser] = useState(null);
    //chatvisible true means we have to show chat data. and if false we have to show leftsidebar
    const [chatVisible,setChatVisible] = useState(false);

    // with the help of uid we can load the userChat data and other data
    const loadUserData = async (uid) =>{
        try{
            const userRef = doc(db,'users',uid);
            const userSnap=await getDoc(userRef);
            const userData=userSnap.data();
            // console.log("hii")
            console.log(userData);//snapshot of one user
            setUserData(userData)
            if(userData.avatar && userData.name){
                    navigate('/chat')
            }
            else{
                navigate('/profile')
            }
            //logic to obtain last seen data
            await updateDoc(userRef,{
                lastSeen:Date.now()
            })
            //update last seen at every single minute
            setInterval(async ()=>{
               if(auth.chatUser){
                await updateDoc(userRef,{
                    lastSeen:Date.now()
                })
               }
            },60000)
        }catch(error){
            console.log(error.code)
        }
    }
    
    //to load the user chat data
    useEffect(()=>{
            if(userData){
                const chatRef=doc(db,'chats',userData.id);
                const unSub=onSnapshot(chatRef,async(res)=>{
                    const chatItems=res.data().chatsData;
                    const tempData=[];
                    for(const item of chatItems){
                        const userRef=doc(db,'users',item.rId);
                        const userSnap=await getDoc(userRef);
                        const userData=userSnap.data();
                        tempData.push({...item,userData})
                    }
                    setChatData(tempData.sort((a,b)=>b.updatedAt - a.updatedAt))
                })
                return ()=>{unSub();}
            }
    },[userData])

    //this will allow us to use all these four variables in any component.
    const value={
          userData,
          setUserData,
          chatData,
          setChatData,
          loadUserData,
          messages,setMessages,
          messagesId,setMessagesId,
          chatUser,setChatUser,
          chatVisible,setChatVisible
    }
//when chatVisible is true we will display the chat box.
//and when false we have to display left side bar only.
    return (
        <AppContext.Provider value = {value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider