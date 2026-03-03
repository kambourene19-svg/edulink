import axios from 'axios';

async function testSearch() {
    try {
        console.log('Testing search: Ouaga -> Bobo');
        const response = await axios.get('http://localhost:3001/api/bookings/search', {
            params: {
                departureCity: 'Ouaga',
                arrivalCity: 'Bobo'
            }
        });
        console.log('--- SUCCESS ---');
        console.log('Status:', response.status);
        console.log('Count:', response.data.length);
    } catch (error: any) {
        console.log('--- FAILED ---');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Message:', error.message);
        }
    }
}

testSearch();
