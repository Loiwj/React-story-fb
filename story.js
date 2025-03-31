// const ID_USER = require('RelayAPIConfigDefaults').actorID;
// const FB_DTSG = require('DTSGInitData').token;

(async () => {
    // Kiểm tra xem nút đã tồn tại chưa trước khi thêm lại
    if (document.querySelector('.react-container')) return;
    try {
        // Sử dụng chrome.runtime.getURL thay vì chrome.extension.getURL
        const emojiJson = await fetch(chrome.runtime.getURL('/db/emoji.json'));
        const EMOJI_LIST = await emojiJson.json();
        loadModal(EMOJI_LIST);
    } catch (e) {
        console.error("Lỗi khi tải hoặc xử lý emoji.json:", e);
    }

})();


function loadModal(EMOJI_LIST) {
    const fb_dtsg = getFbdtsg();
    const user_id = getUserId();
    // Kiểm tra xem có lấy được fb_dtsg và user_id không
    if (!fb_dtsg || !user_id) {
        console.error("Không thể lấy được fb_dtsg hoặc user_id. Script có thể không hoạt động đúng.");
        // Có thể thử lại sau một khoảng thời gian hoặc thông báo lỗi
        // return; // Thoát nếu không lấy được thông tin cần thiết
    }
    console.log({fb_dtsg, user_id});

    // Sử dụng MutationObserver thay vì setInterval để theo dõi sự thay đổi DOM hiệu quả hơn
    const observer = new MutationObserver((mutationsList, obs) => {
        // Tìm phần tử footer của story
        // Lưu ý: Class name của Facebook có thể thay đổi. Cần kiểm tra lại nếu không hoạt động.
        const storiesFooters = document.querySelectorAll('.x11lhmoz.x78zum5.x1q0g3np.xsdox4t.x10l6tqk.xtzzx4i.xwa60dl.xl56j7k.xtuxyv6'); // Cập nhật selector nếu cần
        const targetFooter = storiesFooters.length > 0 ? storiesFooters[storiesFooters.length - 1] : null;

        // Kiểm tra xem footer đã có và chưa có nút react của chúng ta
        if (targetFooter && !targetFooter.querySelector('.react-container')) {
            // obs.disconnect(); // Ngừng theo dõi sau khi tìm thấy và thêm nút

            const btnReact = document.createElement('div');
            btnReact.textContent = "MORE";
            btnReact.setAttribute('class', 'btn-react');

            const emojiGroup = document.createElement('ul');
            emojiGroup.setAttribute('class', 'emoji-group');

            btnReact.onclick = function (event) {
                event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                emojiGroup.classList.toggle('emoji-group--show');
            };

            EMOJI_LIST.forEach(emoji => {
                const emojiLi = document.createElement('li');
                emojiLi.setAttribute('class', 'emoji');
                emojiLi.setAttribute('value', emoji.value);
                emojiLi.textContent = emoji.value;
                emojiLi.onclick = async function (event) {
                    event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                    const storyId = getStoryId();
                    if (!storyId) {
                        console.error("Không tìm thấy storyId.");
                        return;
                    }
                    // Lấy lại fb_dtsg và user_id phòng trường hợp trang thay đổi
                    const current_fb_dtsg = getFbdtsg();
                    const current_user_id = getUserId();
                    if (!current_fb_dtsg || !current_user_id) {
                         console.error("Không thể lấy được fb_dtsg hoặc user_id khi react.");
                         return;
                    }
                    try {
                        await reactStory(current_user_id, current_fb_dtsg, storyId, emoji.value);
                        console.log("Đã react story " + storyId + " với: " + emoji.value);
                        emojiGroup.classList.remove('emoji-group--show'); // Ẩn danh sách emoji sau khi chọn
                    } catch (e) {
                        console.error("Lỗi khi react story:", e);
                    }
                }

                emojiGroup.appendChild(emojiLi);
            });

            const reactContainer = document.createElement('div');
            reactContainer.setAttribute('class', 'react-container');
            reactContainer.appendChild(btnReact);
            reactContainer.appendChild(emojiGroup);

            targetFooter.appendChild(reactContainer);

            // Thêm sự kiện để đóng popup emoji khi click ra ngoài
             document.body.addEventListener('click', () => {
                 if (emojiGroup.classList.contains('emoji-group--show')) {
                     emojiGroup.classList.remove('emoji-group--show');
                 }
             }, { once: true }); // Chỉ lắng nghe một lần sau khi mở
        }
    });

    // Bắt đầu theo dõi sự thay đổi trong body, tập trung vào subtree
    observer.observe(document.body, { childList: true, subtree: true });

    // Có thể thêm timeout để ngừng observer nếu không tìm thấy sau một khoảng thời gian nhất định
    // setTimeout(() => {
    //     observer.disconnect();
    //     console.log("Ngừng theo dõi DOM do hết thời gian.");
    // }, 30000); // Ngừng sau 30 giây chẳng hạn
}

function getStoryId() {
    // Selector này có thể cần cập nhật thường xuyên do Facebook thay đổi cấu trúc HTML
    const htmlStory = document.querySelector('[data-id]:not([data-id=""]):not([role="dialog"])'); // Thử selector tổng quát hơn
    // Hoặc thử một selector khác dựa trên cấu trúc bạn quan sát được
    // const htmlStory = document.querySelector('div[style*="transform: translate"] [data-id]');
    return htmlStory ? htmlStory.getAttribute('data-id') : null;
}


function getFbdtsg() {
    try {
        // Thử lấy từ input ẩn thường có trong form
        const dtsgInput = document.querySelector('input[name="fb_dtsg"]');
        if (dtsgInput && dtsgInput.value) {
            return dtsgInput.value;
        }
        // Nếu không có, thử tìm trong script inline (cách này kém ổn định hơn)
        const regex = /"DTSGInitialData",\[],{"token":"(.+?)"/gm;
        const html = document.documentElement.innerHTML;
        const match = regex.exec(html);
        return match ? match[1] : null;
    } catch (e) {
        console.error("Lỗi khi lấy fb_dtsg:", e);
        return null;
    }
}

function getUserId() {
     try {
        // Thử lấy từ cookie (cách này khá ổn định)
        const cookieMatch = document.cookie.match(/c_user=(\d+)/);
        if (cookieMatch && cookieMatch[1]) {
            return cookieMatch[1];
        }
        // Thử lấy từ một nguồn khác nếu cần (ví dụ: từ window object, nhưng cần cẩn thận)
        // const userIdFromWindow = window?.Env?.USER_ID;
        // if (userIdFromWindow) return userIdFromWindow;

        // Thử tìm trong script (kém ổn định)
        const regex = /"USER_ID":"(\d+)"/;
        const html = document.documentElement.innerHTML;
        const match = regex.exec(html);
        return match ? match[1] : null;
    } catch (e) {
        console.error("Lỗi khi lấy user_id:", e);
        return null;
    }
}

function reactStory(user_id, fb_dtsg, story_id, message) {
    return new Promise(async (resolve, reject) => {
        const variables = {
            input: {
                lightweight_reaction_actions: {
                    offsets: [0],
                    reaction: message
                },
                story_id,
                story_reply_type: 'LIGHT_WEIGHT',
                actor_id: user_id,
                // client_mutation_id có thể cần tạo ngẫu nhiên hoặc tăng dần
                client_mutation_id: Math.floor(Math.random() * 10) + 1, // Ví dụ
            },
        };

        const body = new URLSearchParams();
        body.append('av', user_id);
        body.append('__user', user_id);
        body.append('__a', '1'); // Thường là 1
        // body.append('__req', '...'); // Có thể cần các tham số __req, __hs, ... tùy thuộc vào API endpoint
        body.append('dpr', window.devicePixelRatio || '1');
        body.append('__ccg', 'GOOD'); // Connection quality guess
        body.append('__rev', ''); // Revision number, thử lấy từ source Facebook nếu cần
        body.append('__comet_req', '15'); // Hoặc một giá trị khác, có thể thay đổi
        body.append('fb_dtsg', fb_dtsg);
        body.append('fb_api_caller_class', 'RelayModern');
        body.append(
            'fb_api_req_friendly_name',
            'useStoriesSendReplyMutation' // Tên này có thể thay đổi
        );
        body.append('variables', JSON.stringify(variables));
        body.append('server_timestamps', 'true');
        // doc_id có thể thay đổi, cần kiểm tra lại nếu API không hoạt động
        body.append('doc_id', '3769885849805751'); // Đây là ID cũ, có thể đã thay đổi

        try {
            const response = await fetch(
                'https://www.facebook.com/api/graphql/', // Endpoint API
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        // Có thể cần thêm các header khác như 'X-FB-Friendly-Name', 'Sec-Fetch-Site', etc.
                        'Sec-Fetch-Site': 'same-origin',
                        'X-FB-Friendly-Name': body.get('fb_api_req_friendly_name'), // Gửi lại friendly name trong header
                    },
                    body,
                }
            );
            // Kiểm tra xem response có OK không (status 200-299)
            if (!response.ok) {
                // Log lỗi chi tiết hơn
                const errorText = await response.text();
                 console.error(`Lỗi HTTP: ${response.status} ${response.statusText}`, errorText);
                return reject(new Error(`HTTP error! status: ${response.status}, message: ${errorText}`));
            }
            const res = await response.json();
            // Kiểm tra lỗi trả về từ GraphQL API
            if (res.errors) {
                 console.error("Lỗi từ GraphQL API:", res.errors);
                return reject(res);
            }
             // Kiểm tra cấu trúc data mong đợi
            if (!res.data || !res.data.story_reply) { // Tên field data có thể khác
                console.warn("Phản hồi không có cấu trúc data mong đợi:", res);
                // return reject(new Error("Phản hồi không hợp lệ từ server")); // Hoặc xử lý linh hoạt hơn
            }
            resolve(res);
        } catch (error) {
             console.error("Lỗi mạng hoặc lỗi fetch:", error);
            reject(error);
        }
    });
}

// Thêm phần xử lý khi click ra ngoài để đóng popup emoji
document.addEventListener('click', (event) => {
    const emojiGroup = document.querySelector('.emoji-group.emoji-group--show');
    const reactContainer = document.querySelector('.react-container');

    // Nếu có emoji group đang hiển thị và click xảy ra bên ngoài react container
    if (emojiGroup && reactContainer && !reactContainer.contains(event.target)) {
        emojiGroup.classList.remove('emoji-group--show');
    }
});