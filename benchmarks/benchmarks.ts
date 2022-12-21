import Benchmark from "benchmark";
import { AllInThrottledOutQueue } from "../src/index";
const suite = new Benchmark.Suite({
  maxTime: 1,
});
const sleep = (ms = 500) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const queue = new AllInThrottledOutQueue((data) => {
  // console.log(`Flushed ${data.length} elements`);
}, 100);

// add tests
suite
  .add("addMessageIntoBuffer Small Message", {
    defer: true,
    fn: async function (deferred: any) {
      queue.add(1);
      await sleep(10);
      deferred.resolve();
    },
  })

  // add listeners
  .on("cycle", function (event: any) {
    console.log(String(event.target));
  })
  .on("complete", (event: any) => {
    /*     const suite = event.currentTarget;
    const fastestOption = suite.filter("fastest").map("name");

    console.log(`The fastest option is ${fastestOption}`); */
  })
  .on("error", (event: any) => {
    console.log("Error");
    console.log(event);
  })
  .run();
