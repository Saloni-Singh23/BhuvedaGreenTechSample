// Contact Form Script
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = contactForm ? contactForm.querySelector('.submit-btn') : null;

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      // Get form data
      const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        company: document.getElementById('company').value.trim(),
        service: document.getElementById('service').value,
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
      };

      // Client-side validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
        return;
      }

      if (!formData.name || !formData.email || !formData.subject || !formData.message || !formData.service) {
        alert('Please fill in all required fields');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
        return;
      }

      // Send to backend
      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Form submitted successfully:', data);
          
          // Show success message
          contactForm.style.display = 'none';
          formSuccess.style.display = 'block';

          // Reset form after 3 seconds
          setTimeout(() => {
            contactForm.reset();
            contactForm.style.display = 'block';
            formSuccess.style.display = 'none';
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Message';
            }
          }, 3000);
        } else {
          alert('Error: ' + (data.message || 'Failed to submit form'));
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error submitting form. Please make sure the server is running. Check console for details.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      });
    });
  }

  // Smooth scroll to sections
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        const target = document.querySelector(href);
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
});
