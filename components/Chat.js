import React, { useState, useCallback, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
        apiKey: 'AIzaSyD44_qWMrt0omObtYJ_6H15WS7g3qZ23XY',
        authDomain: 'chat-app-c477c.firebaseapp.com',
        projectId: 'chat-app-c477c',
        storageBucket: 'chat-app-c477c.appspot.com',
        messagingSenderId: '338248643729',
        appId: '1:338248643729:web:5f7197c017675d04acfb30',
};

// Initialize Firebase
let app;

if (firebase.apps.length === 0) {
        app = firebase.initializeApp(firebaseConfig);
} else {
        app = firebase.app();
}
const db = app.firestore();

export default function Chat({ route, navigation }) {
        // Messages state for GiftedChat, each element of array is a message
        const [messages, setMessages] = useState([]);
        const [uid, setUid] = useState('');

        // Color and name passed from Start.js
        const { color, name } = route.params;

        const referenceMessages = db.collection('messages');

        const authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                if (!user) {
                        await firebase.auth().signInAnonymously();
                }
                setUid(user.uid);
        });

        const addMessage = (message) => {
                referenceMessages.add(message);
        };

        const onCollectionUpdate = (querySnapshot) => {
                const messageList = [];
                querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        data.createdAt = data.createdAt.toDate();
                        messageList.push(data);
                });
                messageList.sort((a, b) => b.createdAt - a.createdAt);
                setMessages(messageList);
        };

        // Set the initial messages when the chat screen is loaded
        useEffect(() => {
                const unsubscribeMessages = referenceMessages.onSnapshot(onCollectionUpdate);

                return function cleanUp() {
                        unsubscribeMessages();
                        authUnsubscribe();
                };
        }, []);

        // Append message to GiftedChat that appear on screen
        const onSend = useCallback((messages = []) => {
                setMessages((previousMessages) => {
                        GiftedChat.append(previousMessages, messages);
                }, []);
        });

        // Change the color of the chat bubble
        const renderBubble = useCallback((props) => (
                <Bubble
                        {...props}
                        wrapperStyle={{
                                right: {
                                        backgroundColor: '#000',
                                },
                        }}
                />
        ));

        console.log(messages);

        return (
                <View style={{ flex: 1, backgroundColor: color }}>
                        <GiftedChat
                                renderBubble={renderBubble}
                                messages={messages}
                                onSend={(messages) => {
                                        addMessage(messages[0]);
                                        onSend(messages);
                                }}
                                user={{ _id: uid, name }}
                        />
                        {/* Stops keyboard from overlaying the text input when on android */}
                        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
                </View>
        );
}
