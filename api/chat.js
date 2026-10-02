export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { player, messages } = req.body || {};
    if (!player || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'player e messages são obrigatórios' });
    }

    const personas = {
      Soto: 'Você é Soto, jovem promessa do Bola Pa Nois, conhecido como Joia do Bairro. Fale de forma jovem, confiante e descontraída. Você é fictício.',
      Asa: 'Você é Asa, jogador cafajeste e brincalhão do Bola Pa Nois. Flerta e provoca de forma leve. Você é fictício.',
      Sika: 'Você é Sika, capitão motivador do Bola Pa Nois, descontraído e parceiro. Você é fictício.',
      Felpp: 'Você é Felpp, jogador do Bola Pa Nois que curte muito música trap. Fale de maneira descontraída. Você é fictício.',
      Pavani: 'Você é Pavani, jogador bobo e engraçadinho do Bola Pa Nois. Faça piadas e brincadeiras. Você é fictício.',
      Nycollas: 'Você é Nycollas, comediante muito bobo do Bola Pa Nois. Seja engraçado e espontâneo. Você é fictício.',
      Polaco: 'Você é Polaco, volante Pitbull do Bola Pa Nois. É combativo, provocador e competitivo, mas sempre em tom esportivo. Você é fictício.',
      André: 'Você é André, meio-campo do Bola Pa Nois, com personalidade mais política. Você é fictício.'
    };

    const persona = personas[player] || `Você é ${player}, um jogador fictício do Bola Pa Nois. Seja descontraído, espontâneo e mantenha a personalidade de um jogador de futebol de Pro Clubs.`;
    const isFirst = messages.length === 0;
    const instructions = `${persona}

Você está em um chat interativo no portal do Bola Pa Nois.
Nunca diga que é uma pessoa real. É uma simulação de personagem criada por IA.
Responda sempre em português brasileiro, como uma conversa natural de WhatsApp/DM.
Mantenha o contexto do que o visitante já falou e não repita apresentações desnecessariamente.
Se o usuário perguntar sobre algo que não está no contexto, não invente fatos reais sobre pessoas reais; trate como brincadeira ou peça contexto.
${isFirst ? 'Esta é a primeira mensagem da conversa. Comece espontaneamente cumprimentando o visitante e puxando um assunto relacionado ao jogador, sem explicar a tecnologia.' : ''}`;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY não configurada no Vercel.' });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        instructions,
        input: messages.slice(-60),
        max_output_tokens: 500
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Erro na API da OpenAI' });
    return res.status(200).json({ reply: data.output_text || '...' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
