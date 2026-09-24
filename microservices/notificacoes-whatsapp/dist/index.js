"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = __importDefault(require("pino"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT || 3000;
let sock = null;
let qrCodeValue = null;
let isConnected = false;
async function connectToWhatsApp() {
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)('auth_info_baileys');
    sock = (0, baileys_1.default)({
        logger: (0, pino_1.default)({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: baileys_1.Browsers.macOS('Desktop')
    });
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrCodeValue = qr;
            console.log('QR Code gerado. Escaneie abaixo:');
            qrcode_terminal_1.default.generate(qr, { small: true });
        }
        if (connection === 'close') {
            isConnected = false;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
            console.log('Conexão fechada devido a ', lastDisconnect?.error, ', reconectando:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        }
        else if (connection === 'open') {
            isConnected = true;
            qrCodeValue = null;
            console.log('WhatsApp conectado com sucesso!');
        }
    });
    sock.ev.on('creds.update', saveCreds);
}
app.get('/health', (req, res) => {
    res.json({ status: 'UP', connected: isConnected });
});
app.get('/qr', (req, res) => {
    res.json({ connected: isConnected, qr: qrCodeValue });
});
app.post('/api/send', async (req, res) => {
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
    }
    catch (err) {
        console.error('Erro ao enviar mensagem WhatsApp:', err);
        return res.status(500).json({ error: err.message || 'Erro interno' });
    }
});
app.listen(PORT, () => {
    console.log(`Microsserviço notificacoes-whatsapp rodando na porta ${PORT}`);
    connectToWhatsApp();
});
