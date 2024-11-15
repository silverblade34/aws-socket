import AWS from 'aws-sdk'

const connect = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    await dynamoDb.put({
        TableName: "ConnectionsTable",
        Item: { connectionId },
    }).promise();

    return { statusCode: 200 };
}

export const handler = connect