import { errorMessage, requestCounter } from "./store";

class RequestHelper {
  constructor() {
    this.HASURA_URL = "https://" + API_URL;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(this.HASURA_URL, {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    });

    return result.json();
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.fetchMyQuery(operationsDoc);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      errorMessage.set(errors[0].message);
    }

    // do something great with this precious data
    requestCounter.update((n) => n - 1);
    console.log(data);
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.executeMyMutation(operationsDoc);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      errorMessage.set(errors[0].message);
    }

    // do something great with this precious data
    requestCounter.update((n) => n - 1);

    console.log(data);
    return data;
  }
}

export default new RequestHelper();
