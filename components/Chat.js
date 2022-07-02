import React, { useState, useCallback, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, Button, Image } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import MapView from 'react-native-maps';

import { collection, onSnapshot, orderBy, query, doc, setDoc, addDoc, snapshotEqual } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import CustomActions from './CustomActions';

import { db } from '../firebase/firebase';

export default function Chat({ route, navigation }) {
        // Messages state for GiftedChat, each element of array is a message
        const [messages, setMessages] = useState([]);
        // Image state
        const [image, setImage] = useState(null);
        // Location state
        const [location, setLocation] = useState(null);
        // uid from firebase auth
        const [uid, setUid] = useState('');
        // save connected status in state
        const [isConnected, setIsConnected] = useState(undefined);

        // Color and name passed from Start.js
        const { color, name } = route.params;

        // messages from firebase firestore
        const referenceMessages = collection(db, 'messages');

        // Auth from firebbase
        const auth = getAuth();

        // Add message to firebase
        const addMessage = (message) => {
                addDoc(referenceMessages, {
                        _id: message._id,
                        text: message.text || '',
                        createdAt: message.createdAt,
                        user: message.user,
                        image: message.image || null,
                        location: message.location || null,
                });
        };

        // update messages in state when firestore gets new data
        const onCollectionUpdate = (querySnapshot) => {
                const messageList = [];
                querySnapshot.docs.forEach((item) => {
                        const data = item.data();
                        data.createdAt = data.createdAt.toDate();
                        messageList.push(data);
                });
                // sort messages so the newest time is at the bottom of the rendered bubbles
                messageList.sort((a, b) => b.createdAt - a.createdAt);
                // set the state
                setMessages(messageList);
        };

        // save messages to async storage
        const saveMessages = async () => {
                if (messages.length < 1) return;
                try {
                        await AsyncStorage.setItem('messages', JSON.stringify(messages));
                } catch (error) {
                        console.log(error.message);
                }
        };

        // gets the messages saved in async storage
        const getMessages = async () => {
                let newMessages;
                try {
                        newMessages = (await AsyncStorage.getItem('messages')) || [];
                        console.log('newmessages', newMessages);
                        if (newMessages !== null) {
                                setMessages(JSON.parse(newMessages));
                        }
                } catch (error) {
                        console.log(error.message);
                }
        };

        // clears messages in asyncstorage for testing
        const clearMessages = async () => {
                try {
                        await AsyncStorage.removeItem('messages');
                } catch (error) {
                        console.log(error.message);
                }
        };

        // Change input toolbar depending on user connection status
        // use with GiftedChat as prop with the same name
        const renderInputToolbar = (props) => {
                if (isConnected == false) {
                        // null
                } else {
                        return <InputToolbar {...props} />;
                }
        };

        // Set the initial messages when the chat screen is loaded
        useEffect(() => {
                let unsubscribeMessages;
                let authUnsubscribe;

                // Check connection status and set state for isConnected
                NetInfo.fetch().then((connection) => {
                        if (connection.isConnected) {
                                setIsConnected(true);
                        } else {
                                setIsConnected(false);
                        }
                });

                if (isConnected) {
                        console.log('online');
                        setIsConnected(true);
                        const dbQuery = query(referenceMessages, orderBy('createdAt', 'desc'));
                        // onSnapshot returns an unsubscribe function to stop listening for updates
                        unsubscribeMessages = onSnapshot(dbQuery, onCollectionUpdate);
                        // onAuthStateChanged does the same as above but for auth
                        authUnsubscribe = onAuthStateChanged(auth, (user) => {
                                if (!user) {
                                        auth().signInAnonymously();
                                }
                                setUid(user.uid);
                        });

                        // clear old saved messages for testing
                        // clearMessages();

                        // save messages from firebase to storage
                        saveMessages().catch(console.error);

                        return function cleanUp() {
                                unsubscribeMessages();
                                authUnsubscribe();
                        };
                }

                console.log('offline');
                setUid('offlineUser');
                getMessages();
        }, [isConnected]);

        // Append message to GiftedChat that appear on screen
        const onSend = useCallback((messages = []) => {
                setMessages((previousMessages) => {
                        GiftedChat.append(previousMessages, messages);
                });
                addMessage(messages[0]);
                saveMessages();
        });

        // when messages state is changed saveMessages will save to asyncStorage
        useEffect(() => {
                saveMessages();
        }, [messages]);

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

        /* Image Funcions */
        const pickImage = async () => {
                const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

                if (status === 'granted') {
                        const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: 'Images',
                        }).catch((error) => console.log(error));

                        if (!result.cancelled) {
                                setImage(result);
                        }
                }
        };

        const takePhoto = async () => {
                const { status } = await Permissions.askAsync(Permissions.CAMERA);
                if (status === 'granted') {
                        const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: 'Images',
                        }).catch((error) => console.log(error));

                        if (!result.cancelled) {
                                setImage(result);
                        }
                }
        };

        /* Location Functions */

        const getLocation = async () => {
                const { status } = await Permissions.askAsync(Permissions.LOCATION_FOREGROUND);

                if (status === 'granted') {
                        const result = await Location.getCurrentPositionAsync({});

                        if (result) {
                                setLocation(result);
                        }
                }
        };

        // custom render actions
        /* eslint-disable-next-line */
        const renderCustomActions = (props) => { 
                
                return <CustomActions {...props} />;
        };

        const renderCustomView = (props) => {
                const { currentMessage } = props;
                if (currentMessage.location) {
                        return (
                                <MapView
                                        style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
                                        region={{
                                                latitude: currentMessage.location.latitude,
                                                longitude: currentMessage.location.longitude,
                                                latitudeDelta: 0.0922,
                                                longitudeDelta: 0.0421,
                                        }}
                                />
                        );
                }
                return null;
        };

        return (
                <View style={{ flex: 1, backgroundColor: color }}>
                        <GiftedChat
                                renderBubble={renderBubble}
                                renderCustomView={renderCustomView}
                                renderInputToolbar={(props) => renderInputToolbar(props)}
                                renderActions={renderCustomActions}
                                messages={messages}
                                onSend={(messages) => onSend(messages)}
                                user={{ _id: uid, name }}
                        />
                        {/* Stops keyboard from overlaying the text input when on android */}
                        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
                </View>
        );
}
