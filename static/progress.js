function saveProgress() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    localStorage.setItem('cb_'+idx, cb.checked);
  });
}

function loadProgress() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    const saved = localStorage.getItem('cb_'+idx);
    if (saved !== null) {
      cb.checked = saved === 'true';
    }
    cb.addEventListener('change', saveProgress);
  });
}

document.addEventListener('DOMContentLoaded', loadProgress);
