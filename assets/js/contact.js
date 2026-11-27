document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contactModal');
  const openBtn = document.getElementById('openContactModal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('successMessage');
  const submitBtn = document.getElementById('submitBtn');

  // Segurança: só executa se os elementos existirem
  if (!modal || !openBtn) return;

  // Abrir Modal
  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    // Foca no primeiro input para acessibilidade
    setTimeout(() => form.querySelector('input')?.focus(), 100);
  });

  // Fechar Modal (Botão X)
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  // Envio do Formulário
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: json
        });

        const result = await response.json();

        if (result.success) {
          form.style.display = 'none';
          successMsg.hidden = false;
          
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        } else {
          alert('Error: ' + (result.message || 'Unknown error'));
          submitBtn.disabled = false;
          submitBtn.textContent = 'Execute Send →';
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Network error. Please check your connection.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Execute Send →';
      }
    });
  }
});
