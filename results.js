document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'displayProducts') {
      const products = message.products;

      if (products.length === 0) {
        console.log('No products found');
        return;
      }

      const productsDiv = document.getElementById('products');

      products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'product-title';
        titleDiv.textContent = product.title;
        productDiv.appendChild(titleDiv);

        if (product.image) {
          const imgElement = document.createElement('img');
          imgElement.src = product.image;
          productDiv.appendChild(imgElement);
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'product-checkbox';
        checkbox.dataset.index = index;
        productDiv.appendChild(checkbox);

        productsDiv.appendChild(productDiv);
      });

      document.getElementById('download').addEventListener('click', () => {
        const selectedProducts = [];
        document.querySelectorAll('.product-checkbox:checked').forEach(checkbox => {
          const index = checkbox.dataset.index;
          selectedProducts.push(products[index]);
        });

        if (selectedProducts.length > 0) {
          const worksheet = generateWorksheet(selectedProducts);
          downloadXLSX(worksheet, 'products.xlsx');
        } else {
          alert("Please select at least one product to download.");
        }
      });

      function generateWorksheet(products) {
        const data = products.map(product => ({
          Title: product.title,
          Images: product.imageLinks.join('\n'),
          Description: product.description,
          Tags: product.tags.map(tag => tag.trim()).join(', ')
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        return worksheet;
      }

      function downloadXLSX(worksheet, filename) {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
      }
    }
  });
});
