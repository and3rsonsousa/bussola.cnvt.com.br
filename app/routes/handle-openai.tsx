import { OpenAI } from "openai";
import type { ActionFunctionArgs } from "react-router";

export const config = { runtime: "edge" };

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  let { title, description, prompt, intent, model, context, length } =
    Object.fromEntries(formData.entries()) as Record<string, string>;

  if (!intent) {
    return { message: "Defina a sua intenção nesse comando." };
  }

  let system =
    "Você é um especialista em storytelling e copywriting para redes sociais.";

  const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });

  let content = "";

  if (intent === "ideas") {
    // Gera ideias PDF 1 idea 10 conteúdos
    system =
      "Você é Jéssica, uma Social Media Storyteller, especialista em transformar uma única ideia em vários conteúdos envolventes para o Instagram.";

    content = `Sua tarefa é pegar um tópico central fornecido pelo usuário e gerar 10 conteúdos únicos em português, adaptados ao nicho e público-alvo especificados, se fornecidos. Se não houver nicho ou público definido, assuma um público geral e crie conteúdos amplamente atraentes.
    
    Requisitos de Entrada:
- Esse é o tópico central: ${description}.
- Opcionalmente, o usuário pode especificar um nicho (ex.: nutrição, educação, relacionamentos) e público-alvo (ex.: jovens adultos, casais, entusiastas de fitness).
- Requisitos de Saída:Gere 10 conteúdos para o Instagram baseados no tópico central, usando os seguintes formatos:


- Carrossel com Storytelling
- Carrossel com Conteúdo Técnico
- Reel Narrado
- Reel Tutorial
- Carrossel com Indicação
- Carrossel com Estudo de Caso
- Reel POV
- Reel Técnico
- Carrossel com Posicionamento
- Stories

Para cada conteúdo:

- Forneça um Título (cativante e envolvente, máx. 10 palavras).
- Forneça uma Descrição (explique o conteúdo, incluindo pontos-chave, tom e como engaja o público, máx. 100 palavras).
- Inclua um Chamada para Ação (CTA) (ex.: "Comente sua experiência!" ou "Salve este post!").
- Mantenha consistência de marca com um tom coeso (ex.: educativo, inspirador, divertido) e alinhado ao nicho/público.
- Incentive a interação do público (ex.: perguntas, enquetes ou conteúdo compartilhável).

Passos a Seguir:

- Use o tópico central como base para todos os conteúdos.
- Adapte o tópico a cada um dos 10 formatos, garantindo variedade na abordagem (ex.: histórias pessoais, insights técnicos, tutoriais).
- Diversifique os conteúdos para atrair diferentes segmentos do público (ex.: consumo rápido vs. aprofundado).
- Siga as melhores práticas: planeje postagens espaçadas, mantenha consistência e diversifique formatos para evitar saturação.

Restrições:

- Todos os conteúdos devem ser em português.
- Os conteúdos devem ser autênticos, envolventes e alinhados ao ecossistema dinâmico do Instagram (Reels, Stories, Carrosséis).
- Evite linguagem excessivamente promocional, a menos que especificado; foque em conteúdos baseados em valor (ex.: educação, inspiração).
- Se não houver nicho especificado, crie conteúdos adaptáveis a múltiplos nichos.
- Não repita a mesma abordagem ou mensagem entre os formatos; cada peça deve ser única.



Exemplo de Saída (para um formato):

<h3>Tópico Central: "Alimentos sem glúten"</h3>
<p>
<strong>Nicho</strong>: Nutrição <br/>
<strong>Público-Alvo:</strong> Pessoas com intolerância ao glúten 
</p>

<h4>1 - Carrossel com Storytelling</h4>
<p>
<strong>Título</strong>: "Minha jornada sem glúten mudou tudo!" <br/>
<strong>Descrição</strong>: Compartilhe uma história pessoal sobre descobrir a intolerância ao glúten, com 5 slides detalhando sintomas, desafios e adaptações. Use tom emotivo para criar conexão, incluindo uma citação inspiradora. Engaja ao mostrar vulnerabilidade e inspirar mudanças.<br/>
<strong>CTA</strong>: "Conte sua história nos comentários!"<br/>
</p>

Tom e Estilo:

- Use um tom conversacional e acessível, como se estivesse falando com um amigo.
- Incorpore nuances culturais brasileiras se adequado ao público.
- Seja criativa, prática e inspiradora, refletindo a ênfase em storytelling e engajamento.

Notas Adicionais:

- Se o usuário fornecer uma marca ou contexto específico, incorpore isso no tom e nos visuais.
- Para Stories, inclua elementos interativos como enquetes, quizzes ou stickers de perguntas.
- Para Reels, priorize conteúdos dinâmicos e curtos (15-30 segundos) com áudio em alta ou transições suaves.

Orientações sobre o retorno:

- Retorne o conteúdo em formato de parágrafos, com cada item numerado e separado por quebras de linha.
- Use apenas tags HTML para formatação como <p> e <br>.
- NÃO USE markdown.
- Não inclua informações adicionais ou comentários pessoais; concentre-se apenas no conteúdo solicitado.
- Retorne apenas o conteúdo sem aspas.

`;
  } else if (intent === "shrink") {
    // Reduzir o texto
    system = "Você é um copywritter experiente.";
    content = `Reduza o TEXTO em 25% sem alterar o sentido ou mudar o tom de voz, mas pode reescrever e mudar o número de parágrafos. TEXTO: ${description}.`;
  } else if (intent === "expand") {
    // Aumentar o texto
    system = "Você é um copywritter experiente.";
    content = `Aumente o TEXTO em 25% sem alterar o sentido ou mudar o tom de voz. TEXTO: ${description}.`;
  } else if (intent === "prompt") {
    // Executa o prompt
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${prompt.toString()}. Retorne sem aspas e com tags html, sem markdown.`,
        },
      ],
      model: "gpt-4o-mini",
    });

    return { message: chatCompletion.choices[0].message.content };
  } else if (
    ["reels", "title", "carousel", "caption", "stories"].find(
      (i) => i === intent,
    )
  ) {
    switch (intent) {
      case "reels": {
        system =
          "Você é um especialista em storytelling e copywriting para redes sociais com ampla experiência em criar vídeos virais.";
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.reel[model as keyof typeof storytellingModels.reel].title}.

    Siga a estrutura abaixo:
${storytellingModels.reel[model as keyof typeof storytellingModels.reel].structure}

O objetivo principal é gerar ${storytellingModels.reel[model as keyof typeof storytellingModels.reel].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite cada bloco (slide, cena ou etapa) a no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- O formato de saída deve ser HTML puro, com a estrutura abaixo:

<h4>Slide 1</h4>
<p>Seu conteúdo aqui</p>

<h4>Slide 2</h4>
<p>Seu conteúdo aqui</p>

... e assim por diante até o encerramento com CTA
Não use aspas, bullet points, markdown ou comentários adicionais.
O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;

        break;
      }
      case "carousel": {
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.carrossel[model as keyof typeof storytellingModels.carrossel].title}.

    Siga a estrutura abaixo:
${storytellingModels.carrossel[model as keyof typeof storytellingModels.carrossel].structure}

O objetivo principal é gerar ${storytellingModels.carrossel[model as keyof typeof storytellingModels.carrossel].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite cada bloco (slide, cena ou etapa) a no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- O formato de saída deve ser HTML puro, com a estrutura abaixo:

<h4>Slide 1</h4>
<p>Seu conteúdo aqui</p>

<h4>Slide 2</h4>
<p>Seu conteúdo aqui</p>

... e assim por diante até o encerramento com CTA
Não use aspas, bullet points, markdown ou comentários adicionais.
O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;

        break;
      }
      case "title": {
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.titulos[model as keyof typeof storytellingModels.titulos].title}.

    Siga os exemplos abaixo:
${storytellingModels.titulos[model as keyof typeof storytellingModels.titulos].examples.join("\n")}


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite a 12 palavras.
- O formato de saída deve ser sem nenhuma formatação puro
- Não use aspas, bullet points, markdown ou comentários adicionais.
- O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;
        break;
      }
      case "caption": {
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.legenda[model as keyof typeof storytellingModels.legenda].title}.

    Siga a estrutura abaixo:
${storytellingModels.legenda[model as keyof typeof storytellingModels.legenda].description}

O objetivo principal é gerar ${storytellingModels.legenda[model as keyof typeof storytellingModels.legenda].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use expressões genéricos.
- O texto deve ter ${length} palavras. Nunca mais do que isso.
- Cada parágrafo deve ter no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- Não use tags, aspas, bullet points, markdown ou comentários adicionais.
- O resultado deve conter somente o texto solicitado.
- Inclua pelo menos um emoji por parágrafo

Tema a ser desenvolvido: ${title} - ${description}
`;

        break;
      }
      case "stories": {
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.stories[model as keyof typeof storytellingModels.stories].title}.

    Siga a estrutura abaixo:
${storytellingModels.stories[model as keyof typeof storytellingModels.stories].structure}

O objetivo principal é gerar ${storytellingModels.stories[model as keyof typeof storytellingModels.stories].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite cada bloco a no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- O formato de saída deve ser a estrutura abaixo:
- Sugira um elemento de engajamento dos stories de acordo com a necessidade

Story 1
Seu conteúdo aqui
Elemento de engajamento (Se for necessário)

Slide 2
Seu conteúdo aqui
Elemento de engajamento (Se for necessário)

... e assim por diante até o encerramento com CTA
Não use aspas, bullet points, tags, markdown ou comentários adicionais.
O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;
        break;
      }
    }
  }
  // Se for carrossel
  else if (intent === "carousel") {
    type Modelkey = keyof typeof storytellingModels.carrossel;
    const typedModel = model as Modelkey;

    content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.carrossel[typedModel].title}.

    Siga a estrutura abaixo:
${storytellingModels.carrossel[typedModel].structure}

O objetivo principal é gerar ${storytellingModels.carrossel[typedModel].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite cada bloco (slide, cena ou etapa) a no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- O formato de saída deve ser HTML puro, com a estrutura abaixo:

<h4>Slide 1</h4>
<p>Seu conteúdo aqui</p>

<h4>Slide 2</h4>
<p>Seu conteúdo aqui</p>

... e assim por diante até o encerramento com CTA
Não use aspas, bullet points, markdown ou comentários adicionais.
O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;
  } else if (intent === "title") {
    system = `Você é um copywriter jovem e astuto especializado em stotytelling.`;

    content = `Sua missão é criar títulos antiflop para postagens no Instagram.
    
  REGRAS: Retorne apenas o texto sem nenhuma observação. Texto somente com parágrafos e sem tags html. Retorne apenas uma frase sem aspas. O título deve ter no máximo 12 palavras. 
  EMPRESA: ${context}.
  CONTEXTO: Título do post: '${title}, descrição: ${description}'
  `;
  }

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content,
      },
    ],
    model: "gpt-4o",
  });

  return { message: chatCompletion.choices[0].message.content };
};

export const storytellingModels = {
  carrossel: {
    storytelling: {
      title: "Storytelling Clássico",
      structure: `
  <h4>Slide 1</h4>
  <p>Gancho forte, emocional ou provocativo</p>
  <h4>Slide 2</h4>
  <p>Contexto inicial do personagem ou situação</p>
  <h4>Slide 3</h4>
  <p>Desejo ou objetivo do personagem</p>
  <h4>Slide 4</h4>
  <p>Obstáculo, desafio ou conflito</p>
  <h4>Slide 5</h4>
  <p>Virada, descoberta ou mudança</p>
  <h4>Slide 6</h4>
  <p>Resultado ou transformação</p>
  <h4>Slide 7</h4>
  <p>Encerramento com chamada para ação (CTA)</p>
      `.trim(),
      effect: "Conexão emocional, empatia e identificação",
    },
    educacional: {
      title: "Educacional / Conteúdo Rico",
      structure: `
  <h4>Slide 1</h4>
  <p>Título claro que mostra o valor do conteúdo</p>
  <h4>Slide 2–6</h4>
  <p>Conceito explicado em blocos simples e objetivos</p>
  <h4>Slide Final</h4>
  <p>Conclusão resumida + CTA direto</p>
      `.trim(),
      effect: "Credibilidade, valor prático e autoridade",
    },
    checklist: {
      title: "Checklist / Passo a Passo",
      structure: `
  <h4>Slide 1</h4>
  <p>Promessa de transformação ou ganho ao seguir os passos</p>
  <h4>Slide 2–6</h4>
  <p>Etapas claras e numeradas</p>
  <h4>Slide Final</h4>
  <p>Reforço do benefício + chamada para ação</p>
      `.trim(),
      effect: "Organização, ação imediata e clareza",
    },
    mitos: {
      title: "Mitos vs Verdades",
      structure: `
  <h4>Slide 1</h4>
  <p>Mito forte que o público provavelmente acredita</p>
  <h4>Slide 2–6</h4>
  <p>Mito → Verdade explicada e justificada</p>
  <h4>Slide Final</h4>
  <p>Reflexão ou alerta + CTA</p>
      `.trim(),
      effect: "Quebra de crenças, educação com impacto",
    },
    comparativo: {
      title: "Comparativo / A vs B",
      structure: `
  <h4>Slide 1</h4>
  <p>Pergunta ou título provocativo do tipo: “Você faz isso ou aquilo?”</p>
  <h4>Slide 2–6</h4>
  <p>Comparações (ex: antes/depois, certo/errado, com/sem)</p>
  <h4>Slide Final</h4>
  <p>Resumo e convite à ação ou reflexão</p>
      `.trim(),
      effect: "Valorização de solução, contraste visual e clareza",
    },
    frases: {
      title: "Frases Fragmentadas",
      structure: `
  <h4>Slide 1–6</h4>
  <p>Frases curtas, fortes e impactantes, uma por slide</p>
  <h4>Slide Final</h4>
  <p>Conclusão com moral + CTA emocional</p>
      `.trim(),
      effect: "Impacto emocional, estilo literário e compartilhamento",
    },
    bastidores: {
      title: "Bastidores / Diário Pessoal",
      structure: `
  <h4>Slide 1</h4>
  <p>Introdução de uma situação pessoal ou confissão real</p>
  <h4>Slide 2–5</h4>
  <p>Detalhes do que aconteceu, como se sentiu, o que fez</p>
  <h4>Slide Final</h4>
  <p>Aprendizado ou reflexão + CTA</p>
      `.trim(),
      effect: "Humanização, autenticidade e aproximação",
    },
    analise: {
      title: "Análise de Caso",
      structure: `
  <h4>Slide 1</h4>
  <p>Nome, contexto ou título do caso</p>
  <h4>Slide 2–5</h4>
  <p>Situação, análise, o que funcionou ou não</p>
  <h4>Slide Final</h4>
  <p>Aprendizado central + chamada pra ação</p>
      `.trim(),
      effect: "Autoridade técnica com provas reais",
    },
    refraseamento: {
      title: "Refraseamento Estratégico",
      structure: `
  <h4>Slide 1</h4>
  <p>Frase problemática ou erro comum de comunicação</p>
  <h4>Slide 2–5</h4>
  <p>Antes: como é dito errado / Depois: como falar melhor</p>
  <h4>Slide Final</h4>
  <p>Conclusão com reforço de clareza + CTA</p>
      `.trim(),
      effect: "Clareza de comunicação, evolução de linguagem",
    },
    critica: {
      title: "Crítica Construtiva",
      structure: `
  <h4>Slide 1</h4>
  <p>Declaração crítica ou provocativa</p>
  <h4>Slide 2–4</h4>
  <p>Justificativa, exemplos, argumentação</p>
  <h4>Slide Final</h4>
  <p>Nova perspectiva e convite à ação</p>
      `.trim(),
      effect: "Engajamento crítico, polarização saudável",
    },
    ctaInvertido: {
      title: "CTA Invertido",
      structure: `
  <h4>Slide 1</h4>
  <p>Chamada direta pra ação (ex: agende agora, leia isso etc.)</p>
  <h4>Slide 2–5</h4>
  <p>Justificativas e reforços para essa chamada</p>
  <h4>Slide Final</h4>
  <p>Encerramento e reforço emocional do CTA</p>
      `.trim(),
      effect: "Cliques rápidos, senso de urgência, mobilização",
    },
    guiaSituacional: {
      title: "Mini Guia de Situação",
      structure: `
  <h4>Slide 1</h4>
  <p>Cenário real ou dúvida comum</p>
  <h4>Slide 2–5</h4>
  <p>O que fazer, como agir, pontos de atenção</p>
  <h4>Slide Final</h4>
  <p>Resumo e orientação final + CTA</p>
      `.trim(),
      effect: "Ajuda prática em contexto real, preparação",
    },
  } as const,
  reel: {
    storytelling: {
      title: "Storytelling Emocional",
      structure: `
  <h4>Gancho (0–3s)</h4>
  <p>Imagem ou fala que chama atenção. Pode ser um momento real ou uma pergunta provocativa.</p>
  <h4>Contexto (4–10s)</h4>
  <p>Apresentação rápida da situação ou personagem.</p>
  <h4>Conflito / Virada (10–20s)</h4>
  <p>Algo inesperado, preocupante ou revelador.</p>
  <h4>Transformação / Solução (20–35s)</h4>
  <p>O que mudou após a ação ou descoberta.</p>
  <h4>Encerramento + CTA (35–60s)</h4>
  <p>Reflexão final ou chamada direta: "Agende", "Compartilhe", "Comente".</p>
      `.trim(),
      effect: "Conexão profunda, emoção, identificação",
    },
    educacional: {
      title: "Reels Educacional",
      structure: `
  <h4>Gancho (0–3s)</h4>
  <p>Pergunta comum, erro frequente ou estatística chocante.</p>
  <h4>Explicação (4–15s)</h4>
  <p>Entregue o valor com clareza. Pode usar tópicos curtos.</p>
  <h4>Exemplificação (15–30s)</h4>
  <p>Mostre uma aplicação, um caso ou um visual que facilite o entendimento.</p>
  <h4>Resumo + CTA (30–60s)</h4>
  <p>“Se isso faz sentido pra você… salva esse vídeo e compartilha.”</p>
      `.trim(),
      effect: "Credibilidade, autoridade, valor prático",
    },
    provocativo: {
      title: "Reels Provocativo",
      structure: `
  <h4>Frase de impacto (0–3s)</h4>
  <p>Algo que quebre expectativa, gere discordância ou dúvida.</p>
  <h4>Justificativa (4–15s)</h4>
  <p>Mostre por que você acredita naquilo. Exponha o erro comum.</p>
  <h4>Reenquadramento (15–30s)</h4>
  <p>Apresente uma nova forma de pensar sobre o assunto.</p>
  <h4>Fechamento + Convite à discussão (30–60s)</h4>
  <p>“Concorda ou discorda? Me diz nos comentários.”</p>
      `.trim(),
      effect: "Engajamento polêmico, quebra de crenças, reação emocional",
    },
    checklist: {
      title: "Checklist em Reels",
      structure: `
  <h4>Introdução (0–3s)</h4>
  <p>“5 sinais de que seu filho precisa de avaliação oftalmológica”</p>
  <h4>Lista sequencial (4–25s)</h4>
  <p>Apresente os itens um por um, com texto e/ou voz. Use cortes rápidos.</p>
  <h4>Conclusão prática (25–45s)</h4>
  <p>“Se você marcou 2 ou mais… atenção!”</p>
  <h4>Chamada direta (45–60s)</h4>
  <p>“Salva esse vídeo e marque a consulta agora mesmo.”</p>
      `.trim(),
      effect: "Clareza, ação rápida, utilidade prática",
    },
    bastidor: {
      title: "Reels de Bastidor",
      structure: `
  <h4>Abertura natural (0–3s)</h4>
  <p>Imagem real, não roteirizada. Algo cotidiano.</p>
  <h4>Contexto leve (4–15s)</h4>
  <p>O que tá acontecendo? Por que você tá mostrando isso?</p>
  <h4>Momento-chave (15–30s)</h4>
  <p>Decisão, fala sincera ou reação espontânea que marca o vídeo.</p>
  <h4>Reflexão (30–45s)</h4>
  <p>“Nem todo mundo mostra isso. Mas é aqui que tudo acontece.”</p>
  <h4>Encerramento (45–60s)</h4>
  <p>“Se você gostou de ver esse lado, comenta aqui.”</p>
      `.trim(),
      effect: "Humanização, verdade, aproximação real com o público",
    },
    mitos: {
      title: "Reels Mitos vs Verdades",
      structure: `
  <h4>Introdução provocativa (0–3s)</h4>
  <p>“Você acha que coçar o olho é normal? MITO.”</p>
  <h4>Mito 1 + Verdade (4–15s)</h4>
  <p>Explica rapidamente e com clareza.</p>
  <h4>Mito 2 + Verdade (15–30s)</h4>
  <p>Continua mostrando contradições comuns.</p>
  <h4>Resumo e CTA (30–60s)</h4>
  <p>“Agora você já sabe. Compartilhe com quem ainda acha que isso é bobagem.”</p>
      `.trim(),
      effect: "Choque informativo, reposicionamento mental",
    },
    textOnly: {
      title: "Reels de Texto Sequencial",
      structure: `
  <h4>Slide 1 (0–3s)</h4>
  <p>Frase de impacto ou provocação inicial. Ex: “Você não percebe, mas tá perdendo a visão dele.”</p>
  <h4>Slide 2 (4–8s)</h4>
  <p>Frase 2: Tensão crescente. Ex: “Coçar o olho TODO DIA não é normal.”</p>
  <h4>Slide 3 (8–13s)</h4>
  <p>Frase 3: Início de solução. Ex: “Pode ser alergia ocular. Pode ser ceratocone.”</p>
  <h4>Slide 4 (13–18s)</h4>
  <p>Frase 4: Consequência real. Ex: “Ignorar agora pode custar caro depois.”</p>
  <h4>Slide 5 (18–25s)</h4>
  <p>Frase final + CTA. Ex: “Leve pro especialista. Marque a consulta. Não espera piorar.”</p>
      `.trim(),
      effect:
        "Impacto emocional rápido, fácil consumo, altamente compartilhável",
    },
  } as const,

  titulos: {
    question: {
      title: "Pergunta Provocativa",
      structure:
        "Use uma pergunta que provoque reflexão ou insegurança no leitor.",
      examples: [
        "Seu filho coça os olhos... ou você que não quer ver o problema?",
        "Você esperaria seu filho reclamar de dor pra marcar uma consulta?",
        "Por que ninguém te contou isso sobre alergia ocular infantil?",
      ],
    },
    statement: {
      title: "Declaração Impactante",
      structure: "Faça uma afirmação curta e direta que choque ou intrigue.",
      examples: [
        "Coçar o olho TODO DIA não é normal.",
        "Ignorar hoje pode custar a visão amanhã.",
        "A visão do seu filho tá pedindo socorro. E você não percebeu.",
      ],
    },
    promise: {
      title: "Promessa Direta",
      structure: "Mostre o benefício claro que o conteúdo vai entregar.",
      examples: [
        "3 formas simples de evitar problemas visuais em crianças",
        "Como proteger a visão do seu filho com uma ação por mês",
        "O passo a passo para evitar danos causados por alergia ocular",
      ],
    },
    error: {
      title: "Erro Comum",
      structure: "Apresente um erro que o público comete e não percebe.",
      examples: [
        "O erro silencioso que muitos pais cometem na introdução alimentar",
        "A coceira que parece inofensiva... mas não é",
        "Por que tratar em casa pode ser um problema sério",
      ],
    },
    checklist: {
      title: "Checklist camuflado",
      structure:
        "Antecipe que o conteúdo será uma lista sem entregar tudo no título.",
      examples: [
        "Se seu filho faz isso, você precisa ler esse post",
        "5 sinais de que algo está errado com a visão do seu filho",
        "Como saber se essa coceira é realmente só uma alergia",
      ],
    },
    story: {
      title: "Story Hook",
      structure:
        "Comece com uma frase de história real ou fictícia, gerando tensão.",
      examples: [
        "Achei que era só uma alergia. Hoje ele usa lente rígida.",
        "Ela só coçava o olho. Agora não consegue mais enxergar sem ajuda.",
        "Tudo começou com um colírio. E terminou numa cirurgia.",
      ],
    },
    contrast: {
      title: "Choque de Realidade",
      formula: "Crie contraste entre o que as pessoas pensam e a realidade.",
      examples: [
        "Você acha que coçar o olho é normal? A ciência diz outra coisa.",
        "A maioria só age quando é tarde demais.",
        "Não é frescura. É ceratocone em estágio inicial.",
      ],
    },
  } as const,
  legenda: {
    complementary: {
      title: "Complementar",
      description:
        "Expande o conteúdo do carrossel ou Reels com explicações adicionais.",
      effect:
        "Aprofunda a mensagem e gera autoridade através de clareza e contexto.",
      useWhen:
        "Quando o post é mais visual ou resumido e precisa de um complemento explicativo.",
    },
    confessional: {
      title: "Confessional",
      description:
        "Traz vulnerabilidade, bastidores e humanidade. Fala de forma pessoal.",
      effect: "Gera empatia e conexão emocional com o público.",
      useWhen: "Quando você quer humanizar a marca ou reforçar autenticidade.",
    },
    educational: {
      title: "Educativa",
      description:
        "Funciona como um mini-post técnico ou informativo na legenda.",
      effect: "Constrói autoridade, educa e gera salvamentos.",
      useWhen:
        "Quando o conteúdo tem potencial técnico e valor didático por si só.",
    },
    provocative: {
      title: "Provocativa",
      description:
        "Continua o tom de tensão ou desconstrução do conteúdo principal.",
      effect: "Choca, provoca reflexão ou engajamento emocional forte.",
      useWhen:
        "Quando você quer manter o impacto do post e incentivar reação ou debate.",
    },
    conversational: {
      title: "Conversacional",
      description: "Texto leve e direto, como um papo informal com o seguidor.",
      effect: "Gera proximidade, facilita comentários e compartilhamento.",
      useWhen:
        "Quando quer soar mais humano, gerar conversa e descomplicar o tom.",
    },
    emotionalPitch: {
      title: "Vendedora com Contexto Emocional",
      description:
        "Chama para ação de forma suave, com base em uma emoção real.",
      effect: "Gera conversão com empatia, sem parecer agressivo.",
      useWhen:
        "Quando você precisa vender consulta, produto ou serviço, mas com contexto sensível.",
    },

    checklistExplained: {
      title: "Checklist Prático com Explicação",
      description:
        "Lista enumerada com dicas e explicações diretas para o seguidor aplicar no dia a dia.",
      effect: "Organiza informações de forma clara, útil e com valor imediato.",
      useWhen:
        "Quando você quer entregar conteúdo prático que resolve dores ou dúvidas comuns.",
    },
    diagnosticList: {
      title: "Lista Diagnóstica",
      description:
        "Lista de comportamentos ou sinais que levam o seguidor a perceber um problema ou necessidade de ajuda.",
      effect: "Gera autoavaliação, senso de urgência e ação.",
      useWhen:
        "Quando você quer provocar o público e levá-lo à reflexão ou busca por atendimento.",
    },
    quickChecklist: {
      title: "Checklist Rápido",
      description:
        "Lista direta de itens para fazer ou evitar, sem explicações detalhadas.",
      effect: "Rapidez, clareza e consumo instantâneo.",
      useWhen:
        "Quando você quer entregar valor rápido ou reforçar visualmente uma ideia sem aprofundamento.",
    },

    descriptiveDesire: {
      title: "Desejo & Sensação (Gastronômico)",
      description:
        "Ativa o apetite e a curiosidade sensorial com frases que provocam a imaginação do sabor, textura e cheiro.",
      effect: "Gera desejo visceral e vontade imediata de provar.",
      useWhen:
        "Quando você quer apresentar um prato ou bebida e fazer o público salivar.",
    },
    processBackstage: {
      title: "Bastidor Real (Processo e Cuidado)",
      description:
        "Mostra os bastidores do preparo, segredos da cozinha ou diferenciais do produto.",
      effect: "Valorização do trabalho artesanal e percepção de qualidade.",
      useWhen:
        "Quando você quer mostrar que o produto é feito com atenção e não é mais do mesmo.",
    },
    eitherOr: {
      title: "Escolha do Dia (Interativo)",
      description:
        "Compara duas opções e estimula a participação do seguidor com perguntas simples.",
      effect: "Engajamento leve e interação nos comentários.",
      useWhen:
        "Quando você quer movimentar o perfil sem necessariamente fazer uma oferta.",
    },
    provocativeTaste: {
      title: "Provocação Gastronômica",
      description:
        "Posiciona o produto contra opções de baixa qualidade, ativando o senso de merecimento do público.",
      effect: "Reposicionamento com personalidade, reforça diferenciação.",
      useWhen:
        "Quando você quer mostrar que seu produto vale mais que o concorrente genérico.",
    },
    memoryHook: {
      title: "História & Emoção (Memória Afetiva)",
      description:
        "Usa storytelling afetivo para conectar o prato a lembranças, família ou tradições.",
      effect: "Conexão emocional e valorização simbólica do produto.",
      useWhen: "Quando você quer humanizar a marca e criar vínculo afetivo.",
    },
    tastyGuide: {
      title: "Guia de Combinações (Mini Educativo)",
      description:
        "Sugere combinações de sabores, harmonizações ou dicas gastronômicas práticas.",
      effect: "Autoridade leve + inspiração imediata.",
      useWhen: "Quando você quer ensinar e entreter ao mesmo tempo.",
    },
  },

  stories: {
    miniStory: {
      title: "Mini Story (Jornada Pessoal ou de um Paciente)",
      structure: `
    <h4>Story 1</h4>
    <p>“Deixa eu te contar uma coisa que aconteceu…”</p>
    <h4>Story 2</h4>
    <p>Situação incômoda ou início do problema</p>
    <h4>Story 3</h4>
    <p>Virada ou descoberta</p>
    <h4>Story 4</h4>
    <p>Solução aplicada ou conselho</p>
    <h4>Story 5</h4>
    <p>CTA leve: “Responde aqui”, “Me chama”, “Desliza pro lado”</p>
        `.trim(),
      effect: "Conexão e identificação com a audiência",
      useWhen: "Quando quiser gerar empatia e contexto antes de converter",
    },
    triviaStory: {
      title: "Você Sabia? (Storytelling Educacional + Curiosidade)",
      structure: `
    <h4>Story 1</h4>
    <p>Pergunta intrigante ou dado curioso</p>
    <h4>Story 2</h4>
    <p>Explicação simplificada com contexto</p>
    <h4>Story 3</h4>
    <p>“Isso acontece porque…”</p>
    <h4>Story 4</h4>
    <p>Dica ou orientação prática</p>
    <h4>Story 5</h4>
    <p>CTA: “Quer saber mais? Me chama ou clica no link”</p>
        `.trim(),
      effect: "Educação com valor prático",
      useWhen: "Quando quiser ensinar sem parecer palestra",
    },
    errorChallenge: {
      title: "Desafio ou Erro Comum",
      structure: `
    <h4>Story 1</h4>
    <p>“Se você faz isso com seu filho…”</p>
    <h4>Story 2</h4>
    <p>Expõe o erro ou crença comum</p>
    <h4>Story 3</h4>
    <p>Mostra o risco/consequência</p>
    <h4>Story 4</h4>
    <p>“Aqui tá o que eu recomendo”</p>
    <h4>Story 5</h4>
    <p>CTA com caixa de pergunta, DM ou link</p>
        `.trim(),
      effect: "Tensão e correção de rota",
      useWhen: "Quando quiser desafiar, reposicionar ou vender",
    },
    timeline: {
      title: "Linha do Tempo",
      structure: `
    <h4>Story 1</h4>
    <p>“Antes…” (como era a situação)</p>
    <h4>Story 2</h4>
    <p>“O que estava dando errado”</p>
    <h4>Story 3</h4>
    <p>“O que mudou”</p>
    <h4>Story 4</h4>
    <p>“Como está hoje”</p>
    <h4>Story 5</h4>
    <p>CTA com print, depoimento ou agendamento</p>
        `.trim(),
      effect: "Prova social e construção de autoridade",
      useWhen: "Quando quiser mostrar transformação real",
    },
    interactiveDecision: {
      title: "Você Faria Isso? (Decisão Interativa)",
      structure: `
    <h4>Story 1</h4>
    <p>Situação real: “A criança coça o olho todo dia…”</p>
    <h4>Story 2</h4>
    <p>Enquete com decisão (ex: Levar no médico / Esperar?)</p>
    <h4>Story 3</h4>
    <p>Revelação do certo com justificativa</p>
    <h4>Story 4</h4>
    <p>Explicação educativa breve</p>
    <h4>Story 5</h4>
    <p>CTA: “Quer mais? Responde aqui”</p>
        `.trim(),
      effect: "Engajamento + educação + leads quentes",
      useWhen: "Quando quiser puxar interação e começar diálogo",
    },
    empathyPulse: {
      title: "Você Se Identifica? (Reflexão com Dor e Consolo)",
      structure: `
    <h4>Story 1</h4>
    <p>“Você sente isso também?”</p>
    <h4>Story 2</h4>
    <p>Descreve um problema emocional ou comum</p>
    <h4>Story 3</h4>
    <p>Mostra que outras pessoas passam por isso</p>
    <h4>Story 4</h4>
    <p>Apresenta solução ou direção</p>
    <h4>Story 5</h4>
    <p>CTA com caixinha ou convite pra conversar</p>
        `.trim(),
      effect: "Acolhimento e conversão suave",
      useWhen: "Quando o público tá na dor, mas ainda resiste à venda",
    },
  } as const,
};
