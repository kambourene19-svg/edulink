import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;

async function testCinetPay() {
    console.log('--- CinetPay Connectivity Test ---');
    console.log('Site ID:', CINETPAY_SITE_ID);
    console.log('API Key:', CINETPAY_API_KEY ? '******' + CINETPAY_API_KEY.slice(-4) : 'MISSING');

    const payload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: `TEST-${Date.now()}`,
        amount: 100,
        currency: "XOF",
        description: "Test Connectivity",
        customer_id: "test_user_1",
        customer_name: "Test",
        customer_surname: "User",
        customer_email: "test@example.com",
        customer_phone_number: "70000000",
        customer_address: "Ouaga",
        customer_city: "Ouaga",
        customer_country: "BF",
        notify_url: "https://example.com/notify",
        return_url: "https://example.com/return",
        channels: "ALL",
        lang: "fr"
    };

    try {
        const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', payload);
        console.log('Response Code:', response.data.code);
        console.log('Response Message:', response.data.message);
        if (response.data.code === '201') {
            console.log('SUCCESS: CinetPay initialized correctly.');
            console.log('Payment URL:', response.data.data.payment_url);
        } else {
            console.log('FAILURE: CinetPay returned an error.');
            console.log('Details:', response.data);
        }
    } catch (error: any) {
        console.error('ERROR during API call:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testCinetPay();
