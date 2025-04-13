// Tạm lưu kết quả xử lý
const processedTasks: any[] = [];

export const processLoginEvent = async (event: any): Promise<any> => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    const message = JSON.parse(body.Message);

    console.log('Received user login event:', message);

    // Lưu vào bộ nhớ (giả định không restart function)
    processedTasks.push({
      username: message.username,
      timestamp: new Date().toISOString()
    });
  }

  return;
};

export const getProcessedTasks = async (): Promise<any> => {
  return {
    statusCode: 200,
    body: JSON.stringify(processedTasks),
    headers: {
      'Content-Type': 'application/json'
    }
  };
};
