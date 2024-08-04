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
          const xlsxContent = generateXLSX(selectedProducts);
          downloadXLSX(xlsxContent, 'products.xlsx');
        } else {
          alert("Please select at least one product to download.");
        }
      });

      function generateXLSX(products) {
        // Xác định số lượng imageLinks lớn nhất
        const maxImages = Math.max(...products.map(product => product.imageLinks.length));
        
        // Tạo tiêu đề cho các cột
        const headers = ['Title', 'Description', 'Tags','Select Options', ...Array.from({ length: maxImages }, (_, i) => `ImageLink ${i + 1}`)];
        
        // Tạo dữ liệu cho bảng
        const data = products.map(product => {
          const row = {
            Title: product.title,
            Description: product.description,
            Tags: product.tags.map(tag => tag.trim()).join(', '),
            'Select Options': product.selectOptions ? product.selectOptions.join(', ') : ''
          };
          product.imageLinks.forEach((link, index) => {
            row[`ImageLink ${index + 1}`] = link;
          });
          return row;
        });

        // Thêm các cột hình ảnh còn thiếu với giá trị rỗng
        data.forEach(row => {
          for (let i = 1; i <= maxImages; i++) {
            if (!row.hasOwnProperty(`ImageLink ${i}`)) {
              row[`ImageLink ${i}`] = '';
            }
          }
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
