<script>
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";
  import { requestCounter, isOffline, errorMessage } from "./store";

  const toAdd = {};
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
    errorMessage.set(e.message);
    console.log(e);
  }

  const addSweet = async () => {
    const { name, price, count } = toAdd;
    try {
      await http.startExecuteMyMutation(
        OperationDocsStore.addOne(name, price, count),
      );
    } catch (e) {
      errorMessage.set("An error occured. Sorry");
    }
  };

  const deleteSweet = async (id) => {
    try {
      await http.startExecuteMyMutation(OperationDocsStore.deleteById(id));
    } catch (e) {
      errorMessage.set("An error occured. Sorry");
    }
  };
</script>

<main>
  {#if $isOffline}
    <h1>You are offline</h1>
  {:else if $sweets.loading || $requestCounter}
    <h1>Loading...</h1>
  {:else if $sweets.error || $errorMessage}
    <h1>{$sweets.error || $errorMessage}</h1>
  {:else}
    <div>
      <input placeholder="Name" bind:value={toAdd.name} />
      <input placeholder="Price" bind:value={toAdd.price} />
      <input placeholder="Count" bind:value={toAdd.count} />
      <button on:click={addSweet}>Add new sweet</button>
    </div>
    <p class="error">{$errorMessage}</p>
    {#if $sweets?.data?.laba3_sweets?.length}
      {#each $sweets.data.laba3_sweets as sweet (sweet.id)}
        <div class="sweetItem">
          <p>Name: {sweet.name}</p>
          <p>Price: {sweet.price}</p>
          <p>Count: {sweet.count}</p>
          <button on:click={() => deleteSweet(sweet.id)}>Delete sweet</button>
        </div>
      {/each}
    {:else}
      <h1>Nothing to show</h1>
    {/if}
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
