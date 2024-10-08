import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

async function getExclusions(
  excluder: string,
  authKey: string,
): Promise<GetExclusionsResponse> {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", authKey);
  myHeaders.append("Content-Type", "application/json");

  const graphql = JSON.stringify({
    query: "query GetExclusions($getExclusionsInput: GetExclusionsInput) { \
      getExclusions(getExclusionsInput: $getExclusionsInput) { \
      exclusions { \
        exclusionId \
      } \
      totalFilteredExclusions \
    } \
   }",
    variables: {
      "getExclusionsInput": {
        "filters": { "modifiedBy": [excluder] },
        "offset": 0,
        "limit": 50,
      },
    },
  });
  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: graphql,
    redirect: "follow" as RequestRedirect,
  };

  const queryResponse = await fetch(
    "https://api.cloud.ox.security/api/apollo-gateway",
    requestOptions,
  );
  const parsedResponse = await queryResponse.json();
  return parsedResponse as GetExclusionsResponse;
}

// Do the actual deletion here
async function deleteExclusion(
  exclusionId: string,
  authKey: string,
): Promise<undefined> {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", authKey);
  myHeaders.append("Content-Type", "application/json");
  const graphql = JSON.stringify({
    query: "mutation RemoveAlertExclusion($exclusionId: String!) {  \
      removeAlertExclusion(exclusionId: $exclusionId) {    \
        id  \
      } \
    }",
    variables: { "exclusionId": exclusionId },
  });
  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: graphql,
    redirect: "follow" as RequestRedirect,
  };

  const queryResponse = await fetch(
    "https://api.cloud.ox.security/api/apollo-gateway",
    requestOptions,
  );
  const parsedResponse = await queryResponse.json();
  return parsedResponse;
}

type GetExclusionsResponse = {
  data: {
    getExclusions: {
      exclusions: Exclusion[];
    };
  };
};

type Exclusion = {
  exclusionId: string;
  fileName: string;
  realMatch: string;
  aggId: string;
};

const env = await load();
const authKey = env["OX_API_KEY"];

let excluder = "";
if (Deno.args.length !== 0) {
  excluder = Deno.args[0];
} else {
  const initExcluder = prompt("Please enter the user id:");
  excluder = initExcluder !== null ? initExcluder : ""; //nulls are ugh!
}

console.log("Deleting exclusions created by:", excluder);

let exclusionsArray: Exclusion[] = [];
const parsedResponse: GetExclusionsResponse = await getExclusions(
  excluder,
  authKey,
);
// Ensure parsedResponse and its nested properties are defined
if (
  parsedResponse && parsedResponse.data && parsedResponse.data.getExclusions
) {
  exclusionsArray = parsedResponse.data.getExclusions.exclusions;
} else {
  console.error("parsedResponse or its properties are undefined");
}

const parsedStringArray = [];
for (let i = 0; i < exclusionsArray.length; i++) {
  const exclusionResult = await deleteExclusion(
    exclusionsArray[i].exclusionId,
    authKey,
  );
  const resultString = await JSON.stringify(exclusionResult);
  parsedStringArray.push(await JSON.parse(resultString)); //.parse undoes overescaping caused by .stringify
}
console.log(parsedStringArray);
