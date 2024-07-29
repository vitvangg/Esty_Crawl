document.getElementById('scrape').addEventListener('click', () => {
  console.log("Button clicked"); // Thêm dòng này để kiểm tra sự kiện bấm nút
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: scrapeAndDisplayProducts
    });
  });
});

function scrapeAndDisplayProducts() {
  // Thông báo cho người dùng biết đang crawl dữ liệu
  alert("Đang crawl dữ liệu, vui lòng chờ...");

  async function scrapeProductDetails() {
    const products = [];
    const productContainers = document.querySelectorAll('div.v2-listing-card__info');

    if (productContainers.length === 0) {
      console.error("Không tìm thấy sản phẩm nào");
      alert("Không tìm thấy sản phẩm nào");
      return;
    }

    for (let container of productContainers) {
      const product = {};

      // Extract title
      const titleElement = container.querySelector('h3.v2-listing-card__title');
      product.title = titleElement ? titleElement.innerText.trim() : '';

      // Extract image URL
      const imageElement = container.closest('div.v2-listing-card').querySelector('img.wt-width-full');
      product.image = imageElement ? imageElement.src : '';

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

          // Extract all image links
          const imageListContainer = productPage.querySelectorAll('img.wt-animated');
          product.imageLinks = Array.from(imageListContainer).map(imgElement => 
            imgElement.getAttribute('data-src-delay') || imgElement.src
          );
        } catch (error) {
          console.error(`Failed to fetch product page: ${productUrl}`, error);
        }
      }

      products.push(product);
    }

    console.log(products); // Thêm dòng này để kiểm tra dữ liệu sản phẩm
    chrome.runtime.sendMessage({ action: 'displayProducts', products });
  }

  scrapeProductDetails();
}
