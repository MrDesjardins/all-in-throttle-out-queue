/**
 * # Goal
 * Adds value and wait a specific time before consuming the content of the accumulated values from the queue.
 *
 * # Usage
 * ```
 * const aitoq = new AllInThrottledOutQueue<number>((batch:number[])=>{
 *    console.log("Here is the list of number from the last 1000 seconds", batch);
 * }, 1000);
 * aitoq.add(1);
 * aitoq.add(2);
 * ```
 * # Use Cases
 * ## Network Calls
 * Add multiple data in the queue, then after some times take a batch of data to send to a network call
 *
 * ## User Interface
 * For user movements/actions to send 1 payload instead of multiple to avoid traffic and lags but still capturing
 * every piece of data
 *
 * # Details
 * 1- The queue does not keep a timer always open. If there is no call to add data into the queue, once pushed out
 * the queue does not start a timer until the next data is coming in.
 */
export class AllInThrottledOutQueue<TQueueDataType> {
  /**
   * Default delay before outputing the batch of data
   **/
  public static DEFAULT_DELAY_TO_OUTPUT: number = 1000;

  /**
   * The queue of T that is added on call, and removed when the method is invoked
   */
  private queue: TQueueDataType[] = [];

  /**
   * Number of millisecond to wait before invoking the method to batch out the data
   */
  private delayMillisecond: number = AllInThrottledOutQueue.DEFAULT_DELAY_TO_OUTPUT;

  /**
   * Method to call when the timer is ready to send all the payload
   */
  private batchMethod: (queueData: TQueueDataType[]) => void;

  /**
   * Timer instance
   */
  private timerId: number | undefined | NodeJS.Timer = undefined;

  /**
   * Create a new DelayedQueue that has a method to be called when the timer is ready.
   * @param {Method} method - Method to be called with the queued payload
   * @param {number} delayMillisecond - Delay before calling the method.
   */
  public constructor(
    method: (queueData: TQueueDataType[]) => void,
    delayMillisecond: number = AllInThrottledOutQueue.DEFAULT_DELAY_TO_OUTPUT
  ) {
    this.delayMillisecond = delayMillisecond;
    this.batchMethod = method;
  }

  /**
   * Add a payload in the queue to be executed by the method
   * @param {TQueueDataType} payloadToQueue - Payload to add in the queue
   */
  public add(payloadToQueue: TQueueDataType): void {
    this.queue.push(payloadToQueue);
    this.startTimer();
  }

  /**
   * Flush the queue content manually. Shouldn't be used in most case since the idea
   * is to rely on the time set in the constructor to receive the data periodically.
   */
  public flush(): void {
    this.execute();
  }

  public get length(): number {
    return this.queue.length;
  }

  /**
   * Empty the queue, stop the timer.
   */
  private clearTimer(): void {
    this.queue = [];
    clearTimeout(this.timerId);
    this.timerId = undefined;
  }

  /**
   * Start a timer if this one doesn't exist. This is done when adding element in the queue
   * if a timer didn't started yet
   */
  private startTimer(): void {
    if (this.timerId === undefined) {
      //Time does not exist, we create a new one as well as taking the exact time we create this one to manually
      //trigger after the x millisecond threshold if the timer cannot be trigged. Use setInterval to ensure a forced
      //calls after x ms. setTimeout was adding the time to the executed method.
      this.timerId = setTimeout(() => {
        this.execute();
      }, this.delayMillisecond);
    }
  }

  /**
   * Reset the timer and execute the method. The queue of payload is reduced and passed to the method.
   */
  private execute(): void {
    const copy = this.queue.slice();
    this.clearTimer(); //Before the method to be sure that we are starting the timer as soon as possible without being dependend of the time of the method to execute
    this.batchMethod(copy);
  }
}
