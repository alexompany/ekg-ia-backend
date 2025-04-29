const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 🚀 Permitir imágenes grandes

const PORT = process.env.PORT || 3000;

app.post('/completions', async (req, res) => {
  const { image_base64 } = req.body;

  if (!image_base64) {
    return res.status(400).json({ error: 'Falta la imagen en base64' });
  }

  const payload = {
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${image_base64}`
            }
          },
          {
            type: "text",
            text: "Actúa como cardiólogo experto. Evalúa este EKG capturado en la imagen según guías internacionales. Diagnóstico breve y claro, máximo dos líneas. No expliques términos."
          }
        ]
      }
    ],
    max_tokens: 500
  };

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      res.json({ content });
    } else {
      res.status(500).json({ error: 'Respuesta inválida de OpenAI' });
    }
  } catch (error) {
    console.error('Error al consultar OpenAI:', error.response?.data || error.message);

    if (error.response) {
      // OpenAI respondió con error
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      // Otro tipo de error
      res.status(500).json({ error: 'Error desconocido al procesar la imagen.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto ${PORT} y listo para GPT-4 Vision`);
});

