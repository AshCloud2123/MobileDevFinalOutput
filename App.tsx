import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { Search, Plus, Trash2, Edit2, LogOut, LogIn } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXRP452ESmKXqEubA5W4v4N8veZhb8rt8",
    authDomain: "mynotesapp-b7a12.firebaseapp.com",
    projectId: "mynotesapp-b7a12",
    storageBucket: "mynotesapp-b7a12.firebasestorage.app",
    messagingSenderId: "172334186698",
    appId: "1:172334186698:web:eafdb48b3b5596bb083433"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export default function App() {
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        loadNotes(user.uid);
      } else {
        setNotes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load notes from Firestore
  const loadNotes = (userId: string) => {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData: Note[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notesData.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          userId: data.userId
        });
      });
      setNotes(notesData);
    });

    return unsubscribe;
  };

  // Auth handlers
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  // Note handlers
  const handleCreateNote = async () => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'notes'), {
        title: noteForm.title,
        content: noteForm.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.uid
      });
      setNoteForm({ title: '', content: '' });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create note: ' + error.message);
    }
  };

  const handleUpdateNote = async () => {
    if (!currentNote || !user) return;
    
    try {
      await updateDoc(doc(db, 'notes', currentNote.id), {
        title: noteForm.title,
        content: noteForm.content,
        updatedAt: new Date()
      });
      setCurrentNote(null);
      setIsEditing(false);
      setNoteForm({ title: '', content: '' });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update note: ' + error.message);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to delete note: ' + error.message);
    }
  };

  const startEditing = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
    setNoteForm({ title: note.title, content: note.content });
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9fafb',
      padding: 16
    },
    authContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: '#f9fafb'
    },
    authCard: {
      backgroundColor: 'white',
      padding: 24,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1
    },
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
      fontSize: 16
    },
    button: {
      backgroundColor: '#2563eb',
      padding: 14,
      borderRadius: 6,
      alignItems: 'center',
      marginBottom: 8
    },
    buttonText: {
      color: 'white',
      fontWeight: '500',
      fontSize: 16
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: '#2563eb',
      padding: 14,
      borderRadius: 6,
      alignItems: 'center'
    },
    outlineButtonText: {
      color: '#2563eb',
      fontWeight: '500',
      fontSize: 16
    },
    noteCard: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 6,
      paddingLeft: 12,
      marginBottom: 16,
      flex: 1
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      paddingLeft: 32,
      fontSize: 16
    },
    noteInput: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
      height: 120,
      textAlignVertical: 'top'
    }
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>MyNotes</Text>
          
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.outlineButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={handleRegister}
          >
            <Text style={styles.outlineButtonText}>Register</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>MyNotes</Text>
        <Pressable onPress={handleLogout}>
          <LogOut size={24} color="#6b7280" />
        </Pressable>
      </View>

      {/* Search and New Note */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <View style={styles.searchContainer}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
            padding: 12,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
            width: 60
          })}
          onPress={() => {
            setIsEditing(false);
            setCurrentNote(null);
            setNoteForm({ title: '', content: '' });
          }}
        >
          <Plus size={20} color="white" />
        </Pressable>
      </View>

      {/* Note Form */}
      {(isEditing || !currentNote) && (
        <View style={styles.noteCard}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
            {isEditing ? 'Edit Note' : 'New Note'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={noteForm.title}
            onChangeText={(text) => setNoteForm({...noteForm, title: text})}
          />
          
          <TextInput
            style={styles.noteInput}
            placeholder="Content"
            multiline
            value={noteForm.content}
            onChangeText={(text) => setNoteForm({...noteForm, content: text})}
          />
          
          <Pressable
            style={({ pressed }) => [
              styles.button, 
              { 
                opacity: (!noteForm.title || !noteForm.content) ? 0.5 : pressed ? 0.8 : 1,
                backgroundColor: (!noteForm.title || !noteForm.content) ? '#93c5fd' : '#2563eb'
              }
            ]}
            onPress={isEditing ? handleUpdateNote : handleCreateNote}
            disabled={!noteForm.title || !noteForm.content}
          >
            <Text style={styles.buttonText}>
              {isEditing ? 'Update Note' : 'Save Note'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Notes List */}
      <ScrollView style={{ flex: 1 }}>
        {filteredNotes.length === 0 ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 16 }}>
              {searchTerm ? 'No matching notes found' : 'No notes yet. Create your first note!'}
            </Text>
          </View>
        ) : (
          filteredNotes.map(note => (
            <View key={note.id} style={styles.noteCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, flex: 1 }}>{note.title}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={() => startEditing(note)}>
                    <Edit2 size={20} color="#4b5563" />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteNote(note.id)}>
                    <Trash2 size={20} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>
                {formatDate(note.updatedAt)}
              </Text>
              <Text style={{ color: '#374151', fontSize: 16, lineHeight: 24 }}>
                {note.content}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
