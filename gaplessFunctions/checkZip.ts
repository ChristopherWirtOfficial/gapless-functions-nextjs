import gapless from "../lib/gapless/gapless";

const masterZipList = ['91601', '46205', '46906'];


// Other than the annoying little "checkZip" string you have to pass in, this is a beautiful, elegant, and tiny wrapper around a function that can be run in gapless mode.
// If you run it from the client, it actually executes the function on the backend, and then the client version of the code returns a promise that,
//    through the magic of gapless mode and the agnostic nature of promises, will eventually resolve to the result of the function.
const checkZip = gapless('checkZip', async (zip: string, userID: number) => {
  console.log('Talkin\' \'bout the zip', zip, userID);
  return masterZipList.includes(zip);
});

export default checkZip;
