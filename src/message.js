import AWS from 'aws-sdk';

const message = async (event) => {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const apiGateway = new AWS.ApiGatewayManagementApi({
        endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`
    });

    const body = JSON.parse(event.body);
    const message = body.message;

    const senderConnectionId = event.requestContext.connectionId;

    const connections = await dynamoDb.scan({
        TableName: "ConnectionsTable",
        ProjectionExpression: 'connectionId',
    }).promise();

    const postCalls = connections.Items
        .filter(({ connectionId }) => connectionId !== senderConnectionId)
        .map(async ({ connectionId }) => {
            try {
                await apiGateway.postToConnection({
                    ConnectionId: connectionId,
                    Data: JSON.stringify({ message }),
                }).promise();
            } catch (err) {
                if (err.statusCode === 410) {
                    await dynamoDb.delete({
                        TableName: "ConnectionsTable",
                        Key: { connectionId },
                    }).promise();
                }
            }
        });

    await Promise.all(postCalls);

    return { statusCode: 200 };
}

export const handler = message;
