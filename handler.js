"use strict";

const {
  addConnection,
  deleteConnection,
  send,
  sendMessageToAllConnected,
  getConnectionIds,
} = require("./helperFunctions");


require("aws-sdk/clients/apigatewaymanagementapi");

const successfullResponse = {
  statusCode: 200,
  body: "everything is alright",
};

const connectionHandler = (event, context, callback) => {
  console.log("Input to lambda:", event);

  if (event.requestContext.eventType === "CONNECT") {
    // Handle connection
    addConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch((err) => {
        console.log(err);
        callback(null, JSON.stringify(err));
      });
  } else if (event.requestContext.eventType === "DISCONNECT") {
    // Handle disconnection
    deleteConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch((err) => {
        console.log(err);
        callback(null, {
          statusCode: 500,
          body: "Failed to connect: " + JSON.stringify(err),
        });
      });
  }
};

// This is a default handler, acts like a fallback option
const defaultHandler = (event, context, callback) => {
  console.log("defaultHandler was called");
  console.log(event);

  callback(null, {
    statusCode: 200,
    body: "defaultHandler",
  });
};

const sendMessageHandler = (event, context, callback) => {
  sendMessageToAllConnected(event)
    .then(() => {
      callback(null, successfullResponse);
    })
    .catch((err) => {
      callback(null, JSON.stringify(err));
    });
};

module.exports = {connectionHandler, defaultHandler, sendMessageHandler}
