<script>
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";
  import { requestCounter, isOffline, errorMessage } from "./store";

  const toAdd = {};
  const toDelete = {};
  window.onoffline = () => {
    isOffline.set(true);
  };
  window.ononline = () => {
    isOffline.set(false);
  };
  function createApolloClient() {
    const httpLink = new HttpLink({
      uri: "https://" + API_URL,
    });
    const cache = new InMemoryCache();
    const wsLink = new WebSocketLink({
      uri: "wss://" + API_URL,
      options: {
        reconnect: true,
      },
    });
    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink,
    );
    return new ApolloClient({
      link,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);
  let sweets;
  try {
    sweets = subscribe(OperationDocsStore.subscribeToAll());
  } catch (e) {
    console.log(e);
  }

  const addSweet = async () => {
    const { name, price, count } = toAdd;
    await http.startExecuteMyMutation(
      OperationDocsStore.addOne(name, price, count),
    );
  };

  const deleteSweet = () => {
    const { name } = toDelete;
    if (name) {
      http.startExecuteMyMutation(OperationDocsStore.deleteByName(name));
    }
  };
</script>

<main>
  {#if $requestCounter}
    <img src="./spinner.gif" alt="spinner" />
  {:else if $isOffline}
    <h1>You are offline</h1>
  {:else if $sweets.loading}
    <h1>Loading...</h1>
  {:else if $sweets.error}
    <h1>{$sweets.error}</h1>
  {:else}
    <div>
      <input placeholder="Name" bind:value={toAdd.name} />
      <input placeholder="Price" bind:value={toAdd.price} />
      <input placeholder="Count" bind:value={toAdd.count} />

      <button on:click={addSweet}>Add new sweet</button>
    </div>
    <div>
      <input placeholder="Name" bind:value={toDelete.name} />
      <button on:click={deleteSweet}>Delete sweet</button>
    </div>
    <p class="error">{$errorMessage}</p>
    {#each $sweets.data.laba3_sweets as sweet}
      <div class="sweetItem">
        <p>Name: {sweet.name}</p>
        <p>Price: {sweet.price}</p>
        <p>Count: {sweet.count}</p>
      </div>
    {/each}
  {/if}
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
  .sweetItem {
    border: 1px solid #000;
    margin: 10px;
    padding: 10px;
  }
  .error {
    color: #ff0000;
  }
</style>
