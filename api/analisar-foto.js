// api/analisar-foto.js
// Função serverless do Vercel que recebe uma foto em base64,
// envia para a API da Anthropic com visão computacional,
// e retorna a identificação do produto/código.
//
// A chave ANTHROPIC_API_KEY fica protegida nas variáveis de
// ambiente do Vercel - nunca é exposta no código do front-end.

export default async function handler(req, res) {
  // CORS - permite chamadas do mesmo domínio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { imagem, listaProdutos } = req.body;

    if (!imagem) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave de API não configurada no servidor' });
    }

    // Remove o prefixo data:image/...;base64, se vier completo
    const base64Data = imagem.replace(/^data:image\/\w+;base64,/, '');

    // Detectar tipo de mídia
    let mediaType = 'image/jpeg';
    if (imagem.includes('image/png')) mediaType = 'image/png';
    if (imagem.includes('image/webp')) mediaType = 'image/webp';

    // Montar contexto com produtos cadastrados (se enviado)
    let contextoProdutos = '';
    if (listaProdutos && Array.isArray(listaProdutos) && listaProdutos.length > 0) {
      contextoProdutos = `\n\nLista de produtos cadastrados no estoque (nome | codigo):\n` +
        listaProdutos.map(p => `${p.nome} | ${p.codigo || 'sem-codigo'}`).join('\n');
    }

    const prompt = `Você é um assistente de loja de roupas infantis. Analise esta foto que pode ser:
- Um código de barras ou QR code difícil de ler
- Uma etiqueta de produto com texto/código
- Uma peça de roupa (vestido, conjunto, calçado, acessório)

Tarefas:
1. Se houver texto ou código visível, transcreva exatamente o que está escrito.
2. Se for uma peça de roupa, descreva: tipo de peça, cor predominante, características visíveis.
${contextoProdutos}

Se a lista de produtos foi fornecida acima, tente identificar qual produto da lista mais se parece com o da foto e responda APENAS em JSON no formato:
{"codigo_lido": "texto ou codigo encontrado, ou null", "produto_sugerido": "nome exato do produto da lista mais provável, ou null", "descricao": "breve descrição do que foi visto"}

Se não houver lista de produtos, responda apenas com o JSON usando produto_sugerido: null.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{
          role: 'user',
