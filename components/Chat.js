import React from 'react';
import { View, Text } from 'react-native';

export default function Chat({ route, navigation }) {
        // Color and name passed from Start.js
        const { color, name } = route.params;

        return (
                <View style={{ flex: 1, backgroundColor: color, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 25 }}>Welcome: {name}</Text>
                </View>
        );
}
