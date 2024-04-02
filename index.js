import { checkoutCarts, getOrders, addUser } from "./ordersService.js";

export const handler = async (event) => {
  console.log("Handler initiated");
  console.log(event);

  try {
    if (event["detail-type"] != undefined) {
      if (event["detail-type"] == process.env.EVENT_DETAILTYPE1) {
        return await checkoutCarts(event);
      } else if (event["detail-type"] == process.env.EVENT_DETAILTYPE2) {
        return await addUser(event);
      }
    } else {
      switch (event.httpMethod) {
        case "POST":
          if (event.path == "/orders") {
            return await getOrders(event);
          }
        default:
          throw new Error("Invalid access");
      }
    }
  } catch (e) {
    return e;
  }
};
