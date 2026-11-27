document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contactModal');
  const openBtn = document.getElementById('openContactModal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('successMessage');
  const submitBtn = document.getElementById('submitBtn');

  // Abrir/Fechar Modal
  openBtn.addEventListener('click', () => modal.classList.add('active'));
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });

  // Lógica de Envio Seguro
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Desabilita o botão para evitar duplo clique
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
        // Esconde o form e mostra o sucesso
        form.style.display = 'none';
        successMsg.style.display = 'block';
        
        // Refresh da página após 2.5 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        alert('Error: ' + result.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Execute Send →';
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Execute Send →';
    }
  });
});
