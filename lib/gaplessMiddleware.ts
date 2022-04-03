import { NextFetchEvent, NextRequest } from "next/server";

export default (req: NextRequest, ev: NextFetchEvent) => {
  return new Response("Just kill me lmao this is the whole middleware, which means it's everything");
};
