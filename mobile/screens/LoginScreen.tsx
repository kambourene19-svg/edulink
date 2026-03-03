import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { Phone, Lock, User, ArrowRight, Bus, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    React.useEffect(() => {
        checkToken();
    }, []);

    const checkToken = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            navigation.replace('Search');
        }
    };

    const handleAuth = async () => {
        if (!phone || !password || (isRegister && !fullName)) {
            return Alert.alert('Information', 'Veuillez remplir tous les champs.');
        }

        setLoading(true);
        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const payload = isRegister
                ? { phone, password, fullName }
                : { phone, password };

            const { data } = await axios.post(`${API_URL}${endpoint}`, payload);

            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user || {}));
                navigation.replace('Search');
            }
        } catch (error: any) {
            console.error('Auth error', error);
            Alert.alert(
                'Échec',
                error.response?.data?.error || 'Une erreur est survenue lors de la connexion.'
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <View style={styles.hero}>
                        <View style={styles.logoContainer}>
                            <Bus size={32} color="#fff" />
                        </View>
                        <Text style={styles.brandTitle}>FasoTicket</Text>
                        <Text style={styles.brandTagline}>Le voyage à portée de main.</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.formTitle}>
                                {isRegister ? 'Inscription' : 'Connexion'}
                            </Text>
                            <Text style={styles.formSubtitle}>
                                {isRegister ? 'Prêt pour votre premier voyage ?' : 'Bon retour parmi nous !'}
                            </Text>
                        </View>

                        <View style={styles.form}>
                            {isRegister && (
                                <View style={styles.inputGroup}>
                                    <View style={styles.inputIconBox}>
                                        <User size={20} color="#94A3B8" />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nom Complet"
                                        placeholderTextColor="#94A3B8"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        autoCapitalize="words"
                                    />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconBox}>
                                    <Phone size={20} color="#94A3B8" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Numéro de téléphone"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconBox}>
                                    <Lock size={20} color="#94A3B8" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mot de passe"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            {!isRegister && (
                                <TouchableOpacity
                                    style={styles.forgotBtn}
                                    onPress={() => navigation.navigate('ForgotPassword')}
                                >
                                    <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.mainBtn, loading && styles.disabledBtn]}
                                onPress={handleAuth}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.mainBtnText}>
                                            {isRegister ? "S'inscrire" : 'Se connecter'}
                                        </Text>
                                        <ArrowRight size={20} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.switchBox}>
                                <Text style={styles.switchLabel}>
                                    {isRegister ? 'Avez-vous déjà un compte ?' : "Vous n'avez pas encore de compte ?"}
                                </Text>
                                <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
                                    <Text style={styles.switchBtnText}>
                                        {isRegister ? 'Se connecter' : "S'inscrire"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <ShieldCheck size={16} color="#CBD5E1" />
                        <Text style={styles.footerText}>Sécurisé par FasoTicket Pay</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
    hero: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
    logoContainer: {
        width: 72,
        height: 72,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: 20
    },
    brandTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
    brandTagline: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '500' },
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
    cardHeader: { marginBottom: 32 },
    formTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    form: { gap: 16 },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 64,
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    inputIconBox: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },
    forgotBtn: { alignSelf: 'flex-end', marginTop: -8 },
    forgotText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
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
    mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    switchBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        alignItems: 'center'
    },
    switchLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    switchBtnText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 'auto',
        paddingTop: 32
    },
    footerText: { fontSize: 12, fontWeight: '600', color: '#475569' }
});
