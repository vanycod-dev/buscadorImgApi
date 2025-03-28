const search = document.querySelector('.buscador-input');
const btn = document.querySelector('.buscador-btn');
const main = document.getElementById('main');
const spine = document.querySelector('.spine');

const modal = (imgen) => {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  // 1️⃣ - Asegúrate de que la URL sea válida
  const imgUrl = imgen.urls?.full;
  if (!imgUrl) {
      console.error("🚨 URL de imagen no encontrada:", imgen);
      return;
  }

  // 2️⃣ - Crea el loader
  const loader = document.createElement('div');
  loader.className = 'modal-loader';
  loader.innerHTML = '🌀';

  // 3️⃣ - Precarga + manejo de errores
  const img = new Image();
  img.onload = () => {
      modal.innerHTML = ''; // Limpia el loader
      const imgElement = document.createElement('img');
      imgElement.src = imgUrl;
      imgElement.alt = imgen.alt_description || 'Imagen sin descripción';
      imgElement.classList.add('modal-img', 'loaded');
      modal.appendChild(imgElement);
  };
  img.onerror = () => {
      modal.innerHTML = '❌ Error al cargar la imagen';
      console.error("Error al cargar:", imgUrl);
  };
  img.src = imgUrl; // ¡Inicia la carga!

  // 4️⃣ - Añade al DOM
  modal.appendChild(loader);
  document.body.appendChild(modal);
  document.body.appendChild(overlay);

  // Eventos (cierre)
  overlay.addEventListener('click', () => {
      modal.remove();
      overlay.remove();
  });
};


const renderImg = (data) => {
    main.innerHTML = '';

    const fragment = document.createDocumentFragment();
    data.forEach((img) => {

      const card = document.createElement('div');
      card.classList.add('card');

      const imgElement = document.createElement('img');
      imgElement.style.opacity = '0';
      imgElement.onload = () => {imgElement.style.opacity = '1';};
      imgElement.src = img.urls?.thumb || '';
      imgElement.dataset.src = img.urls?.small || '';
      imgElement.alt = img.alt_description  || 'Imagen sin descripción';
      imgElement.addEventListener('mouseenter', () => {
        const imgPreload = new Image();
        imgPreload.src = img.urls?.full; // Precarga cuando el usuario "roza" la imagen
      });
      imgElement.addEventListener('click', () => {
        // window.open(img.urls.full);
        modal(img);
        console.log(imgElement.src);
        // console.log(img.urls.full);
      });

      const cardAuthor = document.createElement('p');
      cardAuthor.classList.add('author');
      cardAuthor.textContent = `Autor: ${img.user.username}`;
      
      card.append(imgElement, cardAuthor);
      fragment.append(card);
    });
    main.appendChild(fragment);
 
  };

const getImg = async (query) => {
    main.innerHTML = '';

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=10&page=1&client_id=jMBn4JdVYyIHAl4cKVZ7ICCtjtZmXHml5iEczZA7BkE`);

        if(!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();

        console.log(data);

        if (data.results.length === 0) {
            main.innerHTML = `
              <div class="no-results">
                No encontramos resultados para "${query}"
                <span class="suggestion">Prueba con términos como "naturaleza", "ciudad", etc.</span>
              </div>
            `;
          } else {
            renderImg(data.results);
          }
    } catch (error) {
        
    } finally { 
    }
}

btn.addEventListener('click', () => {
    const query = search.value.trim();
    if(query.length < 3) {
        main.innerHTML = `
      <div class="error-message">
        Ingresa al menos 3 caracteres
      </div>
    `;
    return;
    }
    getImg(query.replace(/\s+/g, '+'));
    console.log(query.replace(/\s+/g, '+'));
});

search.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        btn.click();
    }
});