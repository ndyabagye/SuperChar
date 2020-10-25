import {useRef, useState} from 'react';
import './App.css';
import conceit from './conceit.jpg';

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from 'react-firebase-hooks/firestore';
firebase.initializeApp({

  // your config
 
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user]= useAuthState(auth);
  return (
    <div className="App">
       <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom/>: <SignIn/>}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle=()=>{
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
  }
  return (
    <>
      <button onClick={signInWithGoogle} >
         Sign in with google 
      </button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){

  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, {idField:"id"});

  const [formValue, setFormValue]=  useState('');

  const sendMessage = async(e)=>{
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ });
  }

  return(
    <>
    
    <main>
      {messages &&messages.map(msg=> <ChatMessage key={msg.id} message={msg}/>)}
      <span ref={dummy}></span>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e)=>setFormValue(e.target.value)} placeholder="Type a message"/>
      <button type="submit" disabled={!formValue}>✈</button>
    </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;

  const messageClass =  uid === auth.currentUser.uid? 'sent': 'received';
  return(<>
    <div className={`message ${messageClass}`}>
    <img src={photoURL || conceit } alt="userImage"/>
    <p>{text}</p>
  </div>
  </>
  )
}

export default App;
