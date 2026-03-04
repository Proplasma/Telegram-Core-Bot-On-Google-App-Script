function AutoSetUpBot()
{
  Logger.log("Loading..."),
  setupEnvironment();
  setWebhook()
}
/**
 * ============================================================
 * PHẦN 1: CẤU HÌNH & SETUP (Chạy hàm này 1 lần đầu tiên)
 * ============================================================
 */

// 1. Điền thông tin vào 3 dòng dưới đây.
// 2. Chọn hàm 'setupEnvironment' trên thanh công cụ và bấm 'Run'.
function setupEnvironment() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    'BOT_TOKEN': 'YOUR_BOT_TOKEN_HERE',      // <--- Thay Token Bot Telegram vào đây
    'WEBAPP_URL': 'YOUR_WEBAPP_URL_HERE',    // <--- Thay URL Web App (sau khi Deploy) vào đây
    'SHEET_ID': 'YOUR_GOOGLE_SHEET_ID'       // <--- Thay ID Google Sheet vào đây
  });
  
  Logger.log("✅ Đã lưu cấu hình! Tiếp theo hãy chạy hàm 'setWebhook'.");
}

/**
 * ============================================================
 * PHẦN 2: CÁC HÀM HỖ TRỢ (HELPER FUNCTIONS)
 * ============================================================
 */

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    token: props.getProperty('BOT_TOKEN'),
    webAppUrl: props.getProperty('WEBAPP_URL'),
    ssId: props.getProperty('SHEET_ID')
  };
}

function getTelegramUrl() {
  const token = getConfig().token;
  if (!token) throw new Error("Chưa có Token. Hãy chạy setupEnvironment() trước.");
  return "https://api.telegram.org/bot" + token;
}

// Hàm cài đặt Webhook (Chạy 1 lần sau khi có Web App URL)
function setWebhook() {
  const config = getConfig();
  if (!config.webAppUrl) {
    Logger.log("❌ Lỗi: Chưa có WebApp URL trong cấu hình.");
    return;
  }
  const url = getTelegramUrl() + "/setWebhook?url=" + config.webAppUrl;
  const response = UrlFetchApp.fetch(url);
  Logger.log("Set Webhook Result: " + response.getContentText());
}

// Hàm gửi tin nhắn (Có trả về kết quả để lấy message_id)
function sendText(chatId, text) {
  const url = getTelegramUrl() + "/sendMessage?chat_id=" + chatId + "&text=" + encodeURIComponent(text);
  try {
    const response = UrlFetchApp.fetch(url);
    return JSON.parse(response.getContentText()); // Trả về JSON object
  } catch (e) {
    Logger.log("Lỗi gửi tin nhắn: " + e.toString());
    return null;
  }
}

// Hàm sửa tin nhắn (Edit Message) - Dùng để thay thế chữ "Loading..."
function editText(chatId, messageId, newText) {
  const url = getTelegramUrl() + "/editMessageText?chat_id=" + chatId + 
              "&message_id=" + messageId + 
              "&text=" + encodeURIComponent(newText);
  try {
    UrlFetchApp.fetch(url);
  } catch (e) {
    Logger.log("Lỗi sửa tin nhắn: " + e.toString());
  }
}

/**
 * ============================================================
 * PHẦN 3: LOGIC CHÍNH (MAIN LOGIC)
 * ============================================================
 */

function doGet(e) {
  return HtmlService.createHtmlOutput("🤖 Bot đang hoạt động (Status: OK)");
}

function doPost(e) {
  try {
    // 1. Lấy cấu hình & Parse dữ liệu
    const config = getConfig();
    if (!config.ssId) return; // Dừng nếu chưa cấu hình

    const data = JSON.parse(e.postData.contents);
    
    // Bỏ qua nếu không phải tin nhắn (ví dụ: edited_message, my_chat_member...)
    if (!data.message) return;

    const chatId = data.message.chat.id;
    const text = data.message.text || "File/Sticker (Không phải văn bản)";
    const firstName = data.message.chat.first_name || "";
    const lastName = data.message.chat.last_name || "";
    const fullName = (firstName + " " + lastName).trim();

    // 2. BƯỚC QUAN TRỌNG: Gửi tin nhắn "Loading..." NGAY LẬP TỨC
    // Việc này giúp User biết Bot đã nhận lệnh, tránh Time Out về cảm giác.
    const loadingResponse = sendText(chatId, "⏳ Bot đang xử lý...");
    
    // Lấy ID của tin nhắn Loading vừa gửi để lát nữa sửa lại
    let loadingMsgId = null;
    if (loadingResponse && loadingResponse.ok) {
      loadingMsgId = loadingResponse.result.message_id;
    }

    // 3. XỬ LÝ LOGIC (Lưu Sheet, tính toán...)
    let finalAnswer = "";


    if (text === "/start") {
      finalAnswer = "👋 Chào " + fullName + "! Hãy gửi nội dung, tôi sẽ lưu vào Sheet.";
    } else if (text === "/test") {
      finalAnswer = "✅ Hệ thống đang hoạt động bình thường.\n🕒 " + new Date().toLocaleString();
    } else {
      // Logic lưu vào Google Sheet
      try {
        const ss = SpreadsheetApp.openById(config.ssId);
        const sheet = ss.getSheets()[0]; // Lấy sheet đầu tiên
        // Ghi dữ liệu: Thời gian | ID User | Tên | Nội dung
        sheet.appendRow([new Date(), chatId, fullName, text]);
        
        finalAnswer = "✅ Đã lưu thành công nội dung:\n" + text;
      } catch (err) {
        finalAnswer = "❌ Lỗi khi lưu Sheet: " + err.message;
        Logger.log(err);
      }
    }

    // 4. PHẢN HỒI KẾT QUẢ CUỐI CÙNG
    if (loadingMsgId) {
      // Cách tối ưu: Sửa lại tin nhắn "Loading..." thành kết quả
      editText(chatId, loadingMsgId, finalAnswer);
    } else {
      // Dự phòng: Nếu lúc nãy gửi Loading bị lỗi thì gửi tin nhắn mới
      sendText(chatId, finalAnswer);
    }

  } catch (e) {
    Logger.log("CRITICAL ERROR: " + e.toString());
  }
}
