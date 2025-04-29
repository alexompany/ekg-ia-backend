const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 🛡️ Por si la imagen es grande

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
            text: "Actúa como cardiólogo experto. Evalúa esta imagen de EKG según criterios clínicos actualizados. Indica el diagnóstico con máximo una línea de comentario."
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

    const content = response.data.choices[0].message.content;
    res.json({ content });
  } catch (error) {
    console.error('Error al consultar OpenAI:', error.message);
    res.status(500).json({ error: 'Error al procesar la imagen.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor GPT-4 Vision activo en puerto ${PORT}`);
});
