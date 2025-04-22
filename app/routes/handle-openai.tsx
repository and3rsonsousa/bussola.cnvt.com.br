import { OpenAI } from "openai";
import type { ActionFunctionArgs } from "react-router";
import { FRAMEWORKS, SOULS } from "~/lib/constants";

export const config = { runtime: "edge" };

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  let {
    title,
    description,
    prompt,
    intent,
    model,
    context,
    trigger,
    framework,
    voice,
    soul,
  } = Object.fromEntries(formData.entries());

  if (!intent) {
    return { message: "Defina a sua intenção nesse comando." };
  }

  let vx = String(voice).split(",");

  let tone = `Use o tom de voz de acordo com os seguintes atributos e suas notas. A escala vai de 0 a 5, onde 5 é o valor máximo e 0 é o extremo oposto desse atributo. Não existe neutralidade. Formalidade: ${vx[0]} - Emocionalidade: ${vx[1]} - Humor: ${vx[2]} - Tecnicidade: ${vx[3]} - Autoridade: ${vx[4]} - Proximidade: ${vx[5]} - Entusiasmo: ${vx[6]} - Complexidade: ${vx[7]} - Inovação Linguística: ${vx[8]} - Persuasão: ${vx[9]} - Urgência: ${vx[10]} - Inclusividade: ${vx[11]} - Tradicionalismo: ${vx[12]} - Assertividade: ${vx[13]} - Empatia: ${vx[14]}`;

  const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });

  let template = "";
  let content = "";
  trigger = trigger || "Autoridade";

  // Se for legenda
  if (intent === "ideas") {
    template = `Você é Jéssica, uma Social Media Storyteller, especialista em transformar uma única ideia em vários conteúdos envolventes para o Instagram, seguindo a metodologia do ebook "1 ideia em 10 conteúdos". Sua tarefa é pegar um tópico central fornecido pelo usuário e gerar 10 conteúdos únicos em português, adaptados ao nicho e público-alvo especificados, se fornecidos. Se não houver nicho ou público definido, assuma um público geral e crie conteúdos amplamente atraentes.`;

    content = `Requisitos de Entrada:
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
    template = "você é um copywritter experiente.";
    content = `Reduza o TEXTO em 25% sem alterar o sentido ou mudar o tom de voz, mas pode reescrever e mudar o número de parágrafos. TEXTO: ${description}.`;
  } else if (intent === "expand") {
    template = "você é um copywritter experiente.";
    content = `Aumente o TEXTO em 25% sem alterar o sentido ou mudar o tom de voz. TEXTO: ${description}.`;
  } else if (intent === "prompt") {
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
  } else if (intent === "hook") {
    template =
      "Lista com 5 Ganchos Virais para iniciar vídeos no Instagram/TikTok. Cada frase deve ter no máximo 2 segundos.";
    content = `Pegue o CONTEXTO e crie 5 opções de ganchos virais impossíveis de serem ignorados e retorne uma lista. Use o gatilho da ${trigger}
    EMPRESA: ${context}.
    REGRAS: Retorne apenas o texto sem nenhuma observação. Texto com parágrafos e tags html. Retorne apenas uma frase sem aspas.
    CONTEXTO: Título da ação: '${title}, descrição: ${description}'
    TOM DE VOZ: ${tone}`;
  } else if (intent === "reels") {
    template = "Roteiro de vídeo viral.";

    if (model === "viral") {
      content = `Crie um roteiro de vídeo viral seguindo essa lógica e identificando cada uma das partes (GANCHO, DESENVOLVIMENTO, CTA INICIAL, DESENVOLVIMENTO, CTA FINAL) Após cada um desse subtítulo, insira um parágrafo. 
    GANCHO: 
    (Frase chamativa baseada no CONTEXTO impossível de ser ignorada com 2 segundos)
    DESENVOLVIMENTO 1: 
    (Problematize o contexto, apresentando por um lado onde o expectador conhece essa situação. De 5 a 10 segundos.)
    CTA INICIAL: 
    (Insira aqui um gancho criativo pedindo para a pessoa curtir o vídeo e seguir o perfil em até 3 segundos).
    DESENVOLVIMENTO 2: 
    (Apresente uma solução ou desfecho para a problematização de acordo com o CONTEXTO em no máximo 10 segundos)
    CTA FINAL: 
    (Incentive o expectador a interagir, comentando ou compartilhando o vídeo em 5 segundos)
    REGRAS: Retorne apenas o texto sem nenhuma observação. Texto com parágrafos e tags html. Retorne apenas uma frase sem aspas. Traga o texto com no máximo 300 palavras. 
    EMPRESA: ${context}.
    CONTEXTO: Título da ação: '${title}, descrição: ${description}'
    TOM DE VOZ: ${tone}`;
    } else {
      content = `Crie um roteiro de vídeo viral em formato de lista seguindo essa lógica e identificando cada uma das partes (GANCHO, DESENVOLVIMENTO, DICA N, CTA INICIAL, DESENVOLVIMENTO, CTA FINAL) Após cada um desse subtítulo, insira um parágrafo. 
    GANCHO - Frase chamativa baseada no CONTEXTO impossível de ser ignorada indicando quantas dicas teremos no vídeo. (2 segundos)
    DESENVOLVIMENTO 1 - Apresente metade das dicas. (10 a 20 segundos)
    CTA INICIAL - Insira aqui um gancho criativo pedindo para a pessoa curtir o vídeo e seguir o perfil. (3 segundos)
    DESENVOLVIMENTO 2 - Apresente as outras dicas. (10 segundos)
    CTA FINAL - Incentive o expectador a interagir, comentando ou compartilhando o vídeo. (5 segundos)
    REGRAS: Retorne apenas o texto sem nenhuma observação. Texto com parágrafos e tags html. Retorne apenas uma frase sem aspas. Traga o texto com no máximo 300 palavras. 
    EMPRESA: ${context}.
    CONTEXTO: Título da ação: '${title}, descrição: ${description}'
    TOM DE VOZ: ${tone}`;
    }
  } else if (intent === "caption") {
    template = getModel(model.toString(), intent);

    content = `Texto da legenda e hashtags usando técnicas de Storytelling e reforçando o CONTEXTO. Use emojis em cada parágrafo. Use o gatilho mental da: ${trigger}. Use esse formato: 
    TEXTO DA LEGENDA 

    HASHTAGS
    
  REGRAS: Retorne apenas o texto sem nenhuma observação. Texto somente com parágrafos e sem tags html e sem markdown. 
  TEMPLATE: ${template}.
  EMPRESA: ${context}.
  CONTEXTO: Título do post: '${title}, descrição: ${description}'
  TOM DE VOZ: ${tone}`;
  }
  // Se for Stories
  else if (intent === "stories") {
    template = getModel(model.toString(), intent);
    content = `Você é um estrategista de conteúdo experiente. 
    TAREFA: você vai criar uma sequência de stories usando técnicas de storytelling e finalizando sempre com um Stories com um CTA forte levando em conta o CONTEXTO e a descrição da EMPRESA. Use o FRAMEWORK DE COPY ${copyFrameworks(framework as string)?.prompt} com o gatilho metal da: ${trigger}.
    REGRA: Retorne apenas o texto sem nenhuma observação. Texto somente com parágrafos e sem tags html.
    TEMPLATE: ${template}
    CONTEXTO: ${title} - ${description}
    TOM DE VOZ: ${tone}`;
  }
  // Se for carrossel
  else if (intent === "carousel") {
    //base

    let rules = "";

    template = `<h3>SLIDE 1</h3> (use um Gancho forte para chamar a atenção do usuário)
    <h4>Frase do título aqui.</h4> (Frase principal do Carrossel. Deve ser chamativa e apelar para o gatilho mental: ${trigger})
    
    
    <h3>SLIDE 2</h3> (desenvolva o problema e retenha o usuário)
      <h4>Conteúdo do título aqui</h4> (Frase principal do slide com até 15 palavras)
      <p>Conteúdo do Texto aqui</p> (Texto de apoio com até 60 palavras)
      <strong>Observação:</strong> (opcional - Insira algum texto com até 15 palavras apenas quando for necessário reforçar algo.)
      Conteúdo da observação aqui
    

    SLIDE X (de 3 a 8 - desenvolva a proposta única para esse tema.)
    Título (Frase principal do slide com até 15 palavras)
    Texto (Texto de apoio com até 60 palavras)
    Observação (opcional - Insira algum texto com até 15 palavras apenas quando for necessário reforçar algo.)

    SLIDE X (penúltimo) ( Após apresentar a proposta única, crie desejo no usuário.)
    Título (Frase principal do slide com até 15 palavras)
    Texto (Texto de apoio com até 60 palavras)
    Observação (opcional - Insira algum texto com até 15 palavras apenas quando for necessário reforçar algo.)

    SLIDE X (último) ( Finalize com uma chamada para a ação.)
    Título (Frase principal do slide com até 15 palavras)
    Texto (Texto de apoio com até 60 palavras)
    Ação (Insira uma chamada de ação)
    `;
    if (model === "twitter") {
      rules =
        "Insira sempre um emoji de acordo com a frase no final de cada frase. O texto deve ter no máximo 280 caracteres.";
      template = `<h3>SLIDE 1</h3> 
    <p>Frase do título aqui.</p> (Frase principal do Carrossel. Use um Gancho forte para chamar a atenção do usuário. Deve ser chamativo e apelar para o gatilho mental: ${trigger})
    <p>Sugestão de imagem</p>
    <h3>SLIDE 2</h3> (desenvolva o problema e retenha o usuário)
    <p>Sugestão de imagem</p>
    <p>Conteúdo do Texto aqui</p>
    SLIDE X (de 3 a 8 - desenvolva a proposta única para esse tema.)
    <p>Conteúdo do Texto aqui</p>
    <p>Sugestão de imagem</p>
    SLIDE X (penúltimo) ( Após apresentar a proposta única, crie desejo no usuário.)
    <p>Sugestão de imagem</p>
    <p>Conteúdo do Texto aqui</p>
    SLIDE X (último) ( Finalize com uma chamada para a ação.)
    <p>Conteúdo do Texto aqui</p>
    `;
    }

    content = `Você é um estrategista de conteúdo experiente e trabalha principalmente com técnicas de storytelling para envolver o usuário levando em conta o CONTENT e a descrição da EMPRESA. 
TAREFA: Criar um post em formato carrossel envolvente e que prendam o usuário usando o gatilho mental: ${trigger}.
REGRAS: Retorne apenas o texto sem nenhuma informação sua e formatado com tags HTML. ${rules} 
MODELO: ${template}
 EMPRESA: ${context}
CONTENT: ${title} - ${description}
TOM DE VOZ: ${tone}`;
  } else if (intent === "title") {
    if (soul) {
      const _soul = new Map(Object.entries(SOULS)).get(soul.toString())!;
      template = _soul.prompt;
    } else if (model === "viral") {
      template = `Use esses Ganchos como modelo e se inspire para criar um título de acordo com o CONTEXTO, mas que sejam diferentes desses. Ganchos (${hooks.join(
        " - ",
      )})`;
    } else {
      template = `Use esses 3 princípios: Princípio da especificidade, Princípio da curiosidade e Princípio do “sequestro da atenção”. Evite palavras genéricas como: Descubra, Aprenda, método, segredo, dica.
      `;
    }

    content = `Você é um copywriter jovem e astuto. Sua missão é criar títulos antiflop para postagens no Instagram.
    
  REGRAS: Retorne apenas o texto sem nenhuma observação. Texto somente com parágrafos e sem tags html. Retorne apenas uma frase sem aspas. O título deve ter no máximo 12 palavras. 
  TEMPLATE: ${template}.
  EMPRESA: ${context}.
  CONTEXTO: Título do post: '${title}, descrição: ${description}'
  TOM DE VOZ: ${tone}`;
  }

  if (template === "") {
    throw new Error(
      `Solicitação imcompleta. Confira os dados enviados:${JSON.stringify(
        { title, description, intent, model, context, trigger },
        undefined,
        2,
      )}`,
    );
  }

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content,
      },
    ],
    model: "gpt-4o-mini",
  });

  return { message: chatCompletion.choices[0].message.content };
};

const hooks = [
  "E se eu te disser que (incluir tema) não é verdade?",
  "Minha arma secreta para...",
  "Você também fica irritado quando vê (incluir tema)?",
  "Vou te ensinar a história por trás de (incluir tema) em 60 segundos.",
  "Alguém mais está exausto de (incluir tema)?", //5

  "Cuidado, isso pode acontecer com você!",
  "Assista isso antes de...",
  "Eu só percebi isso depois de anos cometendo o mesmo erro.",
  "Por que ninguém faz (incluir tema) direito?",
  "Essa é a maior mentira que te contaram até hoje.", // 10

  "Eu não acredito que as pessoas ainda fazem isso!",
  "Está na hora de alguém te falar a verdade.",
  "Isso vai deixar você com raiva e por um bom motivo.",
  "Por que a maioria das pessoas está errada sobre (incluir tema)?",
  "Algo muito estranho aconteceu hoje…", //15

  "Você já percebeu que...",
  "Você nunca deve fazer isso!",
  "O que você faria se (incluir tema)?",
  "Se você tivesse que escolher entre...",
  "Essa é a decisão mais difícil que já tomei.", // 20

  "Isso vai mudar a maneira como você vê (incluir tema).",
  "Perdi muito tempo com (incluir tema), então mudei e...",
  "Eu sempre odiei (incluir tema) então decidi...",
  "3 segredos sobre (incluir tema) que não te contam.",
  "Não acredito que não tentei isso antes.", //25

  "Sua vida não será a mesma depois...",
  "Alguém mais se sente (incluir emoção e tema) ou sou só eu?",
  "5 erros que eu cometi quando (incluir tema).",
  "A razão pela qual você se sente como (incluir emoção) é porque (incluir tema)",
  "Sinto muito por te dar de más notícias, mas...", // 30

  "Você viu as notícias sobre (incluir tema)? Se não...",
  "Vou mudar sua opinião sobre (incluir tema) em 30 segundos.",
  "Eu sou o único que está esperando desesperadamente por...",
  "Como alguém que é (incluir tema) posso certamente te dizer que...",
  "Curiosidade sobre mim: Eu tinha (incluir idade) anos quando...", //35

  "Você não vai acreditar no que eu encontrei/vi ontem...",
  "(incluir tema) nunca foi tão importante quanto é agora.",
  "Se você ignorar isso, vai se arrepender depois.",
  "Por que ninguém fala disso quando é tão óbvio?",
  "Eu não sei como você ainda não percebeu isso.", // 40

  "Isso vai mudar o jogo.",
  "Alguém precisava falar sobre (incluir tema).",
  "Quantas vezes você já ignorou isso?",
  "Você acha que teria coragem de fazer isso?",
  "Se você pudesse voltar no tempo, mudaria isso?", //45

  "Isso não faz sentido pra mim até agora.",
  "Você também sente que...",
  "Quem nunca passou por isso, não sabe o que é sofrer.",
  "Isso acontece com todo mundo, mas ninguém fala.",
  "Eu aposto que você já se sentiu assim.", // 50

  "Todo mundo faz isso, mas poucos admitem.",
  "Eu sei que você já (fez algo relacionado ao tema e quer resolver)",
  "Por que ninguém está falando disso (assunto principal)?",
  "É isso que acontece quando você (comportamento ou crença comum sobre o assunto principal)",
  "90% das pessoas esquecem que (solução do assunto principal)", //55

  "O que mudou depois que eu comecei a (nova prática sobre o assunto pincipal)",
];
/**
 * Descrição da função
 * @param {string} framework - Modelo do Framework
 * @returns {string} O texto explicativo para a IA usar
 * */
const copyFrameworks = (framework: string) => {
  framework = framework || "aida";

  return new Map(Object.entries(FRAMEWORKS)).get(framework);
};

function getModel(model: string, intent: string) {
  model = model.toLowerCase();
  let result =
    intent === "stories"
      ? `TÍTULO DA SEQUÊNCIA DE STORIES
  -Indique qual o formato escolhido
  -qual o framework de copy
  -qual o gatilho mental

  `
      : ``;

  switch (model) {
    case "short-caption":
      return "Texto da legenda com até 200 caracteres bem criativo e reforçando o CONTEXTO e com um CTA no final. Caso não haja nenhuma especificação no CONTEXTO, indique a pessoa a ir ao link da bio de modo que concorde com o CONTEXTO.";
    case "medium-caption":
      return "Texto da legenda com até 400 caracteres usando o CONTEXTO como base, pode ter cunho explicativo ou de reforço. Use 3 parágrafos curtos. Use de 3 hashtags bem focadas no nicho da DESCRIÇÃO.";
    case "long-caption":
      return `Texto da legenda explicando o CONTEXTO com até 800 caracteres. Ainda que mais explicativa, o texto não pode ser cansativo e deve ser dinâmico. Cada parágrafo não deve ter mais de 30 palavras depois disso, crie novos parágrafos para manter o texto mais dinâmico. Importante separar bem a explicação Nesses parágrafos:
    1 - Reforce o problema apresentado do CONTEXTO em 120 caracteres.
    2 - Comece a problematizar o assunto ao jogar o contexto para o usuário gerando conexão em 120 caracteres.
    3 - Aqui você usar uma lista de itens com emojis para facilitar a leitura apresentando os problemas que o usuário enfrenta, reforçando o parágrafo 2.
    4 - Apresente a solução do problema de acordo com o CONTEXTO.
    5 - Conclua com um CTA do CONTEXTO, se não houver indicação, peça para o usuário ir ao link da bio de uma forma mais criativa do que "agende/peça pelo link da bio.
    6 - Finalize a legenda com 3 hashtags bem focadas no nicho da DESCRIÇÃO.`;
    case "long-tip-caption":
      return `Texto da legenda explicando o CONTEXTO com até 800 caracteres. Ainda que mais explicativa, o texto não pode ser cansativo e deve ser dinâmico. Cada parágrafo não deve ter mais de 30 palavras depois disso, crie novos parágrafos para manter o texto mais dinâmico. Importante separar bem a explicação Nesses parágrafos:
    1 - Comece a problematizar o assunto ao jogar o contexto para o usuário gerando conexão em 120 caracteres.
    2 - Comece a apresentar que tem uma solução e que no próximo parágrafo vai trazer as dicas.
    3 - Aqui você usar uma lista de itens com emojis para facilitar a leitura apresentando as soluções para os problemas que o usuário enfrenta, reforçando o parágrafo 2. Para cada item da lista, coloque uma breve explicação de até 20 palavras.
    4 - Reforce que as dicas acima são ideias para lidar com o problema e caso haja mais necessidade deve buscar a empresa; atente-se ao CONTEXTO para que você não fuja da necessidade.
    5 - Conclua com um CTA do CONTEXTO, se não houver indicação, peça para o usuário ir ao link da bio de uma forma mais criativa do que agende/peça pelo link da bio.
    6 - Finalize a legenda com 3 hashtags bem focadas no nicho da DESCRIÇÃO.
    `;
    case "video-stories":
      return (
        result +
        `Roteiro de fala para um vídeo de 20 segundos, indique reações que as pessoas devem ter em alguns momentos da fala entre parênteses para reforçar algum ponto. Siga esse modelo:
      STORY X
      
      Fala:
      [Inserir aqui a fala da pessoa para que seja lida com um tempo médio de 20 segundos e coloque (entre parênteses) alguma reação próximo de alguma fala.]
      `
      );
    case "short-stories":
      return (
        result +
        `Sequência curta de stories de no máximo 3 stories com textos de 15 palavras nesse modelo:
      STORY X
      
      Texto
  [Texto principal com no máximo 15 palavras]
      `
      );
    //Caso não venha nada ou seja "texto"
    case "text-stories":
    default:
      return (
        result +
        `Sequência de Stories em Texto nesse modelo:
      STORY X

      Texto:
      [Texto com no máximo 30 palavras]
      `
      );
  }
}
