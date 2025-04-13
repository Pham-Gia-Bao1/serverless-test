Hệ thống demo microservice  + serverless + aws


 Chi tiết luồng
User gửi yêu cầu đăng nhập đến authService.


authService gửi sự kiện (ví dụ: userLoggedIn) tới EventBridge.


EventBridge sử dụng rule để route sự kiện này tới một SNS Topic.


SNS Topic gửi sự kiện xuống SQS Queue.


Lambda của taskService được trigger bởi SQS để xử lý.

✅ 1. Request đầu tiên: Đăng nhập
Gửi đến: authService


Endpoint: POST /login


Phản hồi trả về: access token (thường là JWT hoặc session token)


{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "Phạm Gia Bảo"
  }
}


✅ 2. Request thứ hai: Lấy danh sách task
Gửi đến: taskService


Endpoint: GET /tasks


Authorization: Bearer Token (gửi token đã nhận từ bước đăng nhập)


Ví dụ trong header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

The specific of create event between 2 services https://chatgpt.com/share/67fb29ce-d180-8010-892c-c6149b7d684b

Example of the serverless 
https://github.com/dsanandiya/lambda-nodejs-mysql-redis/blob/master/config/db.js



3: Tạo SNS trên AWS 
📣 Amazon SNS là gì?
SNS là dịch vụ giúp bạn gửi thông báo, tin nhắn, hoặc trigger đến các dịch vụ khác như:
Email, SMS, HTTP, Lambda,...


Giao tiếp giữa các microservices (publish/subscribe)



✅ Các bước tạo SNS Topic và cấu hình subscriber (SQS)
🔹 Bước 1: Truy cập SNS trong AWS
Vào: https://console.aws.amazon.com/sns/



🔹 Bước 2: Tạo một Topic
Vào "Topics" → Nhấn “Create topic”


Chọn:


Standard: phổ biến nhất


FIFO: nếu muốn thứ tự và không trùng lặp


Điền:


Name: ví dụ notify-orders


(Tùy chọn) bật encryption hoặc access policy


👉 Nhấn “Create topic”

🔹 Bước 3: Thêm một Subscriber (người nhận)
Trong Topic bạn vừa tạo → chọn tab "Subscriptions"


Nhấn "Create subscription"


Điền:


Protocol:


Email – gửi email


HTTPS – gửi POST đến URL của bạn


Lambda – trigger hàm Lambda


SQS – gửi tin nhắn đến hàng đợi


Endpoint: địa chỉ nhận (VD: email hoặc URL)


Nhấn “Create subscription”


⚠️ Nếu dùng email, bạn cần xác nhận link gửi đến email để bắt đầu nhận tin.

📤 Bước 4: Gửi thông báo (Publish Message)
Chọn topic → Nhấn “Publish message”


Nhập:


Subject: tiêu đề


Message body: nội dung thông báo


👉 Nhấn “Publish” để gửi đến tất cả subscriber

💻 Bonus: Gửi tin bằng AWS SDK (Node.js)
bash
CopyEdit
npm install @aws-sdk/client-sns

ts
CopyEdit
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: "ap-southeast-1" });

const sendNotification = async () => {
  const command = new PublishCommand({
    TopicArn: "arn:aws:sns:ap-southeast-1:123456789012:notify-orders",
    Message: "Đơn hàng mới vừa được tạo!",
    Subject: "Thông báo đơn hàng"
  });

  await sns.send(command);
};

sendNotification();


📌 Tóm tắt:
Mục
Mô tả
Topic
Nơi gửi tin nhắn
Subscription
Ai sẽ nhận (email, http, lambda,...)
Publish
Gửi thông báo



📌 SNS_TOPIC_ARN là gì?
SNS_TOPIC_ARN là Amazon Resource Name của một SNS Topic, dùng để định danh duy nhất topic đó trên AWS.
Nó giống như “địa chỉ” của Topic, để khi bạn muốn gửi message, bạn phải biết gửi đến đâu → chính là cái ARN này.

🔍 Cấu trúc của một SNS Topic ARN:
txt
CopyEdit
arn:aws:sns:<region>:<account-id>:<topic-name>

Ví dụ cụ thể:
txt
CopyEdit
arn:aws:sns:ap-southeast-1:123456789012:order-created

Thành phần
Ý nghĩa
arn
Bắt đầu chuỗi ARN
aws
Nhà cung cấp dịch vụ
sns
Dịch vụ SNS
ap-southeast-1
Vùng (region) của topic
123456789012
AWS Account ID
order-created
Tên topic bạn đã tạo


✅ Dùng ARN để làm gì?
Ví dụ dùng trong mã nguồn Node.js:
ts
CopyEdit
const params = {
  Message: "Thông báo đơn hàng mới",
  Subject: "Order Created",
  TopicArn: process.env.SNS_TOPIC_ARN
};

Hoặc dùng trong file .env:
env
CopyEdit
SNS_TOPIC_ARN=arn:aws:sns:ap-southeast-1:123456789012:order-created


💡 Tip:
Bạn có thể lấy ARN bằng cách:
Vào AWS Console → SNS → chọn topic → sẽ thấy Topic ARN ở góc phải bên trên.

 For the demo project : authService → EventBridge ->  SNS -> SQS -> taskService 


🛠 Cách tạo EventBridge trên AWS (giao diện web)
🧱 Bước 1: Tạo Event Bus (tuỳ chọn)
Nếu bạn dùng "default" event bus thì có thể bỏ qua bước này
Vào AWS Console


Tìm dịch vụ Amazon EventBridge


Chọn Event Buses → Create event bus


Điền:


Name: custom-event-bus (hoặc tên bất kỳ)


Type: Custom event bus


Nhấn Create



🔧 Bước 2: Tạo Rule (luật để lắng nghe sự kiện)
Trong EventBridge, chọn tab Rules


Click Create rule


Điền:


Name: UserLoginRule


Event bus: custom-event-bus (hoặc "default")


Event pattern:

 json
CopyEdit
{
  "source": ["authService"],
  "detail-type": ["userLoggedIn"]
}


Trong phần Target:


Loại target: Chọn SNS topic (nếu bạn muốn gửi tới SNS)


Hoặc chọn Lambda function nếu bạn đã có function sẵn


Nhấn Create rule



📨 Bước 3: Gửi thử 1 sự kiện (test)
Vào tab Event buses


Chọn event bus bạn dùng (default hoặc custom)


Bấm Send events


Nhập dữ liệu:


json
CopyEdit
{
  "Source": "authService",
  "DetailType": "userLoggedIn",
  "Detail": "{\"userId\": \"123\", \"username\": \"john\"}"
}

Bấm Send


Nếu rule và target đúng, SNS hoặc Lambda sẽ được trigger ngay.

🛠 Dùng AWS CLI (nếu bạn thích)
bash
CopyEdit
aws events put-events --entries '[
  {
    "Source": "authService",
    "DetailType": "userLoggedIn",
    "Detail": "{\"userId\": \"123\"}",
    "EventBusName": "default"
  }
]'


✅ Kết nối SNS hoặc SQS sau đó
Bạn có thể dùng Rule → Add Target → chọn SNS topic hoặc gửi tới Lambda.

