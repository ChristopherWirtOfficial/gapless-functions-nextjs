import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Data } from "./api/blobag";

import checkZip from "../gaplessFunctions/checkZip";

const whoCares = async () => {
  const val = await checkZip('46205', 87280);
};

const fetchData = (zip: string, user=87280) => async () => {
  try {
    const validZip = await checkZip(zip, user);
    console.log('validZip', validZip);
  }
  catch (e) {
    console.log(e, 'error');
  }
};

const TestBlobagTs: NextPage = () => {
  const [blobag, setBlobag] = useState<Data | null>(null);

  useEffect(() => {
    fetchData('46205')();
  }, []);

  return (
    <div>
      <h1>Test Blobag TS</h1>
      <button onClick={fetchData('46205')}>Fetch Data</button>
      <p>
        {blobag?.message}
      </p>
    </div>
  );
};

export default TestBlobagTs;
