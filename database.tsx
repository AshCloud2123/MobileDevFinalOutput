import { db } from './firebase';
import { Note } from './types';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';



export const initDB = () => {
  // Firestore initialization handled in firebase.ts
  console.log('Firebase initialized');
};

// Register a new user
export const registerUser = async (email, password, successCallback, errorCallback) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      email,
      password,
      createdAt: new Date()
    });
    successCallback({ id: docRef.id, email });
  } catch (err) {
    errorCallback(err);
  }
};

// Check login credentials
export const loginUser = async (email, password, successCallback, failCallback) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email),
      where('password', '==', password)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      successCallback({ id: userDoc.id, ...userDoc.data() });
    } else {
      failCallback('Invalid credentials');
    }
  } catch (err) {
    failCallback(err);
  }
};

// Get notes for a specific user
export const getNotes = async (userEmail: string): Promise<Note[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userEmail', '==', userEmail), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
  } catch (error) {
    console.error('Error getting notes:', error);
    throw error;
  }
};

// Add a new note
export const addNote = async (userEmail: string, title: string, content: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'notes'), {
      userEmail,
      title,
      content,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

// Update a note by id
export const updateNote = async (id: string, title: string, content: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'notes', id), {
      title,
      content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Delete a note by id
export const deleteNote = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'notes', id));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
