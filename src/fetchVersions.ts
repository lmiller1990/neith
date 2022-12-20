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
}

fetchLatestVersion("@vue/test-utils");
