// Default hours per item if not specified
const DEFAULT_HOURS_PER_ITEM = 1;

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
  checkboxes.forEach((cb, idx) => {
    localStorage.setItem('cb_roadmap_' + idx, cb.checked); // Use a more specific key
  });
  updateProgressBar(); // Update bar on every save
}

function loadProgress() {
  const checkboxes = document.querySelectorAll('td input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    const saved = localStorage.getItem('cb_roadmap_' + idx);
    if (saved !== null) {
      cb.checked = saved === 'true';
    }
    // Add event listener for changes to any checkbox
    cb.addEventListener('change', saveProgress);
  });
  updateProgressBar(); // Initial update of the bar on load
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure the progress bar HTML is present (it should be in the README converted HTML)
  const progressContainer = document.getElementById('progress-container');
  if (progressContainer && !document.getElementById('progress-bar')) {
    const bar = document.createElement('div');
    bar.id = 'progress-bar';
    // Optional: Add ARIA attributes for accessibility
    // bar.setAttribute('role', 'progressbar');
    // bar.setAttribute('aria-valuenow', '0');
    // bar.setAttribute('aria-valuemin', '0');
    // bar.setAttribute('aria-valuemax', '100');
    progressContainer.appendChild(bar);
  }
  loadProgress();
});
