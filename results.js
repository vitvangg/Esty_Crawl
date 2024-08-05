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

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'product-checkbox';
        checkbox.dataset.index = index;
        titleDiv.appendChild(checkbox);

        const titleSpan = document.createElement('span');
        titleSpan.textContent = product.title;
        titleDiv.appendChild(titleSpan);
        
        productDiv.appendChild(titleDiv);

        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'product-images';
        product.imageLinks.forEach((link, imgIndex) => {
          const imgWrapper = document.createElement('div');
          imgWrapper.className = 'image-wrapper';

          const imgElement = document.createElement('img');
          imgElement.src = link;
          imgElement.style.width = '75px';
          imgElement.style.height = '75px';

          const imgCheckbox = document.createElement('input');
          imgCheckbox.type = 'checkbox';
          imgCheckbox.className = 'image-checkbox';
          imgCheckbox.dataset.productIndex = index;
          imgCheckbox.dataset.imageIndex = imgIndex;
          imgCheckbox.dataset.imageUrl = link; // Thêm URL ảnh vào dataset

          imgWrapper.appendChild(imgElement);
          imgWrapper.appendChild(imgCheckbox);

          imagesContainer.appendChild(imgWrapper);
        });
        productDiv.appendChild(imagesContainer);

        productsDiv.appendChild(productDiv);
      });

      document.getElementById('download').addEventListener('click', () => {
        const selectedProducts = [];
        const excludedImages = {};

        // Lấy các sản phẩm đã chọn
        document.querySelectorAll('.product-checkbox:checked').forEach(checkbox => {
          const index = checkbox.dataset.index;
          selectedProducts.push(products[index]);
        });

        // Lấy các ảnh đã tích để loại trừ
        document.querySelectorAll('.image-checkbox:checked').forEach(checkbox => {
          const productIndex = checkbox.dataset.productIndex;
          const imageUrl = checkbox.dataset.imageUrl; // Lấy URL ảnh từ dataset
          if (!excludedImages[productIndex]) {
            excludedImages[productIndex] = [];
          }
          excludedImages[productIndex].push(imageUrl);
        });

        if (selectedProducts.length > 0) {
          const xlsxContent = generateXLSX(selectedProducts, excludedImages);
          downloadXLSX(xlsxContent, 'products.xlsx');
        } else {
          alert("Please select at least one product to download.");
        }
      });

      function generateXLSX(products, excludedImages) {
        const maxImages = Math.max(...products.map(product => product.imageLinks.length));

        const headers = ['Title', 'Description', 'Tags', 'Select Options', ...Array.from({ length: maxImages }, (_, i) => `ImageLink ${i + 1}`)];

        const data = products.map((product, index) => {
          const row = {
            Title: product.title,
            Description: product.description,
            Tags: product.tags.map(tag => tag.trim()).join(', '),
            'Select Options': product.selectOptions ? product.selectOptions.join(', ') : ''
          };

          const includedImageUrls = product.imageLinks.filter(link => {
            return !(excludedImages[index] && excludedImages[index].includes(link));
          });

          includedImageUrls.forEach((imageUrl, imgIndex) => {
            row[`ImageLink ${imgIndex + 1}`] = imageUrl;
          });

          for (let i = 1; i <= maxImages; i++) {
            if (!row.hasOwnProperty(`ImageLink ${i}`)) {
              row[`ImageLink ${i}`] = '';
            }
          }

          return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

        const xlsxContent = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return xlsxContent;
      }

      function downloadXLSX(xlsxContent, filename) {
        const blob = new Blob([xlsxContent], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  });
});
