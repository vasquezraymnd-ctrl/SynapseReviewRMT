'use client'
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZmSBGlY5Pza_mXIhFjl9fj0SDXeO8OJE",
  authDomain: "studio-4582615362-8c3e1.firebaseapp.com",
  projectId: "studio-4582615362-8c3e1",
  storageBucket: "studio-4582615362-8c3e1.firebasestorage.app",
  messagingSenderId: "100300675060",
  appId: "1:100300675060:web:4d1947e271031d41a04ba1"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
