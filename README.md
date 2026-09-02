# 🌍 WorldDex: Onde Nascerias?

> **"Desbloqueia o mundo, um nascimento de cada vez."**

O **WorldDex** é um jogo interativo estilo *gacha/roleta* que responde a uma pergunta fascinante: *"Se nascesses agora mesmo, em que parte do mundo calharias?"*

Baseado em dados demográficos reais e estimativas de taxas de natalidade globais, o jogo simula a probabilidade exata de nasceres em cada país. Países como a Índia ou Nigéria saem muito frequentemente (raridade **Comum**), enquanto que o Vaticano, Islândia ou Cabo Verde são incrivelmente raros (**Lendário**).

---

## ✨ Funcionalidades Principais (Como Funciona)

- 🎲 **Roleta Demográfica**: Ao clicares em "Rolar", a probabilidade de um país calhar é exatamente igual à probabilidade real de nascer lá no mundo real.
- 🗺️ **Mapa Interativo**: Todos os países que desbloqueias pintam-se no teu passaporte mundial interativo em 3D/2D.
- 🏆 **Conquistas Globais**: Completa blocos continentais, organizações (PALOP, UE, NATO, BRICS) e ganha títulos de explorador.
- 🛒 **Loja e Upgrades**: Os países repetidos dão-te "Moedas de Duplicado". Usa-as para comprar upgrades de sorte (*Luck*), o cobiçado *Autoclicker*, e multiplicadores.
- 🌍 **Multilíngue**: Suporte brutal para **+50 idiomas**, incluindo traduções manuais detalhadas para **Crioulo de Cabo Verde**, **Kimbundu**, **Umbundu** e **Kikongo**.
- 🛡️ **Pity System**: Não tens sorte nenhuma? O jogo tem um sistema de misericórdia que te garante um país novo após `X` tentativas frustradas consecutivas!

---

## 🚀 Como Abrir e Executar Localmente

Queres testar ou modificar o jogo no teu computador? É super simples!

### Pré-requisitos
Vais precisar de ter o **[Node.js](https://nodejs.org/)** instalado no teu computador (a versão recomendada LTS).

### Passos:
1. **Abre o Terminal** na pasta do projeto.
2. **Instala as dependências** correndo o seguinte comando:
   ```bash
   npm install
   ```
3. **Inicia o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
4. 🎉 **Feito!** O terminal vai mostrar-te um link (geralmente `http://localhost:5173`). Clica nele ou copia para o teu browser (Chrome, Edge, Firefox) para começares a jogar!

---

## 🌐 Como Fazer o Deploy (Colocar Online)

O projeto está otimizado para plataformas de alojamento modernas como o **Netlify** ou **Vercel**.

**Método rápido (Netlify Drop):**
1. Na pasta do projeto, corre `npm run build`.
2. Isto vai criar uma pasta chamada `dist`.
3. Pega nessa pasta `dist` e arrasta-a diretamente para o [Netlify Drop](https://app.netlify.com/drop). O teu site fica online em 5 segundos!

*(O projeto já inclui um ficheiro `netlify.toml` que resolve automaticamente os problemas de links e navegação).*

---

## ⚖️ Avisos Legais e Privacidade (Legal Info)

O WorldDex foi desenhado com o respeito pelo utilizador no centro da sua arquitetura:

- 🔒 **Privacidade Total (Offline-First)**: O jogo **não possui bases de dados externas**, não usa cookies de rastreamento de marketing nem envia qualquer informação tua para a nuvem. Todo o teu progresso, moedas e configurações são guardados **exclusivamente de forma local** no teu dispositivo (no `localStorage` do browser).
- 💾 **Exportar/Importar**: Como não há contas na nuvem, és tu que controlas os teus dados. Podes descarregar o teu save num ficheiro no menu de definições, e carregá-lo noutro telemóvel/PC.
- 📊 **Dados Demográficos**: As probabilidades de nascimento e raridades foram calculadas com base em relatórios anuais globais da ONU e bancos de dados demográficos mundiais (referentes aos últimos anos). Estes valores são estimativas aproximadas para fins **lúdicos, estatísticos e educativos**, podendo não refletir flutuações demográficas diárias exatas.
- 🎨 **Ativos (Assets)**: Ícones e vetores topográficos (*TopoJSON*) são derivados de recursos open-source de domínio público ou licenças MIT.

---
*Criado com ❤️ usando React, TypeScript, TailwindCSS e Vite.*

