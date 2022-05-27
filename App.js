// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Chat from './components/Chat';
import Start from './components/Start';

// import react native gesture handler
import 'react-native-gesture-handler';

// Create the navigator
const Stack = createStackNavigator();

export default function App() {
        return (
                <NavigationContainer>
                        <Stack.Navigator initialRouteName="Start" /* screenOptions={{ headerShown: false }} */>
                                <Stack.Screen name="Start" component={Start} />
                                <Stack.Screen name="Chat" component={Chat} />
                        </Stack.Navigator>
                </NavigationContainer>
        );
}
