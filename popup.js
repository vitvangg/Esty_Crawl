document.getElementById('scrape').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: scrapeAndDisplayProducts
    });
  });
});

function scrapeAndDisplayProducts() {
  async function scrapeProductDetails() {
    const products = [];
    const productContainers = document.querySelectorAll('div.v2-listing-card__info');

    for (let container of productContainers) {
      const product = {};

      // Extract title
      const titleElement = container.querySelector('h3.v2-listing-card__title');
      product.title = titleElement ? titleElement.innerText.trim() : '';

      // // Extract image URL
      // const imageElement = container.closest('div.v2-listing-card').querySelector('img.wt-width-full');
      // product.image = imageElement ? imageElement.src : '';

      // Extract product URL
      const linkElement = container.closest('a.listing-link');
      const productUrl = linkElement ? linkElement.href : '';

      // Fetch description from product page
      if (productUrl) {
        try {
          const response = await fetch(productUrl);
          const productPageHtml = await response.text();
          const productPage = new DOMParser().parseFromString(productPageHtml, 'text/html');
          const descriptionElement = productPage.querySelector('p[data-product-details-description-text-content]');
          product.description = descriptionElement ? descriptionElement.innerText.trim() : '';

          // Extract tags
          const tagsContainer = productPage.querySelector('.tags-section-container.tag-cards-section-container-with-images');
          const tagsElements = tagsContainer ? tagsContainer.querySelectorAll('h3.tag-card-title') : [];
          product.tags = Array.from(tagsElements).map(tagElement => tagElement.innerText);
          // Extract all images
           // Extract all image links
           const imageListContainer = productPage.querySelector('div[data-thumbnail-scroll-container] ul[data-carousel-pagination-list]');
           const imageElements = imageListContainer ? imageListContainer.querySelectorAll('li[data-carousel-pagination-item] img') : [];
           product.imageLinks = Array.from(imageElements).map(imgElement => imgElement.src);
        } catch (error) {
          console.error(`Failed to fetch product page: ${productUrl}`, error);
        }

      }

      products.push(product);
    }

    displayProductsOnPage(products);
  }

  function displayProductsOnPage(products) {
    let resultsDiv = document.getElementById('scraped-products');
    if (!resultsDiv) {
      resultsDiv = document.createElement('div');
      resultsDiv.id = 'scraped-products';
      resultsDiv.style.position = 'fixed';
      resultsDiv.style.top = '10px';
      resultsDiv.style.right = '10px';
      resultsDiv.style.backgroundColor = 'white';
      resultsDiv.style.border = '1px solid #ddd';
      resultsDiv.style.padding = '10px';
      resultsDiv.style.maxHeight = '400px';
      resultsDiv.style.overflowY = 'auto';
      document.body.appendChild(resultsDiv);
    }
    resultsDiv.innerHTML = '';
    products.forEach(product => {
      const productElement = document.createElement('div');
      productElement.style.marginBottom = '10px';

      const titleElement = document.createElement('div');
      titleElement.textContent = product.title;
      productElement.appendChild(titleElement);

      // if (product.image) {
      //   const imageElement = document.createElement('img');
      //   imageElement.src = product.image;
      //   imageElement.style.maxWidth = '100px';
      //   imageElement.style.marginTop = '5px';
      //   productElement.appendChild(imageElement);
      // }
      
      if (product.description) {
        const descriptionElement = document.createElement('div');
        descriptionElement.textContent = product.description;
        descriptionElement.style.marginTop = '5px';
        productElement.appendChild(descriptionElement);
      }
      if (product.tags && product.tags.length > 0) {
        const tagsElement = document.createElement('div');
        tagsElement.style.marginTop = '5px';
        tagsElement.textContent = `Tags: ${product.tags.join(', ')}`;
        productElement.appendChild(tagsElement);
      }
      if (product.imageLinks && product.imageLinks.length > 0) {
        const linksContainer = document.createElement('div');
        linksContainer.style.marginTop = '5px';
        linksContainer.textContent = 'Image Links:';
        product.imageLinks.forEach(link => {
          const linkElement = document.createElement('a');
          linkElement.href = link;
          linkElement.textContent = link;
          linkElement.target = '_blank';
          linkElement.style.display = 'block';
          linksContainer.appendChild(linkElement);
        });
        productElement.appendChild(linksContainer);
        
      }


      resultsDiv.appendChild(productElement);
    });
  }

  scrapeProductDetails();
}
