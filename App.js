// @refresh reset
import React, {useState, useEffect, useCallback} from 'react';
import { GiftedChat } from 'react-native-gifted-chat'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, TextInput, View, YellowBox, Button, LogBox} from 'react-native';
import firebase from "firebase/app";
import 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCfCq2U2HtIIhHB5bF8CK94zqaa4OlEWak",
  authDomain: "react-native-chat-4dccd.firebaseapp.com",
  projectId: "react-native-chat-4dccd",
  storageBucket: "react-native-chat-4dccd.appspot.com",
  messagingSenderId: "842240245005",
  appId: "1:842240245005:web:e285c21a97a6eebfc34444"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

// LogBox.ignoreLogs(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
  
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messageFirestore = querySnapshot.docChanges().filter(({type}) => type === 'added' )
                                            .map(({doc}) => {
                                              const message = doc.data()
                                              return {...message, createdAt: message.createdAt.toDate() }
                                            }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
        appendMessages(messageFirestore)
    })
    return () => unsubscribe()
  }, [])

    const appendMessages = useCallback((messages) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages) )
    }, [messages])

    async function readUser() {
      const user = await AsyncStorage.getItem('user')
      if (user) {
        setUser(JSON.parse(user))
      }
    }

    async function handlePress() {
      const _id = Math.random().toString(36).substring(7) // this is where we can add authentication / database management
      const user = {_id, name}
      await AsyncStorage.setItem('user', JSON.stringify(user))
      setUser(user)
    }

    async function handleSend(messages) {
      const writes = messages.map(m => chatsRef.add(m))
      await Promise.all(writes)

    }

    if(!user) {
      return <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
        <Button onPress={handlePress} title="Enter the chat" />
      </View>
    }

  return <GiftedChat messages={messages} user={user} onSend={handleSend} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray'
  }
});
