import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react-native';

export default function VerifyCodeScreen({ navigation, route }: any) {
    const { email } = route.params;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (code.length < 6) {
            return Alert.alert('Information', 'Le code doit contenir 6 chiffres.');
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/verify-reset-code`, { email, code });

            navigation.navigate('ResetPassword', { email, code });
        } catch (error: any) {
            console.error('Verify code error', error);
            Alert.alert(
                'Échec',
                error.response?.data?.error || 'Code invalide ou expiré.'
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
                            <ShieldCheck size={40} color="#fff" />
                        </View>
                        <Text style={styles.title}>Vérification</Text>
                        <Text style={styles.subtitle}>Un code a été envoyé à {email}. Saisissez-le ci-dessous.</Text>
                    </View>

                    <View style={styles.card}>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="000000"
                            placeholderTextColor="#94A3B8"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={code}
                            onChangeText={setCode}
                        />

                        <TouchableOpacity
                            style={[styles.mainBtn, loading && styles.disabledBtn]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.mainBtnText}>Vérifier le code</Text>
                                    <ArrowRight size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resendBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.resendText}>Renvoyer le code</Text>
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
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
        padding: 32,
        alignItems: 'center'
    },
    otpInput: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1E293B',
        textAlign: 'center',
        letterSpacing: 10,
        marginBottom: 32,
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        height: 100,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    mainBtn: {
        backgroundColor: '#1E293B',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        width: '100%'
    },
    disabledBtn: { opacity: 0.7 },
    mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    resendBtn: { marginTop: 24 },
    resendText: { color: '#64748B', fontWeight: '700', fontSize: 14 }
});
