import { initializeApp } from 'firebase/app';
import { getStorage, ref } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
        apiKey: 'AIzaSyD44_qWMrt0omObtYJ_6H15WS7g3qZ23XY',
        authDomain: 'chat-app-c477c.firebaseapp.com',
        projectId: 'chat-app-c477c',
        storageBucket: 'chat-app-c477c.appspot.com',
        messagingSenderId: '338248643729',
        appId: '1:338248643729:web:5f7197c017675d04acfb30',
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

const storageRef = ref(storage);

export { db, storage, storageRef, app as default };
