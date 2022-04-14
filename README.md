Yo have you ever been writing server code and you were like "Man this is all in Javascript anyway,
why can't I just execute these functions on the client and have it execute on the server, but give me the return value in a promise
exactly like normal?

Well, that mess of a run-on sentence is what this small library hopes to allow you to do.

## Example

You've got a server functionality, `checkZip`, which is a very easy call that you want to make sure happens on the server.
The call needs to refer to a huge list of zip codes, so  you can't ship it to the client.

```javascript
export const checkZip = gapless('checkZip', zip => {
  return hugeListOfzips?.includes(zip);
});
```

That's it. Place that code anywhere in your NextJS project and use it in client code. That's all you have to do.
```javascript
import { checkZip } from '../lib';

// A frontend component
const ZipChecker = () => {
  ...JSX

  const handleSubmit = async () => {
    const validZip = await checkZip(zipcode);
  };
  ...
};
```

Exactly like absolutely normal React code. It's beautiful.


## How does it work?
When the `gapless` function runs on your desired code, it registers it with the server, and returns a functor.
If that functor was run on the server, not much of interest would happen, it would just call the function you expect, really.
If that returned functor is run in client code, then we set up a WebSocket connection and inform the server that we want to run
a function call. The server then runs it, and sends a result message back to the client over the socket.

Meanwhile, the actual return from running that functor gave you a promise. That promise will be resolved by the websocket
handlers, which can resolve it with the value the server eventually gets back to you with.
