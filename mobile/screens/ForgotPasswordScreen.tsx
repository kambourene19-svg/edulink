import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async () => {
        if (!email) {
            return Alert.alert('Information', 'Veuillez saisir votre adresse email.');
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/auth/request-reset-password`, { email });

            // Pour le test, on affiche l'URL de prévisualisation si elle existe
            if (data.previewUrl) {
                console.log('🔗 [TEST] Preview URL:', data.previewUrl);
            }

            Alert.alert(
                'Succès',
                'Si cet email existe, un code de vérification a été envoyé.',
                [{ text: 'OK', onPress: () => navigation.navigate('VerifyCode', { email }) }]
            );
        } catch (error: any) {
            console.error('Reset request error', error);
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
                            <Mail size={40} color="#fff" />
                        </View>
                        <Text style={styles.title}>Mot de passe oublié</Text>
                        <Text style={styles.subtitle}>Saisissez votre email pour recevoir un code de vérification.</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputIconBox}>
                                <Mail size={20} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="votre-email@exemple.com"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.mainBtn, loading && styles.disabledBtn]}
                            onPress={handleRequestReset}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.mainBtnText}>Envoyer le code</Text>
                                    <ArrowRight size={20} color="#fff" />
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10
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
        marginBottom: 24
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
        gap: 12
    },
    disabledBtn: { opacity: 0.7 },
    mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
