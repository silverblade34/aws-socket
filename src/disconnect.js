import AWS from 'aws-sdk'

const disconnect = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    await dynamoDb.delete({
      TableName: "ConnectionsTable",
      Key: { connectionId },
    }).promise();
  
    return { statusCode: 200 };
}

export const handler = disconnect