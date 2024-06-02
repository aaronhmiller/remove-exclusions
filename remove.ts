import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

async function getExclusions(
  excluder: string,
  authKey: string,
): Promise<undefined> {
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
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: graphql,
    redirect: "follow",
  };

  const queryResponse = await fetch(
    "https://api.cloud.ox.security/api/apollo-gateway",
    requestOptions,
  );
  const parsedResponse = await queryResponse.json();
  return parsedResponse;
}

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
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: graphql,
    redirect: "follow",
  };

  const queryResponse = await fetch(
    "https://api.cloud.ox.security/api/apollo-gateway",
    requestOptions,
  );
  const parsedResponse = await queryResponse.json();
  return parsedResponse;
}

const env = await load();
const authKey = env["OX_API_KEY"];
const excluder = "test@ox.security";
const parsedResponse = await getExclusions(excluder, authKey);
const exclusionsArray = parsedResponse.data.getExclusions.exclusions;

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
