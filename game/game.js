import * as Repo from './questions.js';

// --- CONFIGURAÇÃO VISUAL ---
const levelColors = [
  "#94a3b8", // Fase 1: HTML (Cinza/Estrutura - O início)
  "#60a5fa", // Fase 2: CSS (Azul claro - Estilização)
  "#facc15", // Fase 3: JS (Amarelo vibrante - Energia/Lógica)
  "#a855f7", // Fase 4: Bootstrap (Roxo - Componentes prontos)
  "#10b981", // Fase 5: CRUD (Verde Esmeralda - Dados vivos)
  "#38bdf8", // Fase 6: HTTP (Ciano Elétrico - Comunicação)
  "#f97316", // Fase 7: Banco (Laranja Fogo - Persistência)
  "#ef4444", // Fase 8: Git (Vermelho Alerta - Controle)
  "#881337", // Fase 9: GitFlow (Vinho Profundo - Complexidade)
  "#000000"  // Fase 10: Scrum (Preto Total/Vazio - O Boss Final)
];

const levels = [
  { name: "Fase 1: Estrutura (HTML)", questions: [...Repo.questionsHTML], target: 1 },
  { name: "Fase 2: Estilização (CSS)", questions: [...Repo.questionsCSS], target: 10 },
  { name: "Fase 3: Lógica (JavaScript)", questions: [...Repo.questionsJS], target: 10 },
  { name: "Fase 4: Frameworks (Bootstrap)", questions: [...Repo.questionsBootstrap], target: 10 },
  { name: "Fase 5: Persistência (CRUD)", questions: [...Repo.questionsCRUD], target: 10 },
  { name: "Fase 6: Protocolos (HTTP)", questions: [...Repo.questionsHTTP], target: 10 },
  { name: "Fase 7: Dados (Firebase/NoSQL)", questions: [...Repo.questionsBanco], target: 10 },
  { name: "Fase 8: Controle de Versão (Git)", questions: [...Repo.questionsGit], target: 10 },
  { name: "Fase 9: Fluxo de Trabalho (GitFlow)", questions: [...Repo.questionsGitFlow], target: 10 },
  { name: "Fase 10: Gestão (Scrum & Ágil)", questions: [...Repo.questionsAgile], target: 10 },
];

// --- ESTADO DO JOGO ---
let currentLevelIndex = 0;
let levelCorrectCount = 0;
let totalCorrectCount = 0;
let totalErrors = 0;
let activeQuestions = [];
let hp = 100;
let bossScale = 1;
let currentQ = null;

const viewport = document.getElementById('viewport');
const boss = document.getElementById('boss');
const quizPanel = document.getElementById('quiz-panel');

function startGame() {
  document.getElementById('overlay').style.display = 'none';
  hp = 100;
  totalCorrectCount = 0;
  totalErrors = 0;

  loadLevel(0);
  updateUI();
  nextChallenge();
}

function loadLevel(index) {
  currentLevelIndex = index;
  levelCorrectCount = 0;
  activeQuestions = [...levels[index].questions];
}

function showLevelWin() {
  quizPanel.style.display = 'none';
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'flex';

  const nextLevelIndex = currentLevelIndex + 1;

  if (nextLevelIndex < levels.length) {
    overlay.innerHTML = `
      <h1 style="color:#22c55e">NÍVEL CONCLUÍDO!</h1>
      <p style="color:#fff">Próximo desafio: ${levels[nextLevelIndex].name}</p>
      <div style="margin-top:20px; color:#facc15">Bugs resolvidos: ${totalCorrectCount}</div>
    `;

    setTimeout(() => {
      overlay.style.display = 'none';
      loadLevel(nextLevelIndex);
      nextChallenge();
    }, 2000);
  } else {
    win();
  }
}

function nextChallenge() {
  if (levelCorrectCount >= levels[currentLevelIndex].target) {
    return showLevelWin();
  }

  quizPanel.style.display = 'none';
  viewport.classList.add('running');

  // 1. O Boss sai da tela
  boss.style.right = '-400px';

  // 2. Enquanto ele está fora (1.5s de delay), mudamos as propriedades
  setTimeout(() => {
    viewport.classList.remove('running');

    // RESET DE ESCALA E COR SÓ ACONTECE AQUI (Invisível para o usuário)
    bossScale = 1 + (levelCorrectCount * 0.15);

    // Aplica a cor da fase atual
    const currentColor = levelColors[currentLevelIndex];
    boss.style.backgroundColor = currentColor;
    boss.style.filter = `drop-shadow(0 0 30px ${currentColor}) brightness(1.2)`;

    // Aplica a escala
    boss.style.transform = `scale(${bossScale})`;

    // 3. O Boss volta para a tela já com o visual novo
    boss.style.right = '80px';

    setTimeout(renderQuestion, 800);
  }, 1500);
}

function renderQuestion() {
  if (activeQuestions.length === 0) {
      // Se acabarem as perguntas antes do target, apenas avança
      return showLevelWin();
  }

  quizPanel.style.display = 'block';
  const currentTarget = levels[currentLevelIndex].target;
  document.getElementById('q-count').innerText = `${levelCorrectCount}/${currentTarget}`;

  const randomIndex = Math.floor(Math.random() * activeQuestions.length);
  currentQ = activeQuestions.splice(randomIndex, 1)[0];

  const levelName = levels[currentLevelIndex].name;
  document.getElementById('q-text').innerText = `[${levelName.toUpperCase()}]
  BUG Encontrado: ${currentQ.q}`;

  const optsGrid = document.getElementById('q-opts');
  optsGrid.innerHTML = '';

  currentQ.o.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(i);
    optsGrid.appendChild(btn);
  });
}

function handleAnswer(choice) {
  if (choice === currentQ.a) {
    bossShoot(); // Animação de tiro (Hero para Boss ou vice-versa conforme sua lógica)
    activateShield(); // Acerto garante proteção

    levelCorrectCount++;
    totalCorrectCount++;

    setTimeout(nextChallenge, 1500);
  } else {
    bossShoot(); // Erro faz o Boss causar dano
    totalErrors++;
    // Reinsere a pergunta no final para o aluno aprender
    activeQuestions.push(currentQ);

    // Pequeno feedback visual de erro
    quizPanel.classList.add('shake');
    setTimeout(() => quizPanel.classList.remove('shake'), 500);
  }
}

function calculateScore() {
  const score = (totalCorrectCount * 10) - (totalErrors * 5);
  return Math.max(0, score);
}

function getRank(score) {
  if (score >= 400) return { title: "LENDÁRIO", color: "#facc15" };
  if (score >= 250) return { title: "SÊNIOR", color: "#22c55e" };
  if (score >= 150) return { title: "PLENO", color: "#3b82f6" };
  return { title: "JÚNIOR", color: "#94a3b8" };
}

function gameOver() {
  const finalScore = calculateScore();
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <h1 style="color:#ef4444">SISTEMA CORROMPIDO</h1>
    <p style="color:#fff">Sua jornada parou na fase de ${levels[currentLevelIndex].name}</p>
    <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; color: white;">
        <p>Acertos: ${totalCorrectCount}</p>
        <p>Erros: ${totalErrors}</p>
        <h2 style="color:#facc15">Score: ${finalScore}</h2>
    </div>
    <button onclick="shareToWhatsApp()" class="opt-btn" style="background:#25d366; color:white; border:none;">Compartilhar no WhatsApp</button>
    <button onclick="location.reload()" class="start-btn">REBOOT</button>
  `;
}

function win() {
  const finalScore = calculateScore();
  const rank = getRank(finalScore);

  quizPanel.style.display = 'none';
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <h1 style="color:${rank.color}">RANK: ${rank.title}</h1>
    <p style="color:#fff">Você depurou todo o sistema com sucesso!</p>
    <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; color: white;">
        <p>Acertos Totais: <b>${totalCorrectCount}</b></p>
        <p>Bugs não resolvidos: <b>${totalErrors}</b></p>
        <h2 style="color:#facc15">PONTUAÇÃO FINAL: ${finalScore}</h2>
    </div>
    <button onclick="shareToWhatsApp()" class="opt-btn" style="background:#25d366; color:white; border:none;">Compartilhar no WhatsApp</button>
    <button onclick="location.reload()" class="start-btn">NOVO DESAFIO</button>
  `;
}

function bossShoot() {
  const container = document.getElementById('projectiles-container');
  const bullet = document.createElement('div');
  const hero = document.getElementById('hero');
  bullet.className = 'projectile';

  // Pegamos a posição do herói em relação à tela para saber onde parar
  // O herói geralmente está na esquerda (left)
  const heroRect = hero.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Posicionamento inicial (do Boss para a esquerda)
  bullet.style.right = (120 * bossScale) + 'px';
  bullet.style.bottom = (100 * bossScale) + 'px';
  container.appendChild(bullet);

  let pos = 120 * bossScale;

  const interval = setInterval(() => {
    pos += 12; // Velocidade do tiro
    bullet.style.right = pos + 'px';

    // Cálculo dinâmico:
    // Pegamos a posição ATUAL do tiro na tela
    const bulletRect = bullet.getBoundingClientRect();

    // Se o lado esquerdo do tiro (que está indo para a esquerda)
    // encostar ou passar da posição direita do herói: HIT!
    if (bulletRect.left <= heroRect.right) {
      clearInterval(interval);
      bullet.remove();
      processHit();
    }

    // Segurança: se o tiro sair totalmente da tela por algum motivo
    if (bulletRect.right < 0) {
      clearInterval(interval);
      bullet.remove();
    }
  }, 20);
}

function processHit() {
  const shield = document.getElementById('shield');
  if (shield.style.display !== 'block') {
    hp -= 10;
    updateUI();
    document.getElementById('hero').style.transform = 'translateX(-20px)';
    setTimeout(() => document.getElementById('hero').style.transform = 'translateX(0)', 100);
    if (hp <= 0) gameOver();
  } else {
    // Feedback visual de bloqueio
    document.getElementById('hero').style.boxShadow = "0 0 30px #facc15";
    setTimeout(() => document.getElementById('hero').style.boxShadow = "none", 200);
  }
}

function activateShield() {
  const s = document.getElementById('shield');
  s.style.display = 'block';
  setTimeout(() => s.style.display = 'none', 1200);
}

function updateUI() {
  const fill = document.getElementById('hp-fill');
  fill.style.width = hp + '%';
  fill.style.background = hp > 60 ? "#22c55e" : (hp > 30 ? "#eab308" : "#ef4444");
}

function shareToWhatsApp() {
  const finalScore = calculateScore();
  const rank = getRank(finalScore);
  const status = currentLevelIndex + 1 >= levels.length && levelCorrectCount >= levels[currentLevelIndex].target
                 ? "🚀 VENCI O DESAFIO!"
                 : `👾 Parei na Fase ${currentLevelIndex + 1}`;

  const text = `*RESULTADO DO MEU DEBUG* 🖥️%0A%0A` +
               `${status}%0A` +
               `🏆 Rank: *${rank.title}*%0A` +
               `✅ Acertos: ${totalCorrectCount}%0A` +
               `❌ Erros: ${totalErrors}%0A` +
               `⭐ Score Final: *${finalScore}*%0A%0A` +
               `_Será que você consegue bater meu score?_`;

  const url = `https://api.whatsapp.com/send?text=${text}`;
  window.open(url, '_blank');
}
// Inicializa o jogo ao carregar
window.startGame = startGame;
window.shareToWhatsApp = shareToWhatsApp;
