import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

export default function ProfileScreen({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        nationality: '',
        idCardNumber: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const { data } = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data);
            setForm({
                fullName: data.fullName || '',
                nationality: data.nationality || '',
                idCardNumber: data.idCardNumber || '',
            });
        } catch (error: any) {
            console.error('Fetch profile error', error);
            if (error.response?.status === 403 || error.response?.status === 401) {
                handleLogout();
            } else {
                Alert.alert('Erreur', 'Impossible de charger le profil');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!form.fullName) return Alert.alert('Attention', 'Le nom complet est requis');

        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.put(`${API_URL}/auth/profile`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Succès', 'Votre profil a été mis à jour');
        } catch (error: any) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                handleLogout();
            } else {
                Alert.alert('Erreur', 'Échec de la mise à jour');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Login');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{form.fullName?.charAt(0) || 'U'}</Text>
                </View>
                <Text style={styles.phone}>{user?.phone}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations Personnelles (KYC)</Text>

                <Text style={styles.label}>Nom Complet</Text>
                <TextInput
                    style={styles.input}
                    value={form.fullName}
                    onChangeText={(text) => setForm({ ...form, fullName: text })}
                    placeholder="Ex: Jean Dupont"
                />

                <Text style={styles.label}>Nationalité</Text>
                <TextInput
                    style={styles.input}
                    value={form.nationality}
                    onChangeText={(text) => setForm({ ...form, nationality: text })}
                    placeholder="Ex: Burkinabè"
                />

                <Text style={styles.label}>N° Carte d'Identité / Passeport</Text>
                <TextInput
                    style={styles.input}
                    value={form.idCardNumber}
                    onChangeText={(text) => setForm({ ...form, idCardNumber: text })}
                    placeholder="Ex: B1234567"
                />
            </View>

            {user?.role !== 'USER' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Outils Professionnels</Text>
                    <TouchableOpacity
                        style={styles.scannerButton}
                        onPress={() => navigation.navigate('Scanner')}
                    >
                        <Text style={styles.buttonText}>Scanner un Ticket</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={[styles.button, saving && styles.disabled]}
                onPress={handleUpdate}
                disabled={saving}
            >
                <Text style={styles.buttonText}>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    phone: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 20 },
    label: { fontSize: 14, color: '#475569', marginBottom: 8, fontWeight: '500' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 16 },
    button: { backgroundColor: '#2563eb', margin: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
    scannerButton: { backgroundColor: '#1e293b', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    disabled: { opacity: 0.7 },
    logoutButton: { marginHorizontal: 20, marginBottom: 40, padding: 15, alignItems: 'center' },
    logoutButtonText: { color: '#ef4444', fontWeight: 'bold' },
});
