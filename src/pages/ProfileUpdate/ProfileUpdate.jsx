
import { useContext, useEffect, useState } from "react"
import assets from "../../assets/assets"
import "./ProfileUpdate.css"
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db,auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const navigate=useNavigate();
  // state variable for image upload 
  const [image,setImage]=useState(false);
  //state variables for two variables
  const [name,setName]=useState("");
  const [bio,setBio]=useState("");
  const [prevImage,setPrevImage]=useState("");
  const {setUserData} = useContext(AppContext)
  const [uid,setUid]=useState("");

  const profileUpdate = async (event)=>{
        event.preventDefault();
        try{
          //logic to update name bio avatar in db
          if(!prevImage && !image){
            toast.error("Upload Profile Picture")
          }
          const docRef=doc(db,'users',uid);
          //if user selected any image to upload
          if(image){
            const imgUrl=await upload(image);
            setPrevImage(imgUrl);
            await updateDoc(docRef,{
              avatar:imgUrl,
              bio:bio,
              name:name
            })
          }
          else{
            await updateDoc(docRef,{
              bio:bio,
              name:name
            })
          }
          //using this our user data updated with username bio avatar
          const snap = await getDoc(docRef)
          setUserData(snap.data())
          navigate('/chat')
        }catch(error){
           console.error(error)
           toast.error(error.message)
        }
  }
  useEffect(()=>{
    onAuthStateChanged(auth,async(user)=>{
      if(user){
        setUid(user.uid)
        const docRef = doc(db,"users",user.uid);
        const docSnap=await getDoc(docRef);
        if(docSnap.data().name){
          setName(docSnap.data().name)
        }
        if(docSnap.data().bio){
          setBio(docSnap.data().bio)
        }
        if(docSnap.data().avatar){
          setPrevImage(docSnap.data().avatar)
        }
      }
      //if user logout
      else{
         navigate('/')
      }
    })
  })

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="avatar" accept=".png, .jpg, .jpeg" hidden/>
            <img src={image? URL.createObjectURL(image):assets.avatar_icon} alt="" />
            upload profile image
          </label>
          <input type="text" onChange={(e)=>{setName(e.target.value)}} value={name} placeholder="Your name" required />
          <textarea placeholder="Write profile bio" onChange={(e)=>{setBio(e.target.value)}} value={bio} required></textarea>
          <button type="submit">Save</button>
        </form>
        <img className="profile-pic" src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate
