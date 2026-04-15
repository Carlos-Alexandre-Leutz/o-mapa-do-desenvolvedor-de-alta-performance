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
  { name: "Fase 1: Estrutura (HTML)", questions: [...Repo.questionsHTML], target: 10 },
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

const isMobile = window.innerWidth <= 600;

const config = {
  hero: {
    baseY: isMobile ? 40 : 60,
    baseX: isMobile ? 30 : 100,
    width: isMobile ? 35 : 50,
    height: isMobile ? 50 : 70
  },
  boss: {
    baseY: isMobile ? 40 : 60,
    baseX: isMobile ? 30 : 80,
    baseHiddenX: isMobile ? -150 : -300,
    shotYOffset: isMobile ? 70 : 100
  },
  game: {
    projectileSpeed: 14,
  }
};

// --- REFERÊNCIAS AO DOM ---
const viewport = document.getElementById('viewport');
const boss = document.getElementById('boss');
const hero = document.getElementById('hero');
const quizPanel = document.getElementById('quiz-panel');

function setupMobileElements() {
  hero.style.width = config.hero.width + 'px';
  hero.style.height = config.hero.height + 'px';
  hero.style.bottom = config.hero.baseY + 'px';
  hero.style.left = config.hero.baseX + 'px';

  boss.style.bottom = config.boss.baseY + 'px';
  // O boss começa escondido
  boss.style.right = config.boss.baseHiddenX + 'px';
}

function startGame() {
  document.getElementById('overlay').style.display = 'none';
  setupMobileElements();
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

function nextChallenge() {
  if (levelCorrectCount >= levels[currentLevelIndex].target) {
    return showLevelWin();
  }

  quizPanel.style.display = 'none';
  viewport.classList.add('running');
  boss.style.right = config.boss.baseHiddenX + 'px';

  setTimeout(() => {
    viewport.classList.remove('running');

    bossScale = 1 + (levelCorrectCount * 0.12);
    const currentColor = levelColors[currentLevelIndex];

    boss.style.backgroundColor = currentColor;
    boss.style.filter = `drop-shadow(0 0 30px ${currentColor}) brightness(1.2)`;
    boss.style.transform = `scale(${bossScale})`;

    // Volta para posição de batalha
    boss.style.right = config.boss.baseX + 'px';

    setTimeout(renderQuestion, 800);
  }, 1500);
}

function renderQuestion() {
  if (activeQuestions.length === 0) return showLevelWin();

  quizPanel.style.display = 'block';
  const currentTarget = levels[currentLevelIndex].target;
  document.getElementById('q-count').innerText = `${levelCorrectCount}/${currentTarget}`;

  const randomIndex = Math.floor(Math.random() * activeQuestions.length);
  currentQ = activeQuestions.splice(randomIndex, 1)[0];

  const levelName = levels[currentLevelIndex].name;
  document.getElementById('q-text').innerText = `[${levelName.toUpperCase()}]\nBUG Encontrado: ${currentQ.q}`;

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
    bossShoot();
    activateShield();
    levelCorrectCount++;
    totalCorrectCount++;
    setTimeout(nextChallenge, 1500);
  } else {
    bossShoot();
    totalErrors++;
    activeQuestions.push(currentQ); // Devolve para a fila
    quizPanel.classList.add('shake');
    setTimeout(() => quizPanel.classList.remove('shake'), 500);
  }
}

function bossShoot() {
  const container = document.getElementById('projectiles-container');
  const bullet = document.createElement('div');
  bullet.className = 'projectile';

  const containerRect = container.getBoundingClientRect();
  const bossRect = boss.getBoundingClientRect();

  // Posicionamento inicial relativo ao container
  bullet.style.right = (containerRect.right - bossRect.left) + 'px';
  bullet.style.bottom = (config.boss.shotYOffset * bossScale) + 'px';
  container.appendChild(bullet);

  let currentRight = parseFloat(bullet.style.right);

  const interval = setInterval(() => {
    currentRight += config.game.projectileSpeed;
    bullet.style.right = currentRight + 'px';

    const bulletRect = bullet.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();

    // Detecção de colisão (ponta esquerda do tiro vs lado direito do herói)
    if (bulletRect.left <= heroRect.right) {
      clearInterval(interval);
      bullet.remove();
      processHit();
    }

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
    hero.style.transform = 'translateX(-20px)';
    setTimeout(() => hero.style.transform = 'translateX(0)', 100);
    if (hp <= 0) gameOver();
  } else {
    hero.style.boxShadow = "0 0 30px #facc15";
    setTimeout(() => hero.style.boxShadow = "none", 200);
  }
}

function activateShield() {
  const s = document.getElementById('shield');
  s.style.display = 'block';
  setTimeout(() => s.style.display = 'none', 1400);
}

function updateUI() {
  const fill = document.getElementById('hp-fill');
  fill.style.width = hp + '%';
  fill.style.background = hp > 60 ? "#22c55e" : (hp > 30 ? "#eab308" : "#ef4444");
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
      <div style="margin-top:20px; color:#facc15">Bugs totais resolvidos: ${totalCorrectCount}</div>
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

function calculateScore() {
  const levelBonus = currentLevelIndex * 50;
  const score = (totalCorrectCount * 10) + levelBonus - (totalErrors * 5);
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
        <h1 style="color:${rank.color}; margin-top: auto;">RANK: ${rank.title}</h1>
        <p style="color:#fff">Você depurou todo o sistema!</p>

        <div style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; color: white; width: 80%; max-width: 400px;">
            <p>Acertos Totais: <b>${totalCorrectCount}</b></p>
            <p>Bugs Pendentes: <b>${totalErrors}</b></p>
            <h2 style="color:#facc15; margin: 5px 0;">SCORE: ${finalScore}</h2>
        </div>

        <div style="width: 100%; max-width: 500px; display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 10px; margin-bottom: auto; padding: 0 10px;">
            <button onclick="shareToWhatsApp()" class="opt-btn" style="background:#25d366; color:white; border:none; flex: 1; text-align: center; padding: 15px; font-size: 0.9rem; white-space: nowrap;">
                COMPARTILHAR
            </button>

            <button onclick="location.reload()" class="start-btn" style="flex: 1; padding: 15px; font-size: 0.9rem; white-space: nowrap;">
                NOVO DESAFIO
            </button>
        </div>
    `;
}

function win() {
  const finalScore = calculateScore();
  const rank = getRank(finalScore);
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `
        <h1 style="color:${rank.color}; margin-top: auto;">RANK: ${rank.title}</h1>
        <p style="color:#fff">Você depurou todo o sistema!</p>

        <div style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; color: white; width: 80%; max-width: 400px;">
            <p>Acertos Totais: <b>${totalCorrectCount}</b></p>
            <p>Bugs Pendentes: <b>${totalErrors}</b></p>
            <h2 style="color:#facc15; margin: 5px 0;">SCORE: ${finalScore}</h2>
        </div>

        <div style="width: 100%; max-width: 500px; display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 10px; margin-bottom: auto; padding: 0 10px;">
            <button onclick="shareToWhatsApp()" class="opt-btn" style="background:#25d366; color:white; border:none; flex: 1; text-align: center; padding: 15px; font-size: 0.9rem; white-space: nowrap;">
                COMPARTILHAR
            </button>

            <button onclick="location.reload()" class="start-btn" style="flex: 1; padding: 15px; font-size: 0.9rem; white-space: nowrap;">
                NOVO DESAFIO
            </button>
        </div>
    `;
}

function shareToWhatsApp() {
  const finalScore = calculateScore();
  const rank = getRank(finalScore);
  const text = `*DEV QUEST: RESULTADO* 🖥️%0A%0A` +
               `🏆 Rank: *${rank.title}*%0A` +
               `✅ Acertos: ${totalCorrectCount}%0A` +
               `⭐ Score: *${finalScore}*%0A%0A` +
               `_Será que você consegue bater meu score?_`;

  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

// Globaliza as funções para o HTML
window.startGame = startGame;
window.shareToWhatsApp = shareToWhatsApp;