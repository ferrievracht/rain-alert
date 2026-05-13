import { runRainCheckCycle } from "@/lib/scheduler/rainCheckWorker";

runRainCheckCycle()
  .then((results) => {
    console.log(JSON.stringify({ checked: results.length, results }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
