import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import './css/styles.css';
import renderImageCardMarkup from './js/renderImageCardMarkup';

const KEY_Pixabay = '30153953-c2efe0b6c1d70b35b33114bd2';

let gallery = new SimpleLightbox('.gallery .photo-card a', {
  captionDelay: 250,
});
let searchQuery = '';
let page = 1;
let perPage = 40;

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

formEl.addEventListener('submit', onSearchImages);
loadMoreBtn.addEventListener('click', onLoadMore);
galleryEl.addEventListener('click', onOpenImageCard);

function onSearchImages(evt) {
  evt.preventDefault();
  searchQuery = evt.currentTarget.elements.searchQuery.value;

  if (searchQuery === '') {
    clearContainer();
  }

  clearContainer();
  page = 1;

  renderImagesMarkup(searchQuery.trim());
}

function onLoadMore() {
  fetchImages(searchQuery.trim())
    .then(images => {
      const totalPages = images.totalHits / perPage;
      insertImageMarkup(images);
      loadMoreBtn.classList.remove('is-hidden');
      scroll();

      if (page > totalPages) {
        loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.warning(
          `We're sorry, but you've reached the end of search results.`
        );
      }

      page += 1;
      gallery.refresh();
    })
    .catch(error => console.log(error));
}

async function fetchImages(name) {
    
  const url = `https://pixabay.com/api/?key=${KEY_Pixabay}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`;
  const response = await axios.get(url);
  const images = await response.data;
  if (name === '') {
    Notiflix.Notify.info(`Please, enter some word  to find images.`);
    loadMoreBtn.classList.add('is-hidden');
    return;
  }

  return images;
}

async function renderImagesMarkup(searchQuery) {
  try {
    const images = await fetchImages(searchQuery.trim());
    const renderMarkup = await insertImageMarkup(images);
    loadMoreBtn.classList.add('is-hidden');

    if (images.totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
      loadMoreBtn.classList.remove('is-hidden');
    }
    if (images.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    page += 1;
    gallery.refresh();
  } catch (error) {
    console.log(error);
  }
}



function onOpenImageCard(event) {
  event.preventDefault();
  if (event.target.nodeName !== 'IMG') {
    return;
  }
}

function insertImageMarkup(images) {
  const markup = renderImageCardMarkup(images);
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

function clearContainer() {
  galleryEl.innerHTML = '';
}


