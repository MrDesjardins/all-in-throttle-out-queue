/* eslint-disable @typescript-eslint/no-empty-function */
import { AllInThrottledOutQueue } from "./queue";
jest.useFakeTimers();
jest.spyOn(global, "setTimeout");
describe(AllInThrottledOutQueue.name, () => {
  let aitoq: AllInThrottledOutQueue<number>;
  let mockCallback: jest.Mock;
  beforeEach(() => {
    mockCallback = jest.fn();
    aitoq = new AllInThrottledOutQueue(mockCallback, 1000);
  });
  describe("Default Values", () => {
    it("has a delay set", () => {
      const queue = new AllInThrottledOutQueue(() => {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((queue as any).delayMillisecond).toBe(1000);
    });
    it("has an empty queue", () => {
      const queue = new AllInThrottledOutQueue(() => {});
      expect(queue.length).toBe(0);
    });
  });
  describe("Add one item does not execute right away the output method", () => {
    it("Accumulates and Flush after delay", () => {
      aitoq.add(1);
      jest.advanceTimersByTime(500);
      expect(aitoq.length).toBe(1);
      jest.advanceTimersByTime(600);
      expect(aitoq.length).toBe(0);
    });
  });
  describe("Add severals item does not execute right away the output method", () => {
    describe("Time elapsed", () => {
      it("Accumulates and Flush after delay", () => {
        aitoq.add(1);
        aitoq.add(2);
        aitoq.add(3);
        jest.advanceTimersByTime(500);
        expect(aitoq.length).toBe(3);
        jest.advanceTimersByTime(600);
        expect(aitoq.length).toBe(0);
      });
    });

    describe("Time elapsed", () => {
      it("calls once the timer is over", () => {
        aitoq.add(1);
        aitoq.add(2);
        aitoq.add(3);
        jest.advanceTimersByTime(1100);
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("When time elapse over the threshold", () => {
    describe("The timer", () => {
      it("does not start", () => {
        aitoq.add(1);
        aitoq.add(2);
        aitoq.add(3);
        jest.advanceTimersByTime(1100);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(2000);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(3000);
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });
    describe("The timer", () => {
      it("starts when the add function is called", () => {
        aitoq.add(1);
        aitoq.add(2);
        aitoq.add(3);
        jest.advanceTimersByTime(1100);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(2000);
        aitoq.add(1);
        jest.advanceTimersByTime(2000);
        expect(mockCallback).toHaveBeenCalledTimes(2);
      });
    });
  });
  describe("The queue contains all element since last call", () => {
    let dataFromCallback: number[] = [];
    let aitoqWithCallback: AllInThrottledOutQueue<number>;
    const callBackForNumbers = (data: number[]) => {
      dataFromCallback = data;
    };
    beforeEach(() => {
      aitoqWithCallback = new AllInThrottledOutQueue<number>(callBackForNumbers, 1000);
    });
    it("has the last elements", () => {
      aitoqWithCallback.add(1);
      aitoqWithCallback.add(2);
      aitoqWithCallback.add(3);
      jest.advanceTimersByTime(1100);
      expect(dataFromCallback.length).toBe(3);
    });
    it("has not the previous batch", () => {
      aitoqWithCallback.add(1);
      aitoqWithCallback.add(2);
      aitoqWithCallback.add(3);
      jest.advanceTimersByTime(1100);
      aitoqWithCallback.add(4);
      aitoqWithCallback.add(5);
      jest.advanceTimersByTime(1100);
      expect(dataFromCallback.length).toBe(2);
    });
  });

  describe("manual flush", () => {
    let dataFromCallback: number[] = [];
    let aitoqWithCallback: AllInThrottledOutQueue<number>;
    const callBackForNumbers = (data: number[]) => {
      dataFromCallback = data;
    };
    beforeEach(() => {
      aitoqWithCallback = new AllInThrottledOutQueue<number>(callBackForNumbers, 1000);
    });
    it("calls right aware the function with the content of the queue", () => {
      aitoqWithCallback.add(1);
      aitoqWithCallback.flush();
      expect(dataFromCallback.length).toBe(1);
    });

    it("clears all content of the queue", () => {
      aitoqWithCallback.add(1);
      aitoqWithCallback.flush();
      expect(aitoqWithCallback.length).toBe(0);
    });
  });
});
