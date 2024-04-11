import { parse } from 'svelte-ux';

import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    dailyTemperature: await fetch('/data/examples/date/daily-temperature.json').then(async (r) =>
      parse(await r.text())
    ),
    meta: {
      pageSource,
    },
  };
}
