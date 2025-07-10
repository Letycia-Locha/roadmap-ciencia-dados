// Default hours per item if not specified
const DEFAULT_HOURS_PER_ITEM = 1;

// Hours per material used to calculate progress. If a title is not listed here
// the default will be used.
const HOURS_PER_ITEM = {
  // Bloco 1 – Análise de Dados
  'Estatística I': 40,
  'Estatística II': 20,
  'Governança de Dados': 30,
  'Excel para Ciência de Dados': 15,
  'SQL Básico': 15,
  'Projeto Excel': 25,
  'Projeto SQL': 25,

  // Bloco 2 – Programação
  'Python I': 5,
  'Python II': 80,
  'SQL Intermediário': 60,
  'EDA em SQL': 60,
  'Projeto ETL': 25,

  // Bloco 3 – EDA
  'Data Analyst Track': 80,
  'Associate Data Analyst': 50,
  'Fundamentos DS': 40,
  'Pandas': 15,
  'Matplotlib': 20,
  'Seaborn': 20,
  'Projeto EDA': 25,

  // Bloco 4 – Machine Learning
  'Tópicos em ML': 50,
  'Conceitos ML': 50,
  'Projeto ML': 25,

  // Bloco 5 – Ferramentas Avançadas
  'Big Data Analytics': 60,
  'Power BI Intro': 15,
  'Apache Spark': 10,
  'Curso Spark com PySpark': 12,
  'Projeto Spark': 25,

  // Bloco 6 – Deep Learning
  'Deep Learning': 15,
  'TensorFlow Docs': 15,
  'TensorFlow Learn ML': 15,
  'Projeto DL': 25,

  // Bloco Final – Portfólio
  'Git & GitHub na Prática': 25,
  'Criando Portfólio': 2,
};

async function loadServerProgress() {
  try {
    const resp = await fetch('/progress');
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.progress;
  } catch (e) {
    return null;
  }
}

function saveServerProgress(progressArray) {
  fetch('/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ progress: progressArray })
  });
}

function updateProgressBar() {
  const checkboxes = document.querySelectorAll('td input[type="checkbox"]'); // Target only checkboxes in table cells
  const progressBar = document.getElementById('progress-bar');

  if (!progressBar) {
    console.warn('Progress bar element not found.');
    return;
  }

  let totalHours = 0;
  let completedHours = 0;

  checkboxes.forEach(cb => {
    // Try to get hours from a 'data-hours' attribute, default if not present or invalid
    const itemHoursText = cb.getAttribute('data-hours');
    let itemHours = parseInt(itemHoursText, 10);
    if (isNaN(itemHours) || itemHours <= 0) {
      itemHours = DEFAULT_HOURS_PER_ITEM;
    }

    totalHours += itemHours;
    if (cb.checked) {
      completedHours += itemHours;
    }
  });

  const progressPercentage = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

  progressBar.style.width = progressPercentage + '%';
  progressBar.textContent = Math.round(progressPercentage) + '%';

  // For screen readers or other accessibility tools, update aria-valuenow
  // progressBar.setAttribute('aria-valuenow', progressPercentage);
}

function saveProgress() {
  const checkboxes = document.querySelectorAll('td input[type="checkbox"]');
  const progressArray = [];
  checkboxes.forEach((cb, idx) => {
    localStorage.setItem('cb_roadmap_' + idx, cb.checked); // Use a more specific key
    progressArray.push(cb.checked);
  });

  if (window.loggedIn) {
    saveServerProgress(progressArray);
  }
  updateProgressBar(); // Update bar on every save
}

function loadProgress() {
  const checkboxes = document.querySelectorAll('td input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    const saved = localStorage.getItem('cb_roadmap_' + idx);
    if (saved !== null) {
      cb.checked = saved === 'true';
    }
    cb.addEventListener('change', saveProgress);
  });

  if (window.loggedIn) {
    loadServerProgress().then(serverProgress => {
      if (serverProgress && serverProgress.length === checkboxes.length) {
        checkboxes.forEach((cb, idx) => {
          cb.checked = serverProgress[idx];
        });
      }
      updateProgressBar();
    });
  } else {
    updateProgressBar();
  }
}

function initializeCheckboxes() {
  // Convert textual "[ ]" into real checkbox inputs and attach hours metadata
  const rows = document.querySelectorAll('table tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 0) return;
    const firstCell = cells[0];
    const text = firstCell.textContent.trim();
    if (text === '[ ]' || text.toLowerCase() === '[x]') {
      const title = cells[1] ? cells[1].textContent.trim() : '';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = text.toLowerCase() === '[x]';
      const hours = HOURS_PER_ITEM[title] || DEFAULT_HOURS_PER_ITEM;
      checkbox.setAttribute('data-hours', hours);
      firstCell.textContent = '';
      firstCell.appendChild(checkbox);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure the progress bar HTML is present (it should be in the README converted HTML)
  const progressContainer = document.getElementById('progress-container');
  if (progressContainer && !document.getElementById('progress-bar')) {
    const bar = document.createElement('div');
    bar.id = 'progress-bar';
    progressContainer.appendChild(bar);
  }

  initializeCheckboxes();
  loadProgress();
});
