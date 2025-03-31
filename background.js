chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // Đảm bảo chỉ thực thi khi tab đã tải xong và đúng URL
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("https://www.facebook.com/stories")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['story.js']
        }).catch(err => console.log("Lỗi khi inject script:", err)); // Thêm xử lý lỗi nếu cần
    }
});