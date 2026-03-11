import 'dotenv/config';
import express from 'express';
import cors    from 'cors';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://ade6ayo.github.io',
    ],
    methods: ['POST', 'GET'],
}));

if (!process.env.FLW_SECRET_KEY) {
    console.error('\nFLW_SECRET_KEY is not set in your .env file.');
    console.error('Get your key from https://dashboard.flutterwave.com/settings/apis\n');
    process.exit(1);
}

// Nigerian airtime biller codes (static - from Flutterwave bill categories API)
// Network  | biller_code | item_code
// MTN      | BIL099      | AT099
// Airtel   | BIL100      | AT100
// GLO      | BIL102      | AT102
// 9mobile  | BIL103      | AT103
const AIRTIME_BILLERS = {
    MTN:      { biller_code: 'BIL099', item_code: 'AT099', name: 'MTN'     },
    AIRTEL:   { biller_code: 'BIL100', item_code: 'AT100', name: 'Airtel'  },
    GLO:      { biller_code: 'BIL102', item_code: 'AT102', name: 'GLO'     },
    ETISALAT: { biller_code: 'BIL103', item_code: 'AT103', name: '9mobile' },
};

function detectNetwork(phone) {
    const p = phone.replace(/\D/g, '');
    const prefix = p.slice(0, 4);
    const MTN    = ['0703','0706','0803','0806','0810','0813','0814','0816','0903','0906','0913','0916'];
    const GLO    = ['0705','0805','0807','0811','0815','0905','0915'];
    const AIRTEL = ['0701','0708','0802','0808','0812','0901','0902','0904','0907','0912'];
    const NINE   = ['0809','0817','0818','0909','0908'];
    if (MTN.includes(prefix))    return 'MTN';
    if (GLO.includes(prefix))    return 'GLO';
    if (AIRTEL.includes(prefix)) return 'AIRTEL';
    if (NINE.includes(prefix))   return 'ETISALAT';
    return null;
}

async function flwPost(path, body) {
    const res = await fetch(`https://api.flutterwave.com/v3${path}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return res.json();
}

async function flwGet(path) {
    const res = await fetch(`https://api.flutterwave.com/v3${path}`, {
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
    });
    return res.json();
}

// POST /api/send-airtime
// Body: { playerName, phone, nin, amountNGN }
app.post('/api/send-airtime', async (req, res) => {
    const { playerName, phone, nin, amountNGN } = req.body;

    if (!phone || !/^\d{11}$/.test(phone))
        return res.status(400).json({ error: 'Invalid phone number. Must be 11 digits.' });
    if (!amountNGN || amountNGN < 50 || amountNGN > 1000)
        return res.status(400).json({ error: 'Amount must be between NGN 50 and NGN 1000.' });

    const networkKey = detectNetwork(phone);
    if (!networkKey)
        return res.status(400).json({ error: 'Could not detect Nigerian network. Please check the phone number.' });

    const biller    = AIRTIME_BILLERS[networkKey];
    const reference = `quiziq-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

    console.log(`Sending NGN${amountNGN} airtime to ${phone} (${biller.name}) | ref: ${reference}`);

    try {
        // Flutterwave bill payment - no validation step needed for airtime
        // Docs: https://developer.flutterwave.com/v3.0/reference/create-a-bill-payment
        const data = await flwPost(
            `/billers/${biller.biller_code}/items/${biller.item_code}/payment`,
            {
                country:     'NG',
                customer_id: phone,      // phone number = customer identifier for airtime
                amount:      amountNGN,  // full NGN amount (NOT kobo)
                reference,
            }
        );

        if (data.status !== 'success') {
            console.error('Flutterwave bill payment failed:', JSON.stringify(data));
            return res.status(502).json({ error: data.message || 'Airtime payment failed. Please try again.' });
        }

        console.log(`Done: NGN${amountNGN} to ${phone} (${biller.name}) | flw_ref: ${data.data?.flw_ref}`);

        return res.json({
            success:   true,
            network:   biller.name,
            reference: data.data?.reference || reference,
            flw_ref:   data.data?.flw_ref,
            amount:    amountNGN,
            phone,
        });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// GET /api/balance - check your Flutterwave NGN wallet balance
app.get('/api/balance', async (_req, res) => {
    try {
        const data = await flwGet('/balances/NGN');
        return res.json({ balance: data.data?.available_balance, currency: 'NGN' });
    } catch (err) {
        return res.status(500).json({ error: 'Could not fetch balance.' });
    }
});

// GET /api/health
app.get('/api/health', (_req, res) => res.json({ ok: true, provider: 'Flutterwave' }));

app.listen(PORT, () => {
    console.log(`\nQuizIQ airtime server running on http://localhost:${PORT}`);
    console.log(`Provider: Flutterwave (Bill Payment API)`);
    console.log(`Key loaded: ${process.env.FLW_SECRET_KEY.slice(0, 12)}...`);
    console.log(`Supported: MTN, Airtel, GLO, 9mobile\n`);
});