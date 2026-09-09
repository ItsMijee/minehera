import express from 'express';
import multer from 'multer';
import cors from 'cors';
import FormData from 'form-data';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// URL Webhook Discord MineHera
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1547126288945520640/OIgsQmFbf13m2RhNSwRGa1iCMol98BbDxFENNfWimglUizF0Gz0FsDj9QeJtDnS62BXy';

// Izinkan CORS & Body Parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const usedProofHashes = new Set();

/**
 * Handler Endpoint Webhook
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const handleWebhook = async (req, res) => {
  try {
    const { 
      username = 'Player', 
      platform = 'JAVA', 
      itemName = 'Item', 
      price = '0',
      proofId = ''
    } = req.body;

    if (proofId && usedProofHashes.has(proofId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bukti transfer ini sudah pernah digunakan!' 
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Bukti transfer wajib diunggah!'
      });
    }

    const numericNominal = parseInt(price, 10) || 0;
    const formattedNominal = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(numericNominal);

    const formData = new FormData();

    const embedData = {
      username: 'Donation Logs',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/893/893097.png',
      embeds: [
        {
          title: '⚡ TRANSAKSI & BUKTI TF MASUK',
          color: 5763719,
          fields: [
            { name: '👤 Username', value: '`' + username + '`', inline: true },
            { name: '🎮 Platform', value: '`' + platform.toUpperCase() + '`', inline: true },
            { name: '📦 Item / Rank', value: '**' + itemName + '**', inline: true },
            { name: '💰 Nominal Bayar', value: '**' + formattedNominal + '**', inline: true },
            { name: '📡 Status System', value: '`🟢 Verified Sent`', inline: true }
          ],
          image: { url: 'attachment://bukti_tf.png' },
          footer: { text: 'Server Log System • MineHera' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    formData.append('payload_json', JSON.stringify(embedData));
    formData.append('file', req.file.buffer, {
      filename: 'bukti_tf.png',
      contentType: req.file.mimetype
    });

    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (!discordResponse.ok) {
      throw new Error('Gagal mengirim data ke Discord Webhook');
    }

    if (proofId) {
      usedProofHashes.add(proofId);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Bukti transfer & transaksi berhasil terverifikasi!' 
    });

  } catch (error) {
    const err = /** @type {Error} */ (error);
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Terjadi kesalahan internal server' 
    });
  }
};

app.post('/api/verify-payment', upload.single('proof'), handleWebhook);

app.listen(PORT, () => {
  console.log('Server MineHera jalan di http://localhost:' + PORT);
});
