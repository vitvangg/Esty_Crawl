chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'displayProducts') {
    console.log(message.products); // Check the received product data

    chrome.tabs.create({ url: chrome.runtime.getURL("results.html") }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tab.id, { action: 'displayProducts', products: message.products });
        }
      });
    });
  }
});
