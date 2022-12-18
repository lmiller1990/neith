import fetch from "node-fetch";

const registry = "https://registry.npmjs.org";

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

async function fetchLatestVersion(mod: string) {
  const json = await fetchJson(`${registry}/${mod}`);

  // console.log(Object.keys(json))
  // console.log(json);
}

fetchLatestVersion("@vue/test-utils");
