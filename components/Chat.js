import React, { useState, useCallback, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

export default function Chat({ route, navigation }) {
        // Messages state for GiftedChat, each element of array is a message
        const [messages, setMessages] = useState([]);

        // Color and name passed from Start.js
        const { color, name } = route.params;

        // Set the initial messages when the chat screen is loaded
        useEffect(() => {
                setMessages([
                        {
                                _id: 1,
                                text: 'Welcome to the chat',
                                createdAt: new Date(),
                                user: {
                                        _id: 2,
                                        name: 'Test',
                                        avatar: 'https://placeimg.com/140/140/any',
                                },
                        },
                        {
                                _id: 2,
                                text: `${name} is now in the chat.`,
                                createdAt: new Date(),
                                system: true,
                        },
                ]);
        }, []);

        // Append message to GiftedChat that appear on screen
        const onSend = useCallback((messages = []) => {
                setMessages((previousMessages) => GiftedChat.append(previousMessages, messages), []);
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

        return (
                <View style={{ flex: 1, backgroundColor: color }}>
                        <GiftedChat
                                renderBubble={renderBubble}
                                messages={messages}
                                onSend={(messages) => onSend(messages)}
                                user={{ _id: 1 }}
                        />
                        {/* Stops keyboard from overlaying the text input when on android */}
                        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
                </View>
        );
}
