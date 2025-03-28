const search = document.querySelector('.buscador-input');
const btn = document.querySelector('.buscador-btn');
const main = document.getElementById('main');

const createModal = (imgUrl) => {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  // Loader
  const loader = document.createElement('div');
  loader.className = 'modal-loader';
  loader.innerHTML = '🌌';

  // Imagen del modal (comienza con una más liviana)
  const img = new Image();
  img.src = imgUrl.replace('&w=1080', '&w=400'); // 🔹 Carga primero versión pequeña
  img.classList.add('modal-img');
  img.style.opacity = '0';

  img.onload = () => {
      loader.remove();
      img.style.opacity = '1';

      // 🔹 Reemplazar con la imagen grande cuando la pequeña ya cargó
      setTimeout(() => {
          img.src = imgUrl; // Carga la de alta calidad en segundo plano
      }, 100);
  };

  img.onerror = () => {
      modal.innerHTML = '❌ Error al cargar la imagen';
      console.error("Error al cargar:", img.src);
  };

  modal.append(loader, img);
  document.body.append(modal, overlay);

  overlay.addEventListener('click', () => {
      modal.remove();
      overlay.remove();
  });
};

const preloadImage = (url) => {
  const img = new Image();
  img.src = url; // Se carga en caché sin mostrarla
};

// Modificamos la función `renderImg`
const renderImg = (data) => {
  main.innerHTML = '';

  const fragment = document.createDocumentFragment();
  data.forEach((img) => {
      const card = document.createElement('div');
      card.classList.add('card');

      const imgElement = document.createElement('img');
      imgElement.style.opacity = '0';
      imgElement.onload = () => {
          imgElement.style.opacity = '1';
      };
      imgElement.src = img.urls?.thumb || '';
      imgElement.dataset.full = img.urls?.full || '';

      imgElement.addEventListener('mouseenter', () => {
          preloadImage(imgElement.dataset.full);
      });

      imgElement.alt = img.alt_description || 'Imagen sin descripción';

      imgElement.addEventListener('click', () => {
          createModal(imgElement.dataset.full);
      });

      // 🔹 Enlace al perfil del autor
      const cardAuthor = document.createElement('a');
      cardAuthor.classList.add('author');
      cardAuthor.textContent = `Autor: ${img.user.username}`;
      cardAuthor.href = img.user.links.html; // 🔗 Link al perfil de Unsplash
      cardAuthor.target = '_blank'; // Para abrir en nueva pestaña
      cardAuthor.rel = 'noopener noreferrer'; // Seguridad

      card.append(imgElement, cardAuthor);
      fragment.append(card);
  });

  main.appendChild(fragment);
};


const getImages = async (query) => {
    main.innerHTML = '<div class="spine">🔄 Cargando...</div>';

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=10&page=1&client_id=jMBn4JdVYyIHAl4cKVZ7ICCtjtZmXHml5iEczZA7BkE`);

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        if (data.results.length === 0) {
            main.innerHTML = `<div class="no-results">No encontramos resultados para "${query}"</div>`;
        } else {
            renderImg(data.results);
        }
    } catch (error) {
        main.innerHTML = `<div class="error-message">⚠️ Ocurrió un error. Intenta nuevamente.</div>`;
        console.error(error);
    }
};

btn.addEventListener('click', () => {
    const query = search.value.trim();
    if (query.length < 3) {
        main.innerHTML = `<div class="error-message">Ingresa al menos 3 caracteres</div>`;
        return;
    }
    getImages(query.replace(/\s+/g, '+'));
});

search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btn.click();
});
