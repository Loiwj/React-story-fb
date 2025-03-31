# React Story Facebook (Tiện ích mở rộng cho Chrome)

## Mô tả

React Story Facebook là một tiện ích mở rộng (extension) dành cho trình duyệt Google Chrome (hoặc các trình duyệt dựa trên Chromium) giúp nâng cao trải nghiệm xem Facebook Stories. Nó thêm một nút bấm mới vào giao diện xem Story, cho phép bạn thả nhiều loại biểu tượng cảm xúc (emoji) hơn so với các tùy chọn mặc định của Facebook.

## Tính năng

* **Thêm nút "MORE":** Tự động chèn một nút bấm có nhãn "MORE" vào khu vực trả lời/thả cảm xúc của Facebook Story.
* **Bảng chọn Emoji đa dạng:** Khi nhấn nút "MORE", một bảng chứa rất nhiều loại emoji sẽ hiện ra.
* **Thả cảm xúc tùy chỉnh:** Chọn bất kỳ emoji nào từ bảng chọn để gửi phản hồi/cảm xúc cho Story hiện tại.
* **Tích hợp liền mạch:** Giao diện nút và bảng chọn được thiết kế gọn gàng, tích hợp vào giao diện gốc của Facebook.
* **Sử dụng API Facebook:** Gửi cảm xúc thông qua API nội bộ của Facebook (GraphQL).
* **Danh sách Emoji tùy chỉnh:** Danh sách emoji được tải từ tệp `db/emoji.json`, có thể được tùy chỉnh nếu muốn.

## Ảnh chụp màn hình

![](https://i.imgur.com/5QIHXp0.png)


*(Giao diện nút "MORE" và bảng chọn emoji khi xem Story)*

![](https://i.imgur.com/nkLEmFO.jpeg)


*(Giao diện từ góc nhìn của người nhận)*
## Cách hoạt động

Tiện ích này hoạt động bằng cách:

1.  **Lắng nghe sự kiện:** `background.js` theo dõi các tab đang mở.
2.  **Inject Script:** Khi bạn mở một trang Facebook Stories (`https://www.facebook.com/stories/...`), tiện ích sẽ tự động inject `story.js` vào trang đó.
3.  **Theo dõi DOM:** `story.js` sử dụng `MutationObserver` để theo dõi sự thay đổi trong cấu trúc HTML của trang Story.
4.  **Thêm giao diện:** Khi phát hiện phần chân (footer) của Story nơi chứa các nút thả cảm xúc mặc định, script sẽ chèn thêm container `.react-container` chứa nút "MORE" và bảng chọn emoji ẩn (`.emoji-group`).
5.  **Lấy thông tin cần thiết:** Script cố gắng lấy `user_id` (ID người dùng Facebook của bạn) và `fb_dtsg` (một mã token bảo mật) từ trang Facebook.
6.  **Xử lý sự kiện Click:**
    * Nhấn vào "MORE" sẽ hiển thị/ẩn bảng chọn emoji.
    * Nhấn vào một emoji trong bảng chọn sẽ kích hoạt hàm `reactStory`.
7.  **Gửi React:** Hàm `reactStory` tạo một yêu cầu POST đến API GraphQL của Facebook (`/api/graphql/`) với các thông tin cần thiết (bao gồm `user_id`, `fb_dtsg`, `story_id`, và emoji bạn đã chọn) để gửi cảm xúc đó.

## Cài đặt

1.  Mở trình duyệt Chrome, truy cập địa chỉ `chrome://extensions/`.
2.  Bật chế độ "Developer mode" (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
3.  Nhấn vào nút "Load unpacked" (Tải tiện ích đã giải nén).
4.  Duyệt đến thư mục `react-story-facebook-main` (chính là thư mục chứa file README này) và chọn nó.
5.  Tiện ích sẽ được cài đặt. Tải lại (refresh) các tab Facebook đang mở để tiện ích bắt đầu hoạt động.

## Cách sử dụng

1.  Đảm bảo bạn đã cài đặt tiện ích theo hướng dẫn ở trên.
2.  Đăng nhập vào tài khoản Facebook của bạn.
3.  Mở một Facebook Story bất kỳ (truy cập `https://www.facebook.com/stories/...` hoặc nhấp vào một story trên bảng tin).
4.  Trong giao diện xem Story, ở phía dưới cùng (gần chỗ nhập bình luận hoặc các nút cảm xúc mặc định), bạn sẽ thấy một nút tròn mới có chữ "MORE".
5.  Nhấp vào nút "MORE".
6.  Một bảng chứa nhiều emoji sẽ xuất hiện phía trên nút đó.
7.  Cuộn và nhấp vào emoji bạn muốn dùng để thả cảm xúc cho Story.
8.  Sau khi nhấp, bảng chọn sẽ tự đóng lại và cảm xúc của bạn sẽ được gửi đi.

## Lưu ý quan trọng / Cảnh báo

* **Thay đổi từ Facebook:** Facebook thường xuyên cập nhật giao diện và API của họ. Những thay đổi này có thể làm cho tiện ích ngừng hoạt động hoặc hoạt động không chính xác. Đặc biệt, các `selector` CSS dùng để tìm phần tử trên trang và `doc_id` dùng cho API GraphQL có thể cần được cập nhật theo thời gian.
* **Bảo mật:** Tiện ích này cần lấy `user_id` và `fb_dtsg` từ trang Facebook của bạn để hoạt động. Mặc dù mã nguồn được cung cấp để bạn kiểm tra, hãy luôn cẩn trọng khi cài đặt tiện ích từ các nguồn không xác định.

## Đóng góp

Nếu bạn thích dự án này, hãy tặng nó một ngôi sao ✨ và chia sẻ với bạn bè!
*(Dự án được tạo bởi Duong Quoc Loi)*