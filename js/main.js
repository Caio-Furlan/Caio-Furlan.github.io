const body = document.body;
const themeToggle = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');

if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
  themeToggle?.setAttribute('aria-pressed', 'true');
  themeToggle?.setAttribute('aria-label', 'Ativar modo claro');
}

themeToggle?.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
});

const carousel = document.querySelector('[data-carousel]');

if (carousel) {
  const track = carousel.querySelector('.galeria-track');
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const dots = [...carousel.querySelectorAll('.galeria-dot')];
  let currentIndex = 0;

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
    });
  };

  prevButton?.addEventListener('click', () => {
    currentIndex = currentIndex === 0 ? dots.length - 1 : currentIndex - 1;
    updateCarousel();
  });

  nextButton?.addEventListener('click', () => {
    currentIndex = currentIndex === dots.length - 1 ? 0 : currentIndex + 1;
    updateCarousel();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      currentIndex = Number(dot.dataset.slide);
      updateCarousel();
    });

    dot.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        currentIndex = currentIndex === dots.length - 1 ? 0 : currentIndex + 1;
        updateCarousel();
        dots[currentIndex].focus();
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        currentIndex = currentIndex === 0 ? dots.length - 1 : currentIndex - 1;
        updateCarousel();
        dots[currentIndex].focus();
      }

      if (event.key === 'Home') {
        event.preventDefault();
        currentIndex = 0;
        updateCarousel();
        dots[currentIndex].focus();
      }

      if (event.key === 'End') {
        event.preventDefault();
        currentIndex = dots.length - 1;
        updateCarousel();
        dots[currentIndex].focus();
      }
    });
  });

  prevButton?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      currentIndex = currentIndex === dots.length - 1 ? 0 : currentIndex + 1;
      updateCarousel();
    }
  });

  nextButton?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      currentIndex = currentIndex === 0 ? dots.length - 1 : currentIndex - 1;
      updateCarousel();
    }
  });
}

const menuLinks = [...document.querySelectorAll('.header-menu a[href^="#"]')];
const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');

    if (!targetId || targetId === '#') {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const menuTargetId = targetId.replace('#', '');
    if (menuLinks.some((menuLink) => menuLink.getAttribute('href') === targetId)) {
      setActiveMenuLink(menuTargetId);
    }
  });
});

const revealElements = document.querySelectorAll('[data-reveal]');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const setActiveMenuLink = (id) => {
  menuLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', isCurrent);
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

if (menuLinks.length > 0) {
  const sections = menuLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const updateActiveMenuByScroll = () => {
    if (sections.length === 0) {
      return;
    }

    const headerElement = document.querySelector('.header');
    const headerOffset = (headerElement?.offsetHeight || 0) + 20;
    const scrollPoint = window.scrollY + headerOffset;
    const isNearPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

    if (isNearPageEnd) {
      setActiveMenuLink('contato');
      return;
    }

    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPoint) {
        activeId = section.id;
      }
    });

    setActiveMenuLink(activeId);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveMenuByScroll();
      ticking = false;
    });
  };

  updateActiveMenuByScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveMenuByScroll);
}

const titleElement = document.getElementById('titulo-digitacao');
const locationElement = document.getElementById('local-digitacao');

if (titleElement) {
  const rawText = titleElement.dataset.title || '';
  const lines = rawText.split('|');
  const fullText = lines.join('\n');
  let index = 0;

  const renderTypedText = () => {
    const partial = fullText.slice(0, index);
    const html = partial.replace(/\n/g, '<br>');
    titleElement.innerHTML = `${html}<span class="cursor-digitacao" aria-hidden="true">|</span>`;
  };

  titleElement.textContent = '';

  const typeInterval = window.setInterval(() => {
    index += 1;
    renderTypedText();

    if (index >= fullText.length) {
      window.clearInterval(typeInterval);
      window.setTimeout(() => {
        titleElement.innerHTML = fullText.replace(/\n/g, '<br>');

        if (locationElement) {
          const locationText = locationElement.dataset.text || locationElement.textContent || '';
          let locationIndex = 0;
          locationElement.textContent = '';

          const locationInterval = window.setInterval(() => {
            locationIndex += 1;
            locationElement.textContent = locationText.slice(0, locationIndex);

            if (locationIndex >= locationText.length) {
              window.clearInterval(locationInterval);
            }
          }, 55);
        }
      }, 350);
    }
  }, 72);
}
