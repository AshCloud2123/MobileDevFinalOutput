// screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { registerUser } from '../database';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    registerUser(
      email.trim(),
      password,
      () => {
        Alert.alert('Success', 'Account created! Please login.');
        navigation.goBack();
      },
      (error) => {
        if (error.message.includes('UNIQUE constraint failed')) {
          Alert.alert('Error', 'This email is already registered.');
        } else {
          Alert.alert('Error', 'Failed to register user.');
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
        <Text style={{ color: 'blue' }}>Already have an account? Login here.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  loginLink: {
    marginTop: 15,
    alignItems: 'center',
  },
});
