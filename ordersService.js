import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

let res = {
  headers: {},
  statusCode: 0,
  body: {},
};

export const getOrders = async (event) => {
  console.log("getOrders invoked...");
  console.log(event);

  if (!event || !event.body) {
    console.log("Failed to find event or event.body");
    res.statusCode = 400;
    res.body = JSON.stringify({ message: "Invalid Access" });
    return res;
  }

  try {
    // Find the user's order table
    const getOrderCommand = new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_ORDERS,
      Key: {
        email: event.body.email,
      },
    });
    console.log("Retrieving current order info...");
    const getOrderResponse = await docClient.send(getOrderCommand);
    console.log("Got response..");
    console.log(getOrderResponse);
    res.statusCode = 200;
    res.body = JSON.stringify({
      message: "Update Successful",
      orders: getOrderResponse.Item.orders,
    });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.body = JSON.stringify({ message: "Server Error" });
  } finally {
    return res;
  }
};

export const checkoutCarts = async (event) => {
  console.log("checkoutCarts invoked...");
  console.log(event);

  if (!event || !event.detail) {
    console.log("Failed to find event or event.detail");
    res.statusCode = 400;
    res.body = JSON.stringify({ message: "Invalid Access" });
    return res;
  }

  const cartInfo = event.detail.cartInfo;
  const grandTotal = event.detail.grandTotal;
  const email = event.detail.email;

  try {
    // Find the user's order table
    const getOrderCommand = new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_ORDERS,
      Key: {
        email: email,
      },
    });

    console.log("Retrieving current order info...");
    const getOrderResponse = await docClient.send(getOrderCommand);
    console.log("Got response..");
    console.log(getOrderResponse);

    let orderInfo = getOrderResponse.Item.orders;

    const arr = Object.keys(orderInfo);

    console.log("orderInfo", orderInfo);
    console.log("cartInfo", cartInfo);

    let date = new Date();
    date.setHours(date.getHours() + 11);

    orderInfo = {
      ...orderInfo,
      [arr.length + 1]: {
        grandTotal: grandTotal,
        date: date.toLocaleString(),
        cartInfo,
      },
    };

    console.log("New orderInfo", orderInfo);

    const command = new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_ORDERS,
      Key: {
        email: email,
      },
      UpdateExpression: "set orders = :v_orders",
      ExpressionAttributeValues: {
        ":v_orders": orderInfo,
      },
      ReturnValues: "ALL_NEW",
    });

    console.log("Sending update command");
    const updateResponse = await client.send(command);
    console.log("Response is");
    console.log(updateResponse);
    console.log(updateResponse.Attributes.orders);
    res.statusCode = 200;
    res.body = JSON.stringify({
      message: "Update Successful",
      carts: updateResponse.Attributes.carts,
    });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.body = JSON.stringify({ message: "Server Error" });
  } finally {
    return res;
  }
};

export const addUser = async (event) => {
  console.log("addUser invoked...");
  console.log(event);

  if (!event || !event.detail) {
    console.log("Failed to find event or event.detail");
    res.statusCode = 400;
    res.body = JSON.stringify({ message: "Invalid Access" });
    return res;
  }

  const email = event.detail.email;

  try {
    const command = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE_ORDERS,
      Item: marshall({
        email: email,
        orders: {},
      }),
    });

    const response = await client.send(command);
    res.statusCode = 200;
    res.body = JSON.stringify({
      message: "Update Successful",
    });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.body = JSON.stringify({ message: "Server Error" });
  } finally {
    return res;
  }
};
