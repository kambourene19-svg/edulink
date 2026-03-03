import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar, Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import { Search, MapPin, Navigation, Calendar, Filter, ArrowRight, User, Briefcase, Ticket } from 'lucide-react-native';

export default function SearchScreen({ navigation }: any) {
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        });
    }, [navigation]);

    const formatCity = (city: string) => {
        if (!city) return '';
        return city.trim().charAt(0).toUpperCase() + city.trim().slice(1);
    };

    const searchSchedules = async () => {
        if (!departure && !arrival) return;
        setSearching(true);
        try {
            console.log('[SEARCH] URL:', `${API_URL}/bookings/search`);
            const { data } = await axios.get(`${API_URL}/bookings/search`, {
                params: {
                    departureCity: formatCity(departure),
                    arrivalCity: formatCity(arrival)
                },
                timeout: 10000
            });
            setResults(data);
            if (data.length === 0) {
                alert('Aucun trajet trouvé pour ces villes. Vérifiez l\'orthographe ou essayez d\'autres villes.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.error || error?.message || 'Erreur inconnue';
            const status = error?.response?.status || '';
            console.error('[SEARCH ERROR]', msg, status);
            alert(`Erreur de recherche${status ? ' (' + status + ')' : ''}: ${msg}`);
        } finally {
            setSearching(false);
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => navigation.navigate('SeatSelection', { schedule: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.brandContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>{item.route.company.name.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.companyName}>{item.route.company.name}</Text>
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>Vérifié</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.price}>{item.route.price.toLocaleString()} <Text style={styles.currency}>CFA</Text></Text>
            </View>

            <View style={styles.routeContainer}>
                <View style={styles.cityInfo}>
                    <Text style={styles.timeText}>
                        {new Date(item.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.cityName}>{item.route.departureCity}</Text>
                </View>

                <View style={styles.pathLine}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                    <Navigation size={14} color="#CBD5E1" />
                    <View style={styles.line} />
                    <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                </View>

                <View style={[styles.cityInfo, { alignItems: 'flex-end' }]}>
                    <Text style={styles.timeText}>Arrivée</Text>
                    <Text style={styles.cityName}>{item.route.arrivalCity}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.busBadge}>
                    <Text style={styles.busLabel}>Bus: {item.bus.plate}</Text>
                </View>
                <View style={styles.seatsBadge}>
                    <Text style={styles.seatsText}>{item.bus.seats} places</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Réserver</Text>
                    <ArrowRight size={14} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Custom Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Bonjour 👋</Text>
                    <Text style={styles.headerTitle}>Où allez-vous ?</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => navigation.navigate('MyBookings')} style={styles.iconBtn}>
                        <Ticket size={22} color="#1E293B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn}>
                        <User size={22} color="#1E293B" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Box */}
            <View style={styles.searchBox}>
                <View style={styles.inputGroup}>
                    <MapPin size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Départ"
                        placeholderTextColor="#94A3B8"
                        value={departure}
                        onChangeText={setDeparture}
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.inputGroup}>
                    <Navigation size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Destination"
                        placeholderTextColor="#94A3B8"
                        value={arrival}
                        onChangeText={setArrival}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.searchBtn, searching && { opacity: 0.7 }]}
                    onPress={searchSchedules}
                    disabled={searching}
                >
                    <Search size={20} color="#fff" />
                    <Text style={styles.searchBtnText}>{searching ? 'Recherche...' : 'Trouver un billet'}</Text>
                </TouchableOpacity>
            </View>

            {/* Results Title */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                    {results.length > 0 ? `${results.length} voyages trouvés` : 'Destinations populaires'}
                </Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={16} color="#475569" />
                    <Text style={styles.filterBtnText}>Filtres</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={results}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Briefcase size={40} color="#CBD5E1" />
                        </View>
                        <Text style={styles.emptyTitle}>Commencez votre recherche</Text>
                        <Text style={styles.emptySub}>Entrez vos villes de départ et d'arrivée pour voir les trajets disponibles.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        marginBottom: 24
    },
    greeting: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 4 },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
    headerActions: { flexDirection: 'row', gap: 12 },
    iconBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    searchBox: {
        backgroundColor: '#fff',
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 20,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: 32
    },
    inputGroup: { flexDirection: 'row', alignItems: 'center', height: 56 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
    searchBtn: {
        backgroundColor: '#1E293B',
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 16
    },
    searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16
    },
    resultsTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10
    },
    filterBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
    list: { paddingHorizontal: 24, paddingBottom: 40 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoPlaceholder: {
        width: 44,
        height: 44,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoText: { fontSize: 16, fontWeight: '900', color: '#64748B' },
    companyName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    tagBadge: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start'
    },
    tagText: { fontSize: 9, fontWeight: '800', color: '#16A34A', textTransform: 'uppercase' },
    price: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
    currency: { fontSize: 12, color: '#64748B' },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16
    },
    cityInfo: { flex: 1 },
    timeText: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4 },
    cityName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    pathLine: { flexDirection: 'row', alignItems: 'center', flex: 0.8, justifyContent: 'center', gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
    line: { height: 2, flex: 1, backgroundColor: '#E2E8F0', borderRadius: 1 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    busBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    busLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
    seatsBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    seatsText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
    bookButton: {
        marginLeft: 'auto',
        backgroundColor: '#1E293B',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    bookButtonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyIconBox: {
        width: 80,
        height: 80,
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
    emptySub: { fontSize: 14, fontWeight: '500', color: '#64748B', textAlign: 'center', lineHeight: 20 }
});
