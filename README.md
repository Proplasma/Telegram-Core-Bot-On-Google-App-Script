"# Telegram-Core-Bot-On-Google-App-Script" 


This is the Telegram Bot Core Can that can Run and host It self on Google App Script For Free Online 24/7
Thông tin hướng dẫn set up và sử dụng bot:

/////////// English Below ///////////


# Bot Lưu Trữ Dữ Liệu Từ Telegram Lên Google Sheets

Một ứng dụng Google Apps Script (GAS) gọn nhẹ và hiệu quả, giúp kết nối Bot Telegram với Google Sheets. Tập lệnh này ghi nhận tin nhắn của người dùng và tự động lưu trữ chúng vào một bảng tính được chỉ định.

Điểm nổi bật của giải pháp này là trải nghiệm người dùng mang tính bất đồng bộ (asynchronous-like). Để ngăn chặn lỗi quá thời gian (timeout) của Webhook Telegram và cung cấp phản hồi tức thì, bot sẽ lập tức trả lời bằng thông báo "Loading..." (Đang xử lý...), thực hiện yêu cầu xử lý ngầm với Google Sheets API, và sau đó chỉnh sửa tin nhắn ban đầu thành kết quả cuối cùng.

## Mục Lục
- [Các Tính Năng Chính](#cac-tinh-nang-chinh)
- [Kiến Trúc Và Logic Hoạt Động](#kien-truc-va-logic-hoat-dong)
- [Yêu Cầu Tiền Quyết](#yeu-cau-tien-quyet)
- [Hướng Dẫn Cài Đặt](#huong-dan-cai-dat)
- [Giải Thích Cấu Trúc Mã Nguồn](#giai-thich-cau-truc-ma-nguon)

## Các Tính Năng Chính
* **Lưu Trữ Dữ Liệu Tự Động:** Ghi lại thời gian (timestamp), ID người dùng Telegram, Họ tên, và nội dung tin nhắn trực tiếp vào Google Sheets.
* **Phản Hồi Người Dùng Tức Thì:** Sử dụng các API endpoint `sendMessage` và `editMessageText` của Telegram để hiển thị trạng thái đang tải trong khi xử lý các tác vụ ngầm.
* **Cấu Hình Bảo Mật:** Sử dụng `PropertiesService` của Google Apps Script để lưu trữ thông tin nhạy cảm (Token và ID) một cách an toàn, giữ chúng tách biệt khỏi luồng thực thi chính.
* **Lệnh Tích Hợp Sẵn:** Hỗ trợ các lệnh cơ bản như `/start` để khởi tạo và `/test` để kiểm tra trạng thái hệ thống.

## Kiến Trúc Và Logic Hoạt Động

Bot hoạt động dựa trên kiến trúc Webhook. Dưới đây là luồng hoạt động:
1.  **Kích hoạt (Trigger):** Người dùng gửi một tin nhắn đến Bot Telegram.
2.  **Webhook:** Telegram chuyển tiếp tin nhắn này dưới dạng một gói dữ liệu JSON thông qua yêu cầu HTTP POST đến địa chỉ Web App URL của Google Apps Script.
3.  **Phản hồi tức thì (Immediate Response):** Tập lệnh (hàm `doPost`) tiếp nhận gói dữ liệu và lập tức gửi lại thông báo "⏳ Bot đang xử lý..." cho người dùng để xác nhận đã nhận lệnh. Nó lưu lại `message_id` của tin nhắn đang tải này.
4.  **Xử lý (Processing):** Tập lệnh phân tích văn bản, kiểm tra các lệnh cụ thể, và thêm một hàng mới vào Google Sheet đã kết nối.
5.  **Hoàn tất (Finalization):** Khi dữ liệu được ghi thành công vào Sheet, tập lệnh gọi lại Telegram API để chỉnh sửa tin nhắn "Đang xử lý..." ban đầu, thay thế bằng thông báo kết quả thành công.

## Yêu Cầu Tiền Quyết
Trước khi triển khai tập lệnh này, bạn cần có:
1.  Mã Token của Telegram Bot (lấy từ [@BotFather](https://t.me/botfather) trên Telegram).
2.  Tài khoản Google để tạo Google Sheet và sử dụng nền tảng Google Apps Script.
3.  ID của Google Sheet (được trích xuất từ URL của bảng tính: `https://docs.google.com/spreadsheets/d/[ID_SHEET_CUA_BAN]/edit`).

## Hướng Dẫn Cài Đặt

Tuân thủ nghiêm ngặt các bước sau để đảm bảo triển khai thành công.

### Bước 1: Chuẩn Bị Môi Trường Google Apps Script
1.  Tạo một Google Sheet mới.
2.  Điều hướng đến menu **Tiện ích mở rộng (Extensions)** > **Apps Script**.
3.  Xóa mọi mã code hiện có trong trình chỉnh sửa và dán toàn bộ mã nguồn được cung cấp vào.

### Bước 2: Cấu Hình Ban Đầu
1.  Tìm đến hàm `setupEnvironment()` trong tập lệnh.
2.  Thay thế `YOUR_BOT_TOKEN_HERE` bằng Token Bot Telegram thực tế của bạn.
3.  Thay thế `YOUR_GOOGLE_SHEET_ID` bằng ID Google Sheet thực tế của bạn.
4.  *Lưu ý: Tạm thời giữ nguyên biến `YOUR_WEBAPP_URL_HERE`.*

### Bước 3: Triển Khai Dưới Dạng Web App
1.  Nhấp vào nút **Triển khai (Deploy)** ở góc trên bên phải màn hình và chọn **Triển khai mới (New deployment)**.
2.  Nhấp vào biểu tượng bánh răng bên cạnh dòng "Chọn loại hình" (Select type) và chọn **Ứng dụng web (Web app)**.
3.  Định cấu hình bản triển khai như sau:
    * **Mô tả (Description):** (Tùy chọn) Ví dụ: "Triển khai lần đầu".
    * **Thực thi dưới dạng (Execute as):** `Tôi` (Me - Bằng tài khoản Google của bạn).
    * **Người có quyền truy cập (Who has access):** `Bất kỳ ai` (Anyone - Yêu cầu bắt buộc để máy chủ Telegram có thể gọi Webhook).
4.  Nhấp vào **Triển khai (Deploy)** và cấp các quyền truy cập ứng dụng khi được yêu cầu.
5.  Sao chép đường dẫn **URL Ứng dụng web (Web app URL)** vừa được tạo ra.

### Bước 4: Hoàn Tất Cấu Hình Và Thiết Lập Webhook
1.  Quay lại giao diện trình chỉnh sửa Apps Script.
2.  Trong hàm `setupEnvironment()`, thay thế `YOUR_WEBAPP_URL_HERE` bằng URL Ứng dụng web bạn vừa sao chép ở Bước 3.
3.  Lưu dự án (`Ctrl + S` hoặc `Cmd + S`).
4.  Từ menu thả xuống chọn hàm ở thanh công cụ phía trên, chọn `setupEnvironment` và nhấp vào nút **Chạy (Run)**. Thao tác này sẽ lưu thông tin xác thực của bạn vào vùng dữ liệu an toàn (Script Properties).
5.  Đổi menu thả xuống thành `setWebhook` và nhấp vào **Chạy (Run)**.
6.  Kiểm tra Nhật ký thực thi (Execution Log) ở cuối màn hình. Bạn sẽ thấy thông báo thành công cho biết kết quả Webhook trả về là `{"ok":true,...}`.

Bot của bạn hiện đã được kết nối thành công và sẵn sàng nhận lệnh.

## Giải Thích Cấu Trúc Mã Nguồn

* **Phần 1: Cấu hình (`setupEnvironment`)**
    Xử lý việc khởi tạo các biến hệ thống. Hàm này lưu Token, URL Web App, và ID Sheet vào `PropertiesService` để có thể truy xuất trên toàn cục mà không cần gán cứng (hardcode) các thông tin nhạy cảm vào luồng logic chính.
* **Phần 2: Các Hàm Hỗ Trợ (`getConfig`, `getTelegramUrl`, `setWebhook`, `sendText`, `editText`)**
    Bao gồm các hàm mô-đun hóa để tương tác với API Telegram. Hàm `sendText` gửi tin nhắn ban đầu và trả về đối tượng JSON (cần thiết để trích xuất `message_id`), trong khi hàm `editText` dùng ID đó để ghi đè nội dung lên tin nhắn đang tồn tại.
* **Phần 3: Logic Chính (`doGet`, `doPost`)**
    Thành phần cốt lõi của ứng dụng. Hàm `doGet` cung cấp một trang trạng thái HTML đơn giản để kiểm tra. Hàm `doPost` tiếp nhận luồng dữ liệu JSON từ Telegram, kích hoạt cơ chế hiển thị "Loading", phân loại lệnh yêu cầu, ghi dữ liệu vào bảng tính và kết thúc vòng đời tương tác với người dùng.

---
*Tuyên bố từ chối trách nhiệm: Mã nguồn được cung cấp nguyên trạng. Hãy đảm bảo bạn luôn quản lý các mã API token và quyền truy cập Web App của mình một cách bảo mật.*




# Telegram to Google Sheets Logger Bot

A lightweight and efficient Google Apps Script (GAS) application that connects a Telegram Bot to Google Sheets. This script captures user messages and automatically logs them into a specified spreadsheet. 

A key feature of this implementation is its asynchronous-like user experience. To prevent Telegram Webhook timeout errors and provide immediate feedback, the bot instantly replies with a "Loading..." message, processes the Google Sheets API request, and subsequently edits the initial message with the final result.

## Table of Contents
- [Key Features](#key-features)
- [Architecture and Logic](#architecture-and-logic)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Code Structure Explanation](#code-structure-explanation)

## Key Features
* **Automated Data Logging:** Records the timestamp, Telegram User ID, Full Name, and message content directly into Google Sheets.
* **Immediate User Feedback:** Utilizes Telegram's `sendMessage` and `editMessageText` API endpoints to display a loading state while processing background tasks.
* **Secure Configuration:** Employs Google Apps Script `PropertiesService` to store sensitive information (Tokens and IDs) securely, keeping them out of the main execution flow.
* **Built-in Commands:** Supports basic commands such as `/start` for initialization and `/test` for system status checks.

## Architecture and Logic

The bot operates on a Webhook architecture. Here is the operational flow:
1.  **Trigger:** A user sends a message to the Telegram Bot.
2.  **Webhook:** Telegram forwards this message as a JSON payload via an HTTP POST request to the Google Apps Script Web App URL.
3.  **Immediate Response:** The script (`doPost` function) intercepts the payload and immediately dispatches a "Loading..." message back to the user to acknowledge receipt. It stores the `message_id` of this loading message.
4.  **Processing:** The script parses the text, checks for specific commands, and appends a new row to the connected Google Sheet.
5.  **Finalization:** Once the data is successfully written to the Sheet, the script calls the Telegram API again to edit the original "Loading..." message, replacing it with a success notification.

## Prerequisites
Before deploying this script, you need:
1.  A Telegram Bot Token (obtained from [@BotFather](https://t.me/botfather) on Telegram).
2.  A Google Account to create a Google Sheet and utilize Google Apps Script.
3.  The Google Sheet ID (extracted from the URL of your spreadsheet: `https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]/edit`).

## Installation and Setup

Follow these steps strictly to ensure successful deployment.

### Step 1: Prepare the Google Apps Script Environment
1.  Create a new Google Sheet.
2.  Navigate to **Extensions** > **Apps Script**.
3.  Clear any existing code in the editor and paste the provided script.

### Step 2: Initial Configuration
1.  Locate the `setupEnvironment()` function in the script.
2.  Replace `YOUR_BOT_TOKEN_HERE` with your actual Telegram Bot Token.
3.  Replace `YOUR_GOOGLE_SHEET_ID` with your actual Google Sheet ID.
4.  *Note: Leave `YOUR_WEBAPP_URL_HERE` as it is for now.*

### Step 3: Deploy as Web App
1.  Click the **Deploy** button in the top right corner and select **New deployment**.
2.  Click the gear icon next to "Select type" and choose **Web app**.
3.  Configure the deployment:
    * **Description:** (Optional) e.g., "Initial Deployment"
    * **Execute as:** `Me` (Your Google account)
    * **Who has access:** `Anyone` (Crucial: Telegram servers need public access to trigger the webhook).
4.  Click **Deploy** and authorize the necessary permissions when prompted.
5.  Copy the generated **Web app URL**.

### Step 4: Finalize Setup and Set Webhook
1.  Return to the Apps Script editor.
2.  In the `setupEnvironment()` function, replace `YOUR_WEBAPP_URL_HERE` with the Web app URL you copied in Step 3.
3.  Save the project (`Ctrl + S` or `Cmd + S`).
4.  From the function dropdown menu in the toolbar, select `setupEnvironment` and click **Run**. This saves your credentials to the Script Properties.
5.  Change the dropdown to `setWebhook` and click **Run**.
6.  Check the Execution Log at the bottom of the screen. You should see a success message indicating the Webhook result is `{"ok":true,...}`.

Your bot is now live and ready to accept messages.

## Code Structure Explanation

* **Part 1: Configuration (`setupEnvironment`)**
    Handles the initialization of environment variables. It saves the Token, Web App URL, and Sheet ID into the `PropertiesService` for global access without hardcoding them into the main logic.
* **Part 2: Helper Functions (`getConfig`, `getTelegramUrl`, `setWebhook`, `sendText`, `editText`)**
    Contains modular functions for API interactions. `sendText` sends the initial message and returns the JSON response (needed to extract the `message_id`), while `editText` modifies an existing message using that ID.
* **Part 3: Main Logic (`doGet`, `doPost`)**
    The core of the application. `doGet` provides a simple HTML status page. `doPost` handles the incoming JSON payload from Telegram, executes the "Loading" mechanism, routes commands, writes to the spreadsheet, and finalizes the user interaction.

---
*Disclaimer: This project is provided as-is. Ensure you manage your API tokens and Web App permissions securely.*

