import React, { useState } from 'react';
import {
        StyleSheet,
        KeyboardAvoidingView,
        View,
        Text,
        Button,
        TextInput,
        ImageBackground,
        Dimensions,
        Pressable,
        Platform,
} from 'react-native';

export default function Start({ navigation }) {
        const [inputText, setInputText] = useState('');

        // theme will be passed to chat component to set background color
        const [theme, setTheme] = useState('#090C08');

        const themeColors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

        // import image for background
        const image = require('../assets/Background-Image.png');

        return (
                // KeyboardAvoidingView stops some elements from shifting when using keyboard on Android
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
                                <View style={styles.container}>
                                        <View style={styles.container}>
                                                <Text style={styles.title}>Chat</Text>
                                        </View>
                                        <View style={styles.containerForm}>
                                                <View style={styles.formRow}>
                                                        <TextInput
                                                                style={styles.input}
                                                                onChangeText={(text) => setInputText(text)}
                                                                placeholder="Your Name"
                                                                value={inputText}
                                                        />
                                                </View>

                                                <View style={styles.formRow}>
                                                        <View style={{ flexDirection: 'column' }}>
                                                                <Text style={styles.colorText}>
                                                                        Choose a background color
                                                                </Text>
                                                                <View style={styles.colorSelect}>
                                                                        {/* Make color circle buttons for color select */}
                                                                        {themeColors.map((color) => (
                                                                                <Pressable
                                                                                        key={color}
                                                                                        style={[
                                                                                                styles.colorButton,
                                                                                                {
                                                                                                        backgroundColor:
                                                                                                                color,
                                                                                                },
                                                                                        ]}
                                                                                        onPress={() => setTheme(color)}
                                                                                />
                                                                        ))}
                                                                </View>
                                                        </View>
                                                </View>
                                                <View style={styles.formRow}>
                                                        <Pressable
                                                                style={styles.button}
                                                                // Navigate to chat view and set color and name in params prop object
                                                                onPress={() => {
                                                                        navigation.navigate('Chat', {
                                                                                color: theme,
                                                                                name: inputText,
                                                                        });
                                                                }}
                                                        >
                                                                <Text style={styles.buttonText}>Start Chatting</Text>
                                                        </Pressable>
                                                </View>
                                        </View>
                                </View>
                        </ImageBackground>
                </KeyboardAvoidingView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingBottom: 25,
        },
        formRow: {
                flexDirection: 'row',
        },
        title: {
                fontSize: 45,
        },
        input: {
                height: 50,
                padding: 10,
                borderColor: 'gray',
                borderWidth: 2,
                flex: 1,
                borderRadius: 2,
        },
        button: {
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                height: 50,
                flex: 1,
                backgroundColor: '#757083',
                fontSize: 16,
                fontWeight: '600',
        },
        buttonText: {
                fontSize: 16,
                fontWeight: '600',
                color: '#fff',
        },
        colorButton: {
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                marginLeft: 10,
                borderRadius: 50,
        },
        colorSelect: {
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'flex-start',
        },
        colorText: {
                fontSize: 16,
                fontWeight: '600',
                color: '#757083',
                marginBottom: 12,
        },
        image: {
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
        },
        containerForm: {
                backgroundColor: '#fff',
                width: Dimensions.get('window').width - 40,
                flex: 2,
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingHorizontal: 18,
        },
});
