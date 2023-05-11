const AWS = require("aws-sdk");
let dynamo = new AWS.DynamoDB.DocumentClient();
const CHATCONNECTION_TABLE = "chatIdTable";
const addConnection = (connectionId) => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    Item: {
      connectionId: connectionId,
    },
  };
  console.log("We are in add connection function")
  return dynamo.put(params).promise();
};

const deleteConnection = (connectionId) => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    Key: {
      connectionId: connectionId,
    },
  };

  return dynamo.delete(params).promise();
};

const send = (event, connectionId) => {
  const body = JSON.parse(event.body);
  const postData = body.data;

  const endpoint =
    event.requestContext.domainName + "/" + event.requestContext.stage;
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: endpoint,
  });

  const params = {
    ConnectionId: connectionId,
    Data: postData,
  };
  return apigwManagementApi.postToConnection(params).promise();
};

const sendMessageToAllConnected = (event) => {
  return getConnectionIds().then((connectionData) => {
    return connectionData.Items.map((connectionId) => {
      return send(event, connectionId.connectionId);
    });
  });
};

const getConnectionIds = () => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    ProjectionExpression: "connectionId",
  };

  return dynamo.scan(params).promise();
};

module.exports = {
  addConnection,
  deleteConnection,
  send,
  sendMessageToAllConnected,
  getConnectionIds,
};
