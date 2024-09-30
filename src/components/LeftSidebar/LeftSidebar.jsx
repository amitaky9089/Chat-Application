import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {doc, collection, getDocs,getDoc, query, setDoc, where, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { logout } from "../../config/firebase";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData, chatUser, setChatUser, messagesId, setMessagesId, chatVisible, setChatVisible} = useContext(AppContext);
  //whenever we find user we set userdata in user and mark showSearch as true
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true)
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySanp = await getDocs(q);
        console.log(querySanp.docs);
        if (!querySanp.empty && querySanp.docs[0].data().id !== userData.id) {
          let userExist=false;
          chatData.map((user)=>{
            if(user.rId === querySanp.docs[0].data().id){
                  userExist=true;
            }
          })
          if(!userExist){
            setUser(querySanp.docs[0].data());
          }
        }
        else{
          setUser(null);
        }
      }
      else{
        setShowSearch(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const addChat = async () =>{
        const messagesRef=collection(db,"messages");
        const chatsRef=collection(db,"chats");
        try{
          const newMessageRef=doc(messagesRef);
          await setDoc(newMessageRef,{
            createAt:serverTimestamp(),
            //stores chat data of both users in this message array
            messages:[]
          })

          await updateDoc(doc(chatsRef,user.id),{
            chatsData:arrayUnion({
              messageId:newMessageRef.id,
              lastMessage:"",
              rId:userData.id,
              updatedAt:Date.now(),
              messageSeen:true
            })
          })

          await updateDoc(doc(chatsRef,userData.id),{
            chatsData:arrayUnion({
              messageId:newMessageRef.id,
              lastMessage:"",
              rId:user.id,
              updatedAt:Date.now(),
              messageSeen:true
            })
          })

          const uSnap = await getDoc(doc(db,"users",user.id));
          const uData = uSnap.data();
          setChat({
            messagesId:newMessageRef.id,
            lastMessage:"",
            rId:user.id,
            updatedAt:Date.now(),
            messageSeen:true,
            userData:uData,
          })
          setShowSearch(false)
          setChatVisible(true)
        }catch(error){
         toast.error(error.message)
         console.error(error)
        }
  }

//when we open chat this function is called
  const setChat = async (item)=>{
           try{
            setMessagesId(item.messageId)
            setChatUser(item)
            const userChatsRef=await doc(db,'chats',userData.id);
            console.log(userChatsRef)
            const userChatsSnapshot=await getDoc(userChatsRef);
            const userChatsData=userChatsSnapshot.data();
            console.log(userChatsData)
            const chatIndex= userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
            userChatsData.chatsData[chatIndex].messageSeen=true;
            await updateDoc(userChatsRef,{
             chatsData:userChatsData.chatsData
            })
        
            setChatVisible(true);
            // console.log(chatVisible)
           }catch(error){
             console.log(error.message)
           }
  }      
  
  useEffect(()=>{
    const updateChatUserData= async() =>{
          if(chatUser){
            const userRef = doc(db,"users",chatUser.userData.id)
            const userSnap=await getDoc(userRef);
            const userData = userSnap.data();
            setChatUser(prev=>({...prev,userData:userData}))
          }
    }
    updateChatUserData();
  },[chatData])

  return (
    <div className={ `ls ${chatVisible ?"hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={()=>logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            type="text"
            onChange={inputHandler}
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user
         ? <div onClick={addChat} className="friends add-user">
             <img src={user.avatar} alt="" />
             <p>{user.name}</p>
         </div>
         :
         chatData.map((item, index) => (
           <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
             <img src={item.userData.avatar} alt="" />
             <div>
               <p>{item.userData.name}</p>
               {/* this span will  help to display last msg by the user  */}
               <span>{item.lastMessage}</span>
             </div>
           </div>
         ))
        }
        
      </div>
    </div>
  );
};

export default LeftSidebar;
