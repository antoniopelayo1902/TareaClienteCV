import type { SiteData } from './types';

const $ = <T extends Element = Element>(selector: string) =>
  document.querySelector<T>(selector);

async function loadData(): Promise<SiteData> {
  const res = await fetch('./data/site.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('No se pudo cargar site.json');
  return res.json();
}

function setText(id: string, text: string) {
  const el = $('#' + id);
  if (el) el.textContent = text;
}

function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: { className?: string; html?: string } = {}
) {
  const el = document.createElement(tag);
  if (opts.className) el.className = opts.className;
  if (opts.html) el.innerHTML = opts.html;
  return el;
}

function renderBasics(data: SiteData) {
  setText('name', data.basics.name);
  setText('footer-name', data.basics.name);
  setText('title', data.basics.title);
  setText('summary', data.basics.summary);
  setText('location', data.basics.location);
  setText('year', new Date().getFullYear().toString());

  const emailEl = $('#email') as HTMLAnchorElement | null;
  if (emailEl) {
    emailEl.href = `mailto:${data.basics.email}`;
    emailEl.textContent = data.basics.email;
  }

  const webEl = $('#website') as HTMLAnchorElement | null;
  if (webEl) {
    webEl.href = data.basics.website;
    webEl.textContent = data.basics.website;
  }

  const phoneEl = $('#phone');
  if (phoneEl) phoneEl.textContent = data.basics.phone;

  const avatar = $('#avatar') as HTMLImageElement | null;
  if (avatar && data.basics.avatar) avatar.src = data.basics.avatar;

  const socials = $('#socials');
  if (socials) {
    socials.innerHTML = '';
    data.basics.socials.forEach(s => {
      const li = createEl('li');
      const a = createEl('a') as HTMLAnchorElement;
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.label;
      li.appendChild(a);
      socials.appendChild(li);
    });
  }

  // Fallback para el <title> visible (si JS cambia tarde)
  const titleSpan = document.getElementById('page-title-fallback');
  if (titleSpan) titleSpan.textContent = data.basics.name;
}

function renderSkills(data: SiteData) {
  const ul = $('#skills');
  if (!ul) return;
  ul.innerHTML = '';
  data.skills.forEach(skill => {
    const li = createEl('li', { className: 'chip', html: skill });
    ul.appendChild(li);
  });
}

function renderProjects(data: SiteData) {
  const container = $('#projects');
  if (!container) return;
  container.innerHTML = '';
  data.projects.forEach(p => {
    const card = createEl('article', 'card');
    const imgSrc = p.image || 'assets/images/avatar-placeholder.png';
    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" class="card-img" />
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <a href="${p.link}" target="_blank" rel="noopener" class="btn btn-link">Ver más</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderExperience(data: SiteData) {
  const container = $('#experience');
  if (!container) return;
  container.innerHTML = '';
  data.experience.forEach(e => {
    const item = createEl('article', 'item');
    item.innerHTML = `
      <h3>${e.role} · ${e.company}</h3>
      <p class="muted">${e.start} — ${e.end}</p>
      <p>${e.description}</p>
    `;
    container.appendChild(item);
  });
}

function renderEducation(data: SiteData) {
  const container = $('#education');
  if (!container) return;
  container.innerHTML = '';
  data.education.forEach(ed => {
    const item = createEl('article', 'item');
    item.innerHTML = `
      <h3>${ed.degree} · ${ed.school}</h3>
      <p class="muted">${ed.start} — ${ed.end}</p>
    `;
    container.appendChild(item);
  });
}

function setUpForm(emailTo: string) {
  const form = $('#contact-form') as HTMLFormElement | null;
  if (!form) return;
  // Enviar por FormSubmit con el email del JSON
  form.action = `https://formsubmit.co/${encodeURIComponent(emailTo)}`;

  const nameInput = $('#cf-name') as HTMLInputElement | null;
  const emailInput = $('#cf-email') as HTMLInputElement | null;
  const msgInput = $('#cf-message') as HTMLTextAreaElement | null;
  const feedback = $('#form-feedback') as HTMLParagraphElement | null;

  function showError(inputId: string, message: string) {
    const small = document.querySelector<HTMLElement>(`[data-error-for="${inputId}"]`);
    if (small) small.textContent = message;
  }
  function clearError(inputId: string) {
    const small = document.querySelector<HTMLElement>(`[data-error-for="${inputId}"]`);
    if (small) small.textContent = '';
  }
  function validEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('input', () => {
    if (nameInput && nameInput.value.trim().length < 2) {
      showError('cf-name', 'Mínimo 2 caracteres.');
    } else {
      clearError('cf-name');
    }
    if (emailInput && !validEmail(emailInput.value)) {
      showError('cf-email', 'Correo inválido.');
    } else {
      clearError('cf-email');
    }
    if (msgInput && msgInput.value.trim().length < 10) {
      showError('cf-message', 'Mínimo 10 caracteres.');
    } else {
      clearError('cf-message');
    }
  });

  form.addEventListener('submit', (e) => {
    let ok = true;
    if (nameInput && nameInput.value.trim().length < 2) ok = false;
    if (emailInput && !validEmail(emailInput.value)) ok = false;
    if (msgInput && msgInput.value.trim().length < 10) ok = false;

    if (!ok) {
      e.preventDefault();
      if (feedback) {
        feedback.textContent = 'Revisa los errores antes de enviar.';
        feedback.classList.add('error-text');
      }
    } else {
      if (feedback) {
        feedback.textContent = 'Enviando…';
        feedback.classList.remove('error-text');
      }
      // FormSubmit se encarga de la redirección/entrega
    }
  });
}

async function main() {
  try {
    const data = await loadData();
    renderBasics(data);
    renderSkills(data);
    renderProjects(data);
    renderExperience(data);
    renderEducation(data);
    setUpForm(data.contact.email);
  } catch (err) {
    console.error(err);
    const mainEl = document.querySelector('main');
    if (mainEl) {
      const alert = createEl('div', { className: 'alert error', html: 'Error cargando datos del CV.' });
      mainEl.prepend(alert);
    }
  }
}

document.addEventListener('DOMContentLoaded', main);
