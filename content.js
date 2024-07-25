function scrapeAndDisplayProducts() {
    function scrapeProductDetails() {
      const products = [];
      const productContainers = document.querySelectorAll('div.v2-listing-card__info');
  
      productContainers.forEach(container => {
        const product = {};
  
        // Extract title
        const titleElement = container.querySelector('h3.v2-listing-card__title');
        product.title = titleElement ? titleElement.innerText.trim() : '';
  
        // Extract image URL
        const imageElement = container.closest('div.v2-listing-card').querySelector('img.wt-width-full');
        product.image = imageElement ? imageElement.src : '';
  
        products.push(product);
      });
  
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
  
        if (product.image) {
          const imageElement = document.createElement('img');
          imageElement.src = product.image;
          imageElement.style.maxWidth = '100px';
          imageElement.style.marginTop = '5px';
          productElement.appendChild(imageElement);
        }
  
        resultsDiv.appendChild(productElement);
      });
    }
  
    scrapeProductDetails();
  }
  
  scrapeAndDisplayProducts();
  