import express, { Request, Response } from 'express';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let sock: any = null;
let qrCodeValue: string | null = null;
let isConnected = false;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        logger: pino({ level: 'silent' }) as any,
        printQRInTerminal: true,
        auth: state,
        browser: Browsers.macOS('Desktop')
    });

    sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeValue = qr;
            console.log('QR Code gerado. Escaneie abaixo:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            isConnected = false;
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada devido a ', lastDisconnect?.error, ', reconectando:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            isConnected = true;
            qrCodeValue = null;
            console.log('WhatsApp conectado com sucesso!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'UP', connected: isConnected });
});

app.get('/qr', (req: Request, res: Response) => {
    res.json({ connected: isConnected, qr: qrCodeValue });
});

app.post('/api/send', async (req: Request, res: Response) => {
    try {
        const { phone, message } = req.query;

        if (!phone || !message) {
            return res.status(400).json({ error: 'Parâmetros phone e message são obrigatórios' });
        }

        if (!isConnected || !sock) {
            return res.status(503).json({ error: 'WhatsApp não está conectado. Escaneie o QR Code.' });
        }

        let formattedPhone = String(phone).replace(/\D/g, '');
        if (!formattedPhone.startsWith('55')) {
            formattedPhone = '55' + formattedPhone;
        }
        const jid = `${formattedPhone}@s.whatsapp.net`;

        await sock.sendMessage(jid, { text: String(message) });

        return res.json({ success: true, recipient: jid });
    } catch (err: any) {
        console.error('Erro ao enviar mensagem WhatsApp:', err);
        return res.status(500).json({ error: err.message || 'Erro interno' });
    }
});

app.listen(PORT, () => {
    console.log(`Microsserviço notificacoes-whatsapp rodando na porta ${PORT}`);
    connectToWhatsApp();
});
