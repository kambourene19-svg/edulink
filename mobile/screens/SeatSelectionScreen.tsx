import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function SeatSelectionScreen({ route, navigation }: any) {
    const { schedule } = route.params;
    const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

    // Mock taken seats (would come from API in real app)
    const takenSeats = schedule.takenSeats || [1, 2, 5, 8];
    const totalSeats = schedule.bus.seats || 40;

    const handleBooking = () => {
        if (!selectedSeat) {
            Alert.alert('Erreur', 'Veuillez sélectionner un siège');
            return;
        }
        navigation.navigate('Payment', { schedule, seatNumber: selectedSeat });
    };

    const renderSeats = () => {
        let seats = [];
        for (let i = 1; i <= totalSeats; i++) {
            const isTaken = takenSeats.includes(i);
            const isSelected = selectedSeat === i;

            seats.push(
                <TouchableOpacity
                    key={i}
                    style={[
                        styles.seat,
                        isTaken && styles.seatTaken,
                        isSelected && styles.seatSelected
                    ]}
                    disabled={isTaken}
                    onPress={() => setSelectedSeat(i)}
                >
                    <Text style={[styles.seatText, isSelected && styles.textSelected]}>{i}</Text>
                </TouchableOpacity>
            );
        }
        return seats;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choisissez votre place</Text>
            <Text style={styles.subtitle}>{schedule.route.departureCity} ➔ {schedule.route.arrivalCity}</Text>

            <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.seat, styles.legendBox]} /><Text>Libre</Text></View>
                <View style={styles.legendItem}><View style={[styles.seat, styles.seatTaken, styles.legendBox]} /><Text>Occupé</Text></View>
                <View style={styles.legendItem}><View style={[styles.seat, styles.seatSelected, styles.legendBox]} /><Text>Sélection</Text></View>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                <View style={styles.busLayout}>
                    {/* Driver */}
                    <View style={styles.driverSection}>
                        <Text style={styles.driverText}>Chauffeur</Text>
                    </View>
                    <View style={styles.seatsContainer}>
                        {renderSeats()}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.price}>Prix: {schedule.route.price} FCFA</Text>
                <TouchableOpacity
                    style={[styles.button, !selectedSeat && styles.buttonDisabled]}
                    disabled={!selectedSeat}
                    onPress={handleBooking}
                >
                    <Text style={styles.buttonText}>Continuer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
    legend: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 15 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendBox: { width: 20, height: 20, margin: 0 },

    grid: { alignItems: 'center' },
    busLayout: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    driverSection: { borderBottomWidth: 1, borderColor: '#ddd', paddingBottom: 10, marginBottom: 10, alignItems: 'center' },
    driverText: { color: '#999', fontSize: 12 },
    seatsContainer: { flexDirection: 'row', flexWrap: 'wrap', width: 220, justifyContent: 'space-between', gap: 10 },

    seat: { width: 45, height: 45, backgroundColor: '#e5e7eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: 2 },
    seatTaken: { backgroundColor: '#ef4444', opacity: 0.5 },
    seatSelected: { backgroundColor: '#22c55e' },
    seatText: { color: '#333', fontWeight: 'bold' },
    textSelected: { color: '#fff' },

    footer: { marginTop: 20, borderTopWidth: 1, borderColor: '#ddd', paddingTop: 20 },
    price: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#2563EB' },
    button: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#9ca3af' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
