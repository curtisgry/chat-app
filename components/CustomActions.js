import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase';

export default class CustomActions extends React.Component {
        /*  Additional communication feature functions */

        // Pick from library
        imagePicker = async () => {
                // get permissions
                const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
                try {
                        if (status === 'granted') {
                                // pick image
                                const result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images, // only images are allowed
                                }).catch((error) => console.log(error));
                                // canceled process
                                if (!result.cancelled) {
                                        const imageUrl = await this.uploadImageFetch(result.uri);
                                        this.props.onSend({ image: imageUrl });
                                }
                        }
                } catch (error) {
                        console.log(error.message);
                }
        };

        // Use camera
        takePhoto = async () => {
                // Get permissions
                const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
                try {
                        if (status === 'granted') {
                                // Launch the camera
                                const result = await ImagePicker.launchCameraAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                }).catch((error) => console.log(error));
                                // canceled process
                                if (!result.cancelled) {
                                        const imageUrl = await this.uploadImageFetch(result.uri);
                                        this.props.onSend({ image: imageUrl });
                                }
                        }
                } catch (error) {
                        console.log(error.message);
                }
        };

        // Share location
        getLocation = async () => {
                try {
                        // get permission for location
                        const { status } = await Permissions.askAsync(Permissions.LOCATION);
                        if (status === 'granted') {
                                // Find current position
                                const result = await Location.getCurrentPositionAsync({}).catch((error) =>
                                        console.log(error)
                                );
                                const longitude = JSON.stringify(result.coords.longitude);
                                const altitude = JSON.stringify(result.coords.latitude);
                                if (result) {
                                        this.props.onSend({
                                                location: {
                                                        longitude: result.coords.longitude,
                                                        latitude: result.coords.latitude,
                                                },
                                        });
                                }
                        }
                } catch (error) {
                        console.log(error.message);
                }
        };

        uploadImageFetch = async (uri) => {
                const blob = await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = function () {
                                resolve(xhr.response);
                        };
                        xhr.onerror = function (e) {
                                console.log(e);
                                reject(new TypeError('Network request failed'));
                        };
                        xhr.responseType = 'blob';
                        xhr.open('GET', uri, true);
                        xhr.send(null);
                });

                const imageNameBefore = uri.split('/');
                const imageName = imageNameBefore[imageNameBefore.length - 1];
                // Create reference to full path of the file
                const imagesRef = ref(storage, `images/${imageName}`);
                // upload blob
                await uploadBytes(imagesRef, blob);
                console.log('image uploaded');
                const downloadUrl = await getDownloadURL(imagesRef);
                console.log('file available on firebase storage at the following link', downloadUrl);
                return downloadUrl;
        };

        /* ^^ Additional communication feature functions */

        onActionPress = () => {
                const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
                const cancelButtonIndex = options.length - 1;
                this.context.actionSheet().showActionSheetWithOptions(
                        {
                                options,
                                cancelButtonIndex,
                        },
                        async (buttonIndex) => {
                                switch (buttonIndex) {
                                        case 0:
                                                console.log('user wants to pick an image');
                                                return this.imagePicker();
                                        case 1:
                                                console.log('user wants to take a photo');
                                                return this.takePhoto();
                                        case 2:
                                                console.log('user wants to get their location');
                                                return this.getLocation();
                                        default:
                                }
                        }
                );
        };

        render() {
                return (
                        <TouchableOpacity
                                accessible
                                accessibilityLabel="More options"
                                accessibilityHint="Let’s you choose to send an image or your geolocation."
                                style={[styles.container]}
                                onPress={this.onActionPress}
                        >
                                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                                        <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
                                </View>
                        </TouchableOpacity>
                );
        }
}

const styles = StyleSheet.create({
        container: {
                width: 26,
                height: 26,
                marginLeft: 10,
                marginBottom: 10,
        },
        wrapper: {
                borderRadius: 13,
                borderColor: '#b2b2b2',
                borderWidth: 2,
                flex: 1,
        },
        iconText: {
                color: '#b2b2b2',
                fontWeight: 'bold',
                fontSize: 16,
                backgroundColor: 'transparent',
                textAlign: 'center',
        },
});

CustomActions.contextTypes = {
        actionSheet: PropTypes.func,
};
