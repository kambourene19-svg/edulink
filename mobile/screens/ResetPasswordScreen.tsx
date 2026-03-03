import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function ResetPasswordScreen({ navigation, route }: any) {
    const { email, code } = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (newPassword.length < 6) {
            return Alert.alert('Information', 'Le mot de passe doit faire au moins 6 caractères.');
        }

        if (newPassword !== confirmPassword) {
            return Alert.alert('Information', 'Les mots de passe ne correspondent pas.');
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/reset-password`, { email, code, newPassword });

            Alert.alert(
                'Succès',
                'Votre mot de passe a été modifié avec succès.',
                [{ text: 'Se connecter', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            console.error('Reset password error', error);
            Alert.alert(
                'Échec',
                error.response?.data?.error || 'Une erreur est survenue.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.hero}>
                        <View style={styles.iconContainer}>
                            <Lock size={40} color="#fff" />
                        </View>
                        <Text style={styles.title}>Nouveau mot de passe</Text>
                        <Text style={styles.subtitle}>Choisissez un mot de passe sécurisé pour votre compte.</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputIconBox}>
                                <Lock size={20} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Nouveau mot de passe"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputIconBox}>
                                <Lock size={20} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmer le mot de passe"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.mainBtn, loading && styles.disabledBtn]}
                            onPress={handleReset}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.mainBtnText}>Réinitialiser</Text>
                                    <CheckCircle2 size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    scrollContent: { flexGrow: 1, padding: 24 },
    backBtn: { width: 44, height: 44, justifyContent: 'center', marginBottom: 20 },
    hero: { alignItems: 'center', marginBottom: 40 },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24
    },
    title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 32
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 64,
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 16
    },
    inputIconBox: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },
    mainBtn: {
        backgroundColor: '#1E293B',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16
    },
    disabledBtn: { opacity: 0.7 },
    mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
