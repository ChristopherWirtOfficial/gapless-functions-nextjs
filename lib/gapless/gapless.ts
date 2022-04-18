/*
 Gapless - https://github.com/ChristopherWirtOfficial/gapless-functions-nextjs

 Something I've been noodling with in my free-time and figured I could use/show-off here.
*/

import { useMemo, useState } from 'react';
import { Socket } from 'socket.io';
import uuid from '../uuid';
import initClientSockets, { callRemoteFunction, clientIO } from './clientSockets';
import initServer, { GaplessCallbackSignature, SendResultFunction } from './serverSockets';

// NOTE: Anything that's actually _IN THE IMPORTED FILE_ won't be treeshaken or anything like that, it's coming along for the ride.
// that's almost certainly fine in general, since the function definitions need to come along anyway, but stuff like a HUGE JSON block
// inline in the code is a problem, and defeats the purpose of the abstraction.

export interface GaplessFunctionInfo {
  gaplessKey: string;
  executionID: string;
}

export type GaplessFunctionResult<T> = GaplessFunctionInfo & {
  result: T;
};

export type GaplessFunctionRequest = GaplessFunctionInfo & {
  args: any[]; // TODO: any[], can we do better?
};

export type GaplessFunctionError = GaplessFunctionInfo & {
  error: Error;
}


// The way you actually expose this is probably the most important part.
const IS_SERVER = typeof window === 'undefined';
const IS_CLIENT = !IS_SERVER;

const gaplessFunctions = new Map<string, (...args: any[]) => Promise<any>>();

if (IS_SERVER) {
  // Idk if we can improve this `any`, since we have to set this up independently of the gapless functions being registered
  const gaplessCb: GaplessCallbackSignature<any> = (sendResult) => async functionRequest => {
    const { gaplessKey, executionID, args } = functionRequest;
    const func = gaplessFunctions.get(gaplessKey);

    if (!func) {
      throw new Error(`No function with key ${gaplessKey}`);
    }
    console.log('emiiting', gaplessKey, executionID, args);
    const result = await func(...args);
    await sendResult({
      gaplessKey,
      executionID,
      result,
    });
  };

  initServer(gaplessCb);
}

if (IS_CLIENT) {
  initClientSockets();
}

// As long as every bit of client-server communication info is "computed" or provided deterministically,
//   then the client and server don't have to agree on anything before getting started. This is the real key here.
const gapless = <ArgType extends unknown[], ReturnType>(gaplessKey: string, functor: (...args: ArgType) => ReturnType): (...args: ArgType) => Promise<ReturnType> => {
  if (IS_CLIENT) {

    // From the client's perspective, this is the actual checkZip function that they're calling.
    // It returns a promise that should resolve into the result of the functor on the server.
    return async (...args: ArgType) => {
      const executionID = uuid();

      // The client will send a message to the server, and the server will respond by running the functor for the gaplessKey
      // and sending the result back to the client with a socketIO message.
      callRemoteFunction({
        gaplessKey,
        executionID,
        args,
      });

      return new Promise<ReturnType>((resolve, reject) => {
        // Create a function reference that, when called, 
        const checkResultsUntilFindingOurs = (result: GaplessFunctionResult<ReturnType>) => {
          if (result.gaplessKey === gaplessKey && result.executionID === executionID) {
            // We found our result, so resolve the promise with it
            resolve(result.result);
            clientIO.off('result', checkResultsUntilFindingOurs);
            console.log('found result', result, timeout);
            clearTimeout(timeout);
          }
        };

        // Register with the 'result' topic, and then check the results until we find ours
        // NOTE: The `checkResultsUntilFindingOurs` referece we create here is stable, and using it elsewhere in this same context
        //  is what allows us to pass the same reference to the off function when we eventually call it, way in the future.
        clientIO.on('result', checkResultsUntilFindingOurs);

        // TODO: Doesn't seem to properly get called off when the promise resolves.
        const TIMEOUT = 5000; // Sure 5 seconds, lmao why not.
        const timeout = setTimeout(() => {
          clientIO.off('result', checkResultsUntilFindingOurs);
          reject(new Error(`Timed out after ${TIMEOUT}ms`));
        }, TIMEOUT);
      });
    };
  }

  // I'll be honest, I don't feel confident explaining exactly why this gets called on the server, but it's important to know
  //   that the exact same `gapless` call MUST run on the server. I think NextJS runs it because it has to do even the most basic SSR
  //   before shipping off the page, so any imports will be resolved on the server, and then effectively resolved again on the client.
  if (IS_SERVER) {
    gaplessFunctions.set(gaplessKey, functor as any);
  };

  return async (...args: ArgType) => {
    console.error('DEFAULT FUNCTOR CALLED', args, gaplessKey);

    return new Promise<ReturnType>((resolve, reject) => {
      reject(new Error('Not implemented'));
    });
  }
};

export default gapless;

// Everything below this point should be able to be pulled out and put into its own file. But it should work the exact same without doing that.


// TODO: This name is horrible, don't stick with it...
type GaplessFunction<ArgType extends unknown[], ReturnType> = (...args: ArgType) => Promise<ReturnType> | ReturnType | void;

type GaplessProperty<ArgType> = ArgType;
type GaplessCapability = Record<string, any>;


// Apparently fuck Typescript here
const createComplexGaplessObj = (capability: GaplessCapability) => {
  const gaplessFunctions = Object.entries(capability).map(([key, fn]) => {
    const gappedFunc = gapless<any, any>(fn as any);

    return [key, gappedFunc];
  });
};


// TODO: Obviously using the ArgType extends unknown[] at all, let alone having to use it five million times, is a code smell.
//  I'm not sure how to fix this. I think I'll have to use a different type for the capability, and then use the type of the
//  capability to infer the type of the function. I'm not sure how to do that.
// const useGapless = <ArgType extends unknown[], ReturnType>(capability: GaplessCapability) => {
//   // TODO: PICKUP useGapless 
//   // Don't jump straight into the hook... Build the basic mechanism that can do the entire thing with just regular functions,
//   //  but functions that can be easily wrapped in either a hook, or be independent of needing hooks or to be reactive.
//   //    Just get the non-react version working, and then get the react version working.

  

//   return gaplessFunctions;
// };

const useBartSimpson = () => {
  const [ needsToPee, setNeedsToPee ] = useState(false);
  const [ isHungry, setIsHungry ] = useState(false);
  const [ isSick, setIsSick ] = useState(false);

  const capability: GaplessCapability = useMemo(() => ({
    eatMyShorts: () => {
      setIsHungry(!isSick);
    },
    takeALeak: () => {
      setNeedsToPee(false);
      setIsHungry(true);
    },
    takeASnack: () => {
      setIsHungry(false);
      console.log('I\'m with the flow');
    },
    isSick,
    isHungry,
    needsChanging: false,
  }), [ isSick ]);

  //const bart = useGapless(capability);
};
