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
        console.log('Response Status:', response.status);
        console.log('Results count:', response.data.length);
        if (response.data.length > 0) {
            console.log('First result:', JSON.stringify(response.data[0], null, 2));
        }
    } catch (error: any) {
        console.error('Search Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testSearch();
