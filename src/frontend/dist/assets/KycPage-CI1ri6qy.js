import { aM as getDefaultExportFromCjs, e as useAuth, u as useNavigate, r as reactExports, D as getKycSubmission, l as jsxRuntimeExports, af as TriangleAlert, R as RefreshCw, p as ue, aN as updateKycSubmission, aO as insertKycSubmission, J as uploadFileToStorage } from "./main-Cdc0HMQw.js";
import { B as Button } from "./button-M4vBmj7v.js";
import { I as Input } from "./input-DWT-VTa6.js";
import { L as Label } from "./label-CRaRd1Yq.js";
import { a as sendNotification } from "./notify-CZ5LMHYj.js";
import { C as Camera } from "./camera-CkhMgfX8.js";
import { X, S as Shield } from "./x-DexM1Xlt.js";
import { C as CircleCheck } from "./circle-check-D32-XR9b.js";
import { E as Eye } from "./eye-8KcJCc9_.js";
import { A as ArrowRight } from "./arrow-right-DLv6W9zm.js";
import { C as Clock } from "./clock-CAz59OKZ.js";
import "./index-CY-UUOos.js";
var runtime = { exports: {} };
(function(module) {
  var runtime2 = function(exports) {
    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var defineProperty = Object.defineProperty || function(obj, key, desc) {
      obj[key] = desc.value;
    };
    var undefined$1;
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }
    try {
      define({}, "");
    } catch (err) {
      define = function(obj, key, value) {
        return obj[key] = value;
      };
    }
    function wrap(innerFn, outerFn, self, tryLocsList) {
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);
      defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });
      return generator;
    }
    exports.wrap = wrap;
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }
    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";
    var ContinueSentinel = {};
    function Generator() {
    }
    function GeneratorFunction() {
    }
    function GeneratorFunctionPrototype() {
    }
    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function() {
      return this;
    });
    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      IteratorPrototype = NativeIteratorPrototype;
    }
    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = GeneratorFunctionPrototype;
    defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
    defineProperty(
      GeneratorFunctionPrototype,
      "constructor",
      { value: GeneratorFunction, configurable: true }
    );
    GeneratorFunction.displayName = define(
      GeneratorFunctionPrototype,
      toStringTagSymbol,
      "GeneratorFunction"
    );
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
          return this._invoke(method, arg);
        });
      });
    }
    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };
    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };
    exports.awrap = function(arg) {
      return { __await: arg };
    };
    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value2) {
              invoke("next", value2, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }
          return PromiseImpl.resolve(value).then(function(unwrapped) {
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            return invoke("throw", error, resolve, reject);
          });
        }
      }
      var previousPromise;
      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
      }
      defineProperty(this, "_invoke", { value: enqueue });
    }
    defineIteratorMethods(AsyncIterator.prototype);
    define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
      return this;
    });
    exports.AsyncIterator = AsyncIterator;
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );
      return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
        return result.done ? result.value : iter.next();
      });
    };
    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;
      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }
        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }
          return doneResult();
        }
        context.method = method;
        context.arg = arg;
        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }
          if (context.method === "next") {
            context.sent = context._sent = context.arg;
          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }
            context.dispatchException(context.arg);
          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }
          state = GenStateExecuting;
          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;
            if (record.arg === ContinueSentinel) {
              continue;
            }
            return {
              value: record.arg,
              done: context.done
            };
          } else if (record.type === "throw") {
            state = GenStateCompleted;
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }
    function maybeInvokeDelegate(delegate, context) {
      var methodName = context.method;
      var method = delegate.iterator[methodName];
      if (method === undefined$1) {
        context.delegate = null;
        if (methodName === "throw" && delegate.iterator["return"]) {
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);
          if (context.method === "throw") {
            return ContinueSentinel;
          }
        }
        if (methodName !== "return") {
          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a '" + methodName + "' method"
          );
        }
        return ContinueSentinel;
      }
      var record = tryCatch(method, delegate.iterator, context.arg);
      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }
      var info = record.arg;
      if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }
      if (info.done) {
        context[delegate.resultName] = info.value;
        context.next = delegate.nextLoc;
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }
      } else {
        return info;
      }
      context.delegate = null;
      return ContinueSentinel;
    }
    defineIteratorMethods(Gp);
    define(Gp, toStringTagSymbol, "Generator");
    define(Gp, iteratorSymbol, function() {
      return this;
    });
    define(Gp, "toString", function() {
      return "[object Generator]";
    });
    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };
      if (1 in locs) {
        entry.catchLoc = locs[1];
      }
      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }
      this.tryEntries.push(entry);
    }
    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }
    function Context(tryLocsList) {
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }
    exports.keys = function(val) {
      var object = Object(val);
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();
      return function next() {
        while (keys.length) {
          var key2 = keys.pop();
          if (key2 in object) {
            next.value = key2;
            next.done = false;
            return next;
          }
        }
        next.done = true;
        return next;
      };
    };
    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }
        if (typeof iterable.next === "function") {
          return iterable;
        }
        if (!isNaN(iterable.length)) {
          var i = -1, next = function next2() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next2.value = iterable[i];
                next2.done = false;
                return next2;
              }
            }
            next2.value = undefined$1;
            next2.done = true;
            return next2;
          };
          return next.next = next;
        }
      }
      return { next: doneResult };
    }
    exports.values = values;
    function doneResult() {
      return { value: undefined$1, done: true };
    }
    Context.prototype = {
      constructor: Context,
      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = undefined$1;
        this.tryEntries.forEach(resetTryEntry);
        if (!skipTempReset) {
          for (var name in this) {
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },
      stop: function() {
        this.done = true;
        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }
        return this.rval;
      },
      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }
        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;
          if (caught) {
            context.method = "next";
            context.arg = undefined$1;
          }
          return !!caught;
        }
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;
          if (entry.tryLoc === "root") {
            return handle("end");
          }
          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");
            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },
      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }
        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          finallyEntry = null;
        }
        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;
        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }
        return this.complete(record);
      },
      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }
        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }
        return ContinueSentinel;
      },
      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },
      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName,
          nextLoc
        };
        if (this.method === "next") {
          this.arg = undefined$1;
        }
        return ContinueSentinel;
      }
    };
    return exports;
  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports
  );
  try {
    regeneratorRuntime = runtime2;
  } catch (accidentalStrictMode) {
    if (typeof globalThis === "object") {
      globalThis.regeneratorRuntime = runtime2;
    } else {
      Function("r", "regeneratorRuntime = r")(runtime2);
    }
  }
})(runtime);
var getId$3 = (prefix, cnt) => `${prefix}-${cnt}-${Math.random().toString(16).slice(3, 8)}`;
const getId$2 = getId$3;
let jobCounter = 0;
var createJob$2 = ({
  id: _id,
  action,
  payload = {}
}) => {
  let id = _id;
  if (typeof id === "undefined") {
    id = getId$2("Job", jobCounter);
    jobCounter += 1;
  }
  return {
    id,
    action,
    payload
  };
};
var log$2 = {};
let logging = false;
log$2.logging = logging;
log$2.setLogging = (_logging) => {
  logging = _logging;
};
log$2.log = (...args) => logging ? console.log.apply(void 0, args) : null;
const createJob$1 = createJob$2;
const { log: log$1 } = log$2;
const getId$1 = getId$3;
let schedulerCounter = 0;
var createScheduler$1 = () => {
  const id = getId$1("Scheduler", schedulerCounter);
  const workers = {};
  const runningWorkers = {};
  let jobQueue = [];
  schedulerCounter += 1;
  const getQueueLen = () => jobQueue.length;
  const getNumWorkers = () => Object.keys(workers).length;
  const dequeue = () => {
    if (jobQueue.length !== 0) {
      const wIds = Object.keys(workers);
      for (let i = 0; i < wIds.length; i += 1) {
        if (typeof runningWorkers[wIds[i]] === "undefined") {
          jobQueue[0](workers[wIds[i]]);
          break;
        }
      }
    }
  };
  const queue = (action, payload) => new Promise((resolve, reject) => {
    const job = createJob$1({ action, payload });
    jobQueue.push(async (w) => {
      jobQueue.shift();
      runningWorkers[w.id] = job;
      try {
        resolve(await w[action].apply(void 0, [...payload, job.id]));
      } catch (err) {
        reject(err);
      } finally {
        delete runningWorkers[w.id];
        dequeue();
      }
    });
    log$1(`[${id}]: Add ${job.id} to JobQueue`);
    log$1(`[${id}]: JobQueue length=${jobQueue.length}`);
    dequeue();
  });
  const addWorker = (w) => {
    workers[w.id] = w;
    log$1(`[${id}]: Add ${w.id}`);
    log$1(`[${id}]: Number of workers=${getNumWorkers()}`);
    dequeue();
    return w.id;
  };
  const addJob = async (action, ...payload) => {
    if (getNumWorkers() === 0) {
      throw Error(`[${id}]: You need to have at least one worker before adding jobs`);
    }
    return queue(action, payload);
  };
  const terminate = async () => {
    Object.keys(workers).forEach(async (wid) => {
      await workers[wid].terminate();
    });
    jobQueue = [];
  };
  return {
    addWorker,
    addJob,
    terminate,
    getQueueLen,
    getNumWorkers
  };
};
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
function isElectron$1() {
  if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
    return true;
  }
  if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
    return true;
  }
  if (typeof navigator === "object" && typeof navigator.userAgent === "string" && navigator.userAgent.indexOf("Electron") >= 0) {
    return true;
  }
  return false;
}
var isElectron_1 = isElectron$1;
const isElectron = isElectron_1;
var getEnvironment = (key) => {
  const env = {};
  if (typeof WorkerGlobalScope !== "undefined") {
    env.type = "webworker";
  } else if (isElectron()) {
    env.type = "electron";
  } else if (typeof document === "object") {
    env.type = "browser";
  } else if (typeof process === "object" && typeof commonjsRequire === "function") {
    env.type = "node";
  }
  if (typeof key === "undefined") {
    return env;
  }
  return env[key];
};
const isBrowser = getEnvironment("type") === "browser";
const resolveURL = isBrowser ? (s) => new URL(s, window.location.href).href : (s) => s;
var resolvePaths$1 = (options) => {
  const opts = { ...options };
  ["corePath", "workerPath", "langPath"].forEach((key) => {
    if (options[key]) {
      opts[key] = resolveURL(opts[key]);
    }
  });
  return opts;
};
var circularize$1 = (page) => {
  const blocks = [];
  const paragraphs = [];
  const lines = [];
  const words = [];
  const symbols = [];
  if (page.blocks) {
    page.blocks.forEach((block) => {
      block.paragraphs.forEach((paragraph) => {
        paragraph.lines.forEach((line) => {
          line.words.forEach((word) => {
            word.symbols.forEach((sym) => {
              symbols.push({
                ...sym,
                page,
                block,
                paragraph,
                line,
                word
              });
            });
            words.push({
              ...word,
              page,
              block,
              paragraph,
              line
            });
          });
          lines.push({
            ...line,
            page,
            block,
            paragraph
          });
        });
        paragraphs.push({
          ...paragraph,
          page,
          block
        });
      });
      blocks.push({
        ...block,
        page
      });
    });
  }
  return {
    ...page,
    blocks,
    paragraphs,
    lines,
    words,
    symbols
  };
};
var OEM$2 = {
  TESSERACT_ONLY: 0,
  LSTM_ONLY: 1,
  TESSERACT_LSTM_COMBINED: 2,
  DEFAULT: 3
};
const version$1 = "5.1.1";
const require$$0 = {
  version: version$1
};
var defaultOptions$3 = {
  /*
   * Use BlobURL for worker script by default
   * TODO: remove this option
   *
   */
  workerBlobURL: true,
  logger: () => {
  }
};
const version = require$$0.version;
const defaultOptions$2 = defaultOptions$3;
var defaultOptions_1 = {
  ...defaultOptions$2,
  workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@v${version}/dist/worker.min.js`
};
var spawnWorker$2 = ({ workerPath, workerBlobURL }) => {
  let worker;
  if (Blob && URL && workerBlobURL) {
    const blob = new Blob([`importScripts("${workerPath}");`], {
      type: "application/javascript"
    });
    worker = new Worker(URL.createObjectURL(blob));
  } else {
    worker = new Worker(workerPath);
  }
  return worker;
};
var terminateWorker$2 = (worker) => {
  worker.terminate();
};
var onMessage$2 = (worker, handler) => {
  worker.onmessage = ({ data }) => {
    handler(data);
  };
};
var send$2 = async (worker, packet) => {
  worker.postMessage(packet);
};
const readFromBlobOrFile = (blob) => new Promise((resolve, reject) => {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    resolve(fileReader.result);
  };
  fileReader.onerror = ({ target: { error: { code } } }) => {
    reject(Error(`File could not be read! Code=${code}`));
  };
  fileReader.readAsArrayBuffer(blob);
});
const loadImage$2 = async (image) => {
  let data = image;
  if (typeof image === "undefined") {
    return "undefined";
  }
  if (typeof image === "string") {
    if (/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(image)) {
      data = atob(image.split(",")[1]).split("").map((c) => c.charCodeAt(0));
    } else {
      const resp = await fetch(image);
      data = await resp.arrayBuffer();
    }
  } else if (typeof HTMLElement !== "undefined" && image instanceof HTMLElement) {
    if (image.tagName === "IMG") {
      data = await loadImage$2(image.src);
    }
    if (image.tagName === "VIDEO") {
      data = await loadImage$2(image.poster);
    }
    if (image.tagName === "CANVAS") {
      await new Promise((resolve) => {
        image.toBlob(async (blob) => {
          data = await readFromBlobOrFile(blob);
          resolve();
        });
      });
    }
  } else if (typeof OffscreenCanvas !== "undefined" && image instanceof OffscreenCanvas) {
    const blob = await image.convertToBlob();
    data = await readFromBlobOrFile(blob);
  } else if (image instanceof File || image instanceof Blob) {
    data = await readFromBlobOrFile(image);
  }
  return new Uint8Array(data);
};
var loadImage_1 = loadImage$2;
const defaultOptions$1 = defaultOptions_1;
const spawnWorker$1 = spawnWorker$2;
const terminateWorker$1 = terminateWorker$2;
const onMessage$1 = onMessage$2;
const send$1 = send$2;
const loadImage$1 = loadImage_1;
var browser = {
  defaultOptions: defaultOptions$1,
  spawnWorker: spawnWorker$1,
  terminateWorker: terminateWorker$1,
  onMessage: onMessage$1,
  send: send$1,
  loadImage: loadImage$1
};
const resolvePaths = resolvePaths$1;
const circularize = circularize$1;
const createJob = createJob$2;
const { log } = log$2;
const getId = getId$3;
const OEM$1 = OEM$2;
const {
  defaultOptions,
  spawnWorker,
  terminateWorker,
  onMessage,
  loadImage,
  send
} = browser;
let workerCounter = 0;
var createWorker$2 = async (langs = "eng", oem = OEM$1.LSTM_ONLY, _options = {}, config = {}) => {
  const id = getId("Worker", workerCounter);
  const {
    logger,
    errorHandler,
    ...options
  } = resolvePaths({
    ...defaultOptions,
    ..._options
  });
  const resolves = {};
  const rejects = {};
  const currentLangs = typeof langs === "string" ? langs.split("+") : langs;
  let currentOem = oem;
  let currentConfig = config;
  const lstmOnlyCore = [OEM$1.DEFAULT, OEM$1.LSTM_ONLY].includes(oem) && !options.legacyCore;
  let workerResReject;
  let workerResResolve;
  const workerRes = new Promise((resolve, reject) => {
    workerResResolve = resolve;
    workerResReject = reject;
  });
  const workerError = (event) => {
    workerResReject(event.message);
  };
  let worker = spawnWorker(options);
  worker.onerror = workerError;
  workerCounter += 1;
  const setResolve = (promiseId, res) => {
    resolves[promiseId] = res;
  };
  const setReject = (promiseId, rej) => {
    rejects[promiseId] = rej;
  };
  const startJob = ({ id: jobId, action, payload }) => new Promise((resolve, reject) => {
    log(`[${id}]: Start ${jobId}, action=${action}`);
    const promiseId = `${action}-${jobId}`;
    setResolve(promiseId, resolve);
    setReject(promiseId, reject);
    send(worker, {
      workerId: id,
      jobId,
      action,
      payload
    });
  });
  const load = () => console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)");
  const loadInternal = (jobId) => startJob(createJob({
    id: jobId,
    action: "load",
    payload: { options: { lstmOnly: lstmOnlyCore, corePath: options.corePath, logging: options.logging } }
  }));
  const writeText = (path, text, jobId) => startJob(createJob({
    id: jobId,
    action: "FS",
    payload: { method: "writeFile", args: [path, text] }
  }));
  const readText = (path, jobId) => startJob(createJob({
    id: jobId,
    action: "FS",
    payload: { method: "readFile", args: [path, { encoding: "utf8" }] }
  }));
  const removeFile = (path, jobId) => startJob(createJob({
    id: jobId,
    action: "FS",
    payload: { method: "unlink", args: [path] }
  }));
  const FS = (method, args, jobId) => startJob(createJob({
    id: jobId,
    action: "FS",
    payload: { method, args }
  }));
  const loadLanguage = () => console.warn("`loadLanguage` is depreciated and should be removed from code (workers now come with language pre-loaded)");
  const loadLanguageInternal = (_langs, jobId) => startJob(createJob({
    id: jobId,
    action: "loadLanguage",
    payload: {
      langs: _langs,
      options: {
        langPath: options.langPath,
        dataPath: options.dataPath,
        cachePath: options.cachePath,
        cacheMethod: options.cacheMethod,
        gzip: options.gzip,
        lstmOnly: [OEM$1.DEFAULT, OEM$1.LSTM_ONLY].includes(currentOem) && !options.legacyLang
      }
    }
  }));
  const initialize = () => console.warn("`initialize` is depreciated and should be removed from code (workers now come pre-initialized)");
  const initializeInternal = (_langs, _oem, _config, jobId) => startJob(createJob({
    id: jobId,
    action: "initialize",
    payload: { langs: _langs, oem: _oem, config: _config }
  }));
  const reinitialize = (langs2 = "eng", oem2, config2, jobId) => {
    if (lstmOnlyCore && [OEM$1.TESSERACT_ONLY, OEM$1.TESSERACT_LSTM_COMBINED].includes(oem2)) throw Error("Legacy model requested but code missing.");
    const _oem = oem2 || currentOem;
    currentOem = _oem;
    const _config = config2 || currentConfig;
    currentConfig = _config;
    const langsArr = typeof langs2 === "string" ? langs2.split("+") : langs2;
    const _langs = langsArr.filter((x) => !currentLangs.includes(x));
    currentLangs.push(..._langs);
    if (_langs.length > 0) {
      return loadLanguageInternal(_langs, jobId).then(() => initializeInternal(langs2, _oem, _config, jobId));
    }
    return initializeInternal(langs2, _oem, _config, jobId);
  };
  const setParameters = (params = {}, jobId) => startJob(createJob({
    id: jobId,
    action: "setParameters",
    payload: { params }
  }));
  const recognize2 = async (image, opts = {}, output = {
    blocks: true,
    text: true,
    hocr: true,
    tsv: true
  }, jobId) => startJob(createJob({
    id: jobId,
    action: "recognize",
    payload: { image: await loadImage(image), options: opts, output }
  }));
  const getPDF = (title = "Tesseract OCR Result", textonly = false, jobId) => {
    console.log("`getPDF` function is depreciated. `recognize` option `savePDF` should be used instead.");
    return startJob(createJob({
      id: jobId,
      action: "getPDF",
      payload: { title, textonly }
    }));
  };
  const detect2 = async (image, jobId) => {
    if (lstmOnlyCore) throw Error("`worker.detect` requires Legacy model, which was not loaded.");
    return startJob(createJob({
      id: jobId,
      action: "detect",
      payload: { image: await loadImage(image) }
    }));
  };
  const terminate = async () => {
    if (worker !== null) {
      terminateWorker(worker);
      worker = null;
    }
    return Promise.resolve();
  };
  onMessage(worker, ({
    workerId,
    jobId,
    status,
    action,
    data
  }) => {
    const promiseId = `${action}-${jobId}`;
    if (status === "resolve") {
      log(`[${workerId}]: Complete ${jobId}`);
      let d = data;
      if (action === "recognize") {
        d = circularize(data);
      } else if (action === "getPDF") {
        d = Array.from({ ...data, length: Object.keys(data).length });
      }
      resolves[promiseId]({ jobId, data: d });
    } else if (status === "reject") {
      rejects[promiseId](data);
      if (action === "load") workerResReject(data);
      if (errorHandler) {
        errorHandler(data);
      } else {
        throw Error(data);
      }
    } else if (status === "progress") {
      logger({ ...data, userJobId: jobId });
    }
  });
  const resolveObj = {
    id,
    worker,
    setResolve,
    setReject,
    load,
    writeText,
    readText,
    removeFile,
    FS,
    loadLanguage,
    initialize,
    reinitialize,
    setParameters,
    recognize: recognize2,
    getPDF,
    detect: detect2,
    terminate
  };
  loadInternal().then(() => loadLanguageInternal(langs)).then(() => initializeInternal(langs, oem, config)).then(() => workerResResolve(resolveObj)).catch(() => {
  });
  return workerRes;
};
const createWorker$1 = createWorker$2;
const recognize = async (image, langs, options) => {
  const worker = await createWorker$1(langs, 1, options);
  return worker.recognize(image).finally(async () => {
    await worker.terminate();
  });
};
const detect = async (image, options) => {
  const worker = await createWorker$1("osd", 0, options);
  return worker.detect(image).finally(async () => {
    await worker.terminate();
  });
};
var Tesseract$2 = {
  recognize,
  detect
};
var languages$1 = {
  AFR: "afr",
  AMH: "amh",
  ARA: "ara",
  ASM: "asm",
  AZE: "aze",
  AZE_CYRL: "aze_cyrl",
  BEL: "bel",
  BEN: "ben",
  BOD: "bod",
  BOS: "bos",
  BUL: "bul",
  CAT: "cat",
  CEB: "ceb",
  CES: "ces",
  CHI_SIM: "chi_sim",
  CHI_TRA: "chi_tra",
  CHR: "chr",
  CYM: "cym",
  DAN: "dan",
  DEU: "deu",
  DZO: "dzo",
  ELL: "ell",
  ENG: "eng",
  ENM: "enm",
  EPO: "epo",
  EST: "est",
  EUS: "eus",
  FAS: "fas",
  FIN: "fin",
  FRA: "fra",
  FRK: "frk",
  FRM: "frm",
  GLE: "gle",
  GLG: "glg",
  GRC: "grc",
  GUJ: "guj",
  HAT: "hat",
  HEB: "heb",
  HIN: "hin",
  HRV: "hrv",
  HUN: "hun",
  IKU: "iku",
  IND: "ind",
  ISL: "isl",
  ITA: "ita",
  ITA_OLD: "ita_old",
  JAV: "jav",
  JPN: "jpn",
  KAN: "kan",
  KAT: "kat",
  KAT_OLD: "kat_old",
  KAZ: "kaz",
  KHM: "khm",
  KIR: "kir",
  KOR: "kor",
  KUR: "kur",
  LAO: "lao",
  LAT: "lat",
  LAV: "lav",
  LIT: "lit",
  MAL: "mal",
  MAR: "mar",
  MKD: "mkd",
  MLT: "mlt",
  MSA: "msa",
  MYA: "mya",
  NEP: "nep",
  NLD: "nld",
  NOR: "nor",
  ORI: "ori",
  PAN: "pan",
  POL: "pol",
  POR: "por",
  PUS: "pus",
  RON: "ron",
  RUS: "rus",
  SAN: "san",
  SIN: "sin",
  SLK: "slk",
  SLV: "slv",
  SPA: "spa",
  SPA_OLD: "spa_old",
  SQI: "sqi",
  SRP: "srp",
  SRP_LATN: "srp_latn",
  SWA: "swa",
  SWE: "swe",
  SYR: "syr",
  TAM: "tam",
  TEL: "tel",
  TGK: "tgk",
  TGL: "tgl",
  THA: "tha",
  TIR: "tir",
  TUR: "tur",
  UIG: "uig",
  UKR: "ukr",
  URD: "urd",
  UZB: "uzb",
  UZB_CYRL: "uzb_cyrl",
  VIE: "vie",
  YID: "yid"
};
var PSM$1 = {
  OSD_ONLY: "0",
  AUTO_OSD: "1",
  AUTO_ONLY: "2",
  AUTO: "3",
  SINGLE_COLUMN: "4",
  SINGLE_BLOCK_VERT_TEXT: "5",
  SINGLE_BLOCK: "6",
  SINGLE_LINE: "7",
  SINGLE_WORD: "8",
  CIRCLE_WORD: "9",
  SINGLE_CHAR: "10",
  SPARSE_TEXT: "11",
  SPARSE_TEXT_OSD: "12",
  RAW_LINE: "13"
};
const createScheduler = createScheduler$1;
const createWorker = createWorker$2;
const Tesseract = Tesseract$2;
const languages = languages$1;
const OEM = OEM$2;
const PSM = PSM$1;
const { setLogging } = log$2;
var src = {
  languages,
  OEM,
  PSM,
  createScheduler,
  createWorker,
  setLogging,
  ...Tesseract
};
const Tesseract$1 = /* @__PURE__ */ getDefaultExportFromCjs(src);
function KycPage() {
  var _a, _b, _c;
  const { user } = useAuth();
  const navigate = useNavigate();
  const returnTo = (() => {
    try {
      return sessionStorage.getItem("givethra_kyc_return_to") || "/home";
    } catch {
      return "/home";
    }
  })();
  const [submission, setSubmission] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [docType, setDocType] = reactExports.useState("cnic");
  const [reapplying, setReapplying] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    full_name: "",
    date_of_birth: "",
    address: "",
    cnic_number: ""
  });
  const [cnicFront, setCnicFront] = reactExports.useState(null);
  const [cnicFrontPreview, setCnicFrontPreview] = reactExports.useState(null);
  const [cnicBack, setCnicBack] = reactExports.useState(null);
  const [cnicBackPreview, setCnicBackPreview] = reactExports.useState(null);
  const [selfie, setSelfie] = reactExports.useState(null);
  const [selfiePreview, setSelfiePreview] = reactExports.useState(null);
  const [passportFile, setPassportFile] = reactExports.useState(null);
  const [videoFile, setVideoFile] = reactExports.useState(null);
  const [videoBlob, setVideoBlob] = reactExports.useState(null);
  const [videoRecording, setVideoRecording] = reactExports.useState(false);
  const [videoTimer, setVideoTimer] = reactExports.useState(0);
  const [activeCamera, setActiveCamera] = reactExports.useState(null);
  const [ocrProcessing, setOcrProcessing] = reactExports.useState(false);
  const [ocrError, setOcrError] = reactExports.useState(null);
  const [capturedImage, setCapturedImage] = reactExports.useState(null);
  const [capturedKind, setCapturedKind] = reactExports.useState(null);
  const [capturedCanvas, setCapturedCanvas] = reactExports.useState(null);
  const [stream, setStream] = reactExports.useState(null);
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const frameRef = reactExports.useRef(null);
  const liveVideoRef = reactExports.useRef(null);
  const mediaRecorderRef = reactExports.useRef(null);
  const videoChunksRef = reactExports.useRef([]);
  reactExports.useEffect(() => {
    if (user) {
      loadSubmission();
      const interval = setInterval(loadSubmission, 3e4);
      const onFocus = () => loadSubmission();
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onFocus);
      return () => {
        clearInterval(interval);
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onFocus);
      };
    } else {
      setIsLoading(false);
    }
  }, [user]);
  reactExports.useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);
  async function loadSubmission() {
    if (!user) return;
    try {
      const data = await getKycSubmission(user.id);
      setSubmission(data ? { ...data, status: String(data.status || "none").trim().toLowerCase() } : null);
    } catch (err) {
      console.error("Failed to load KYC submission", err);
    } finally {
      setIsLoading(false);
    }
  }
  async function startPhotoCamera(target) {
    var _a2, _b2;
    try {
      setOcrError(null);
      setCapturedImage(null);
      setCapturedKind(null);
      setCapturedCanvas(null);
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: target === "selfie" ? "user" : "environment",
          advanced: [{ focusMode: "continuous" }]
        }
      });
      try {
        const [track] = s.getVideoTracks();
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if ((_b2 = (_a2 = capabilities == null ? void 0 : capabilities.focusMode) == null ? void 0 : _a2.includes) == null ? void 0 : _b2.call(_a2, "continuous")) {
          await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
        }
      } catch {
      }
      setStream(s);
      setActiveCamera(target);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch {
      ue.error("Camera access denied.");
    }
  }
  function getCropRect() {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const videoRect = video.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    if (videoRect.width === 0 || videoRect.height === 0) return null;
    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;
    const x = (frameRect.left - videoRect.left) * scaleX;
    const y = (frameRect.top - videoRect.top) * scaleY;
    const w = frameRect.width * scaleX;
    const h = frameRect.height * scaleY;
    return { x, y, w, h };
  }
  function grabFrame() {
    var _a2;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const rect = getCropRect();
    if (!video || !canvas || !rect || rect.w <= 0 || rect.h <= 0) return null;
    canvas.width = rect.w;
    canvas.height = rect.h;
    (_a2 = canvas.getContext("2d")) == null ? void 0 : _a2.drawImage(video, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    return canvas;
  }
  function captureImage() {
    setOcrError(null);
    const canvas = grabFrame();
    if (!canvas) {
      ue.error("Tasveer nahi li ja saki. Dobara koshish karein.");
      return;
    }
    const imageData = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageData);
    setCapturedCanvas(canvas);
    setCapturedKind(activeCamera);
    stream == null ? void 0 : stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setActiveCamera(null);
  }
  async function verifyCapturedImage() {
    if (!capturedCanvas || !capturedKind) {
      ue.error("Pehle tasveer capture karein.");
      return;
    }
    if (capturedKind === "front") {
      setOcrProcessing(true);
      try {
        const result = await Tesseract$1.recognize(capturedCanvas, "eng");
        const text = result.data.text || "";
        const match = text.match(/\d{5}[\s-]?\d{7}[\s-]?\d{1}/);
        const letterCount = (text.match(/[A-Za-z]/g) || []).length;
        const fullCardVisible = letterCount >= 20;
        if (match && fullCardVisible) {
          const digits = match[0].replace(/\D/g, "");
          const formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
          setOcrProcessing(false);
          setForm((p) => ({ ...p, cnic_number: formatted }));
          finalizeCapture(capturedKind, capturedCanvas);
          ue.success(`CNIC number parh liya: ${formatted}. Agar galat hai to khud durust kar lein.`);
        } else {
          setOcrProcessing(false);
          setOcrError("CNIC number saaf nahi parha gaya. CNIC ko seedha, poora aur roshni mein rakh kar dobara capture karein.");
          ue.error("CNIC number saaf nahi parha gaya. Dobara koshish karein.");
          setCapturedImage(null);
          setCapturedCanvas(null);
          setCapturedKind(null);
        }
      } catch {
        setOcrProcessing(false);
        setOcrError("OCR fail ho gaya. Dobara koshish karein.");
        ue.error("OCR fail ho gaya. Dobara koshish karein.");
        setCapturedImage(null);
        setCapturedCanvas(null);
        setCapturedKind(null);
      }
    } else {
      finalizeCapture(capturedKind, capturedCanvas);
    }
  }
  function finalizeCapture(kind, canvas) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${kind}.jpg`, { type: "image/jpeg" });
      const preview = canvas.toDataURL("image/jpeg");
      if (kind === "front") {
        setCnicFront(file);
        setCnicFrontPreview(preview);
      } else if (kind === "back") {
        setCnicBack(file);
        setCnicBackPreview(preview);
      } else {
        setSelfie(file);
        setSelfiePreview(preview);
      }
      setCapturedImage(null);
      setCapturedCanvas(null);
      setCapturedKind(null);
      setOcrError(null);
      ue.success(`${kind === "front" ? "CNIC Front" : kind === "back" ? "CNIC Back" : "Selfie"} captured successfully!`);
    }, "image/jpeg");
  }
  function cancelCaptured() {
    setCapturedImage(null);
    setCapturedCanvas(null);
    setCapturedKind(null);
    setOcrError(null);
    if (capturedKind) {
      startPhotoCamera(capturedKind);
    }
  }
  async function startVideoRecording() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48e3 }
        }
      });
      setStream(s);
      setVideoRecording(true);
      setVideoTimer(0);
      setTimeout(() => {
        if (liveVideoRef.current) liveVideoRef.current.srcObject = s;
      }, 100);
      const preferredMimeType = "video/webm;codecs=vp8,opus";
      const mimeType = typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(preferredMimeType) ? preferredMimeType : "video/webm";
      const recorder = new MediaRecorder(s, {
        mimeType,
        videoBitsPerSecond: 15e5,
        audioBitsPerSecond: 128e3
      });
      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const recordedType = recorder.mimeType || mimeType;
        const blob = new Blob(videoChunksRef.current, { type: recordedType });
        setVideoFile(new File([blob], "face.webm", { type: recordedType }));
        setVideoBlob(URL.createObjectURL(blob));
        s.getTracks().forEach((t) => t.stop());
        setVideoRecording(false);
      };
      recorder.start();
      let sec = 0;
      const interval = setInterval(() => {
        sec++;
        setVideoTimer(sec);
        if (sec >= 15) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 1e3);
    } catch {
      ue.error("Camera/mic access denied.");
    }
  }
  async function uploadFile(file, path) {
    try {
      const url = await uploadFileToStorage(file, path);
      return url;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  function startReapply() {
    if (submission) {
      setForm({
        full_name: submission.full_name || "",
        date_of_birth: submission.date_of_birth || "",
        address: submission.address || "",
        cnic_number: submission.cnic_number || ""
      });
      if (submission.document_type) {
        setDocType(submission.document_type === "passport" ? "passport" : "cnic");
      }
    }
    setCnicFront(null);
    setCnicFrontPreview(null);
    setCnicBack(null);
    setCnicBackPreview(null);
    setSelfie(null);
    setSelfiePreview(null);
    setPassportFile(null);
    setVideoFile(null);
    setVideoBlob(null);
    setReapplying(true);
  }
  function isValidCnic(cnic) {
    const cleaned = cnic.replace(/-/g, "");
    return /^\d{13}$/.test(cleaned);
  }
  async function handleSubmit() {
    if (!form.full_name) {
      ue.error("Full name is required");
      return;
    }
    if (!videoFile) {
      ue.error("Please record a 15-second face video");
      return;
    }
    if (docType === "cnic") {
      if (!form.cnic_number || !cnicFront || !cnicBack || !selfie) {
        ue.error("All CNIC fields, photos and selfie are required");
        return;
      }
      if (!isValidCnic(form.cnic_number)) {
        ue.error("CNIC number must be 13 digits (format: 00000-0000000-0)");
        return;
      }
    } else {
      if (!passportFile) {
        ue.error("Please upload your passport PDF");
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const uid = user == null ? void 0 : user.id;
      const stamp = Date.now();
      const videoUrl = await uploadFile(videoFile, `${uid}/face_video_${stamp}`);
      let frontUrl = "", backUrl = "", selfieUrl = "", passportUrl = "";
      if (docType === "cnic") {
        frontUrl = await uploadFile(cnicFront, `${uid}/cnic_front_${stamp}`);
        backUrl = await uploadFile(cnicBack, `${uid}/cnic_back_${stamp}`);
        selfieUrl = await uploadFile(selfie, `${uid}/selfie_${stamp}`);
      } else {
        passportUrl = await uploadFile(passportFile, `${uid}/passport_${stamp}`);
      }
      const payload = {
        user_id: uid,
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        address: form.address,
        cnic_number: docType === "cnic" ? form.cnic_number : null,
        cnic_front_url: frontUrl || null,
        cnic_back_url: backUrl || null,
        selfie_url: selfieUrl || null,
        passport_url: passportUrl || null,
        face_video_url: videoUrl,
        document_type: docType,
        status: "pending",
        rejection_reason: null,
        submitted_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (submission == null ? void 0 : submission.id) {
        await updateKycSubmission(submission.id, payload);
      } else {
        await insertKycSubmission(payload);
      }
      if (uid) await sendNotification(uid, "kyc_pending", "KYC Received ✅", "Thank you! Your identity verification is under review. This usually takes 1-3 days.", "/kyc");
      ue.success("KYC submitted! Review takes 1-3 business days.");
      setReapplying(false);
      loadSubmission();
    } catch (err) {
      ue.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  }
  const statusConfig = {
    pending: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }), label: "Under Review", color: "bg-orange-100 text-orange-700" },
    approved: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }), label: "Approved", color: "bg-teal-100 text-teal-700" },
    rejected: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }), label: "Rejected", color: "bg-red-100 text-red-700" }
  };
  if (activeCamera && !capturedImage) {
    const isSelfie = activeCamera === "selfie";
    const isFront = activeCamera === "front";
    const isBack = activeCamera === "back";
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg text-center", children: isFront ? "CNIC Front — Capture" : isBack ? "CNIC Back — Capture" : "Selfie — Capture" }),
      isFront && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-800 dark:text-blue-300", children: '📇 CNIC ko frame ke andar seedha, poora aur roshni mein rakhein — phir neeche "Capture" button dabayein.' }),
      isBack && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-800 dark:text-blue-300", children: '📇 CNIC ka back side frame mein rakhein — phir neeche "Capture" button dabayein.' }),
      isSelfie && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-800 dark:text-amber-300", children: '📸 Glasses, cap, hat, mask hata dein. Chehra oval ke andar rakhein — phir neeche "Capture" button dabayein.' }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full rounded-xl overflow-hidden border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full block" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center p-2", children: !isSelfie ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: frameRef, className: "relative w-[96%] max-w-none", style: { aspectRatio: "1.586 / 1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "absolute -bottom-8 left-0 right-0 text-center text-xs font-medium text-white drop-shadow", children: isFront ? "CNIC ko frame ke andar seedha rakhein" : "CNIC Back ko frame mein rakhein" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: frameRef, className: "relative w-[85%] max-w-sm", style: { aspectRatio: "3 / 4" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-[50%] border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "absolute -bottom-8 left-0 right-0 text-center text-xs font-medium text-white drop-shadow", children: "Chehra oval ke andar rakhein" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: () => {
          stream == null ? void 0 : stream.getTracks().forEach((t) => t.stop());
          setActiveCamera(null);
          setOcrError(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1", onClick: captureImage, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 mr-2" }),
          "Capture"
        ] })
      ] })
    ] }) });
  }
  if (capturedImage && capturedKind) {
    const isFront = capturedKind === "front";
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg text-center", children: isFront ? "CNIC Front — Preview" : capturedKind === "back" ? "CNIC Back — Preview" : "Selfie — Preview" }),
      isFront && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-teal-500/10 border border-teal-500/20 p-3 text-sm text-teal-800 dark:text-teal-300", children: '✅ Tasveer capture ho gayi hai. "Verify & Confirm" dabayein — OCR number parh kar auto-fill kar dega. Agar koi ghalti ho to baad mein khud durust kar sakte hain.' }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full rounded-xl overflow-hidden border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Captured", className: "w-full block" }) }),
      isFront && ocrProcessing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-sm text-primary py-2 flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-primary animate-pulse" }),
        "Tasveer se number parha ja raha hai..."
      ] }),
      isFront && ocrError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 p-3 text-sm text-amber-700 text-center", children: [
        "⚠️ ",
        ocrError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "flex-1", onClick: cancelCaptured, disabled: ocrProcessing, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-2" }),
          "Retake"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "flex-1",
            onClick: verifyCapturedImage,
            disabled: ocrProcessing,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2" }),
              ocrProcessing ? "Processing..." : isFront ? "Verify & Confirm" : "Confirm"
            ]
          }
        )
      ] })
    ] }) });
  }
  const showStatusCard = submission && !reapplying;
  const isRejected = (submission == null ? void 0 : submission.status) === "rejected";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "mb-4 -ml-2", onClick: () => {
      try {
        sessionStorage.removeItem("givethra_kyc_return_to");
      } catch {
      }
      navigate({ to: returnTo });
    }, children: "← Back" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-xl bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "KYC Verification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Identity verification required" })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "Loading..." }) : !user ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "Please sign in first" }) : showStatusCard ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border rounded-xl p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 px-4 py-3 rounded-lg ${(_a = statusConfig[submission.status]) == null ? void 0 : _a.color}`, children: [
        (_b = statusConfig[submission.status]) == null ? void 0 : _b.icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: (_c = statusConfig[submission.status]) == null ? void 0 : _c.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Name:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: submission.full_name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Document:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium uppercase", children: submission.document_type })
        ] }),
        submission.cnic_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "CNIC:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: submission.cnic_number })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Submitted:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : "—" })
        ] })
      ] }),
      isRejected && submission.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 space-y-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-100 p-1.5 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-red-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-red-800", children: "KYC Rejected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-red-600", children: "Please review the reason below before re-submitting" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border border-red-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-red-500 uppercase tracking-wide mb-2", children: "Rejection Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-900 font-medium leading-relaxed", children: submission.rejection_reason })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 text-amber-600 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800", children: "How to fix this:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-amber-700 mt-0.5", children: "Make sure all photos are clear, well-lit, and your full face is visible without glasses, cap, or mask. Your face must match the photo on your document." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "w-full gap-2 bg-red-600 hover:bg-red-700 text-white",
            onClick: startReapply,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
              "Submit KYC Again",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
            ]
          }
        )
      ] }),
      isRejected && !submission.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 space-y-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-100 p-1.5 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-red-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-red-800", children: "KYC Rejected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-red-600", children: "Please re-submit your verification documents" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "w-full gap-2 bg-red-600 hover:bg-red-700 text-white",
            onClick: startReapply,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
              "Submit KYC Again",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
            ]
          }
        )
      ] }),
      submission.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-700", children: "✓ Your identity is verified. You can now submit and unlock cases." }),
      submission.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700", children: "⏳ Your KYC is under review. This usually takes 1-3 business days." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      reapplying && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-primary flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Re-submitting your KYC with new photos." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReapplying(false), className: "text-xs underline", children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
          " Important — Please read before taking photo & video"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Remove ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "glasses, cap, hat, mask, or any face cover" }),
            " when taking the selfie and recording the video."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Your ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "full face must be clearly visible" }),
            ", in good light."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Your face should ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "match the photo on your CNIC" }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "If your face is covered or unclear, your KYC will be rejected." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 dark:text-amber-400 pt-1 border-t border-amber-500/20", children: [
          "🔒 Your photo and video are ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "completely private and secure" }),
          " — only seen by our verification team for confirming your identity. No other user or Hero can ever see them."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDocType("cnic"),
              className: `px-3 py-3 rounded-lg border text-sm font-medium ${docType === "cnic" ? "bg-primary text-white border-primary" : "border-border"}`,
              children: "🆔 National ID (CNIC)"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDocType("passport"),
              className: `px-3 py-3 rounded-lg border text-sm font-medium ${docType === "passport" ? "bg-primary text-white border-primary" : "border-border"}`,
              children: "📘 Passport (International)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.full_name, onChange: (e) => setForm((p) => ({ ...p, full_name: e.target.value })), placeholder: "As on document" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Birth" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.date_of_birth, onChange: (e) => setForm((p) => ({ ...p, date_of_birth: e.target.value })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.address, onChange: (e) => setForm((p) => ({ ...p, address: e.target.value })), placeholder: "Full address" })
      ] }),
      docType === "cnic" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CNIC Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.cnic_number,
              onChange: (e) => setForm((p) => ({ ...p, cnic_number: e.target.value })),
              placeholder: "00000-0000000-0"
            }
          ),
          form.cnic_number && cnicFrontPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
            " OCR se number auto-fill ho gaya hai. Agar koi ghalti hai to khud durust kar lein."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "CNIC front capture ke baad OCR number auto-fill kar dega. Agar ghalti ho to khud theek kar sakte hain." }),
          form.cnic_number && !/^\d{5}-\d{7}-\d{1}$/.test(form.cnic_number) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500", children: "⚠️ Format: 00000-0000000-0 (13 digits)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CNIC Front Photo *" }),
          cnicFrontPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cnicFrontPreview, alt: "Front", className: "w-full rounded-lg border max-h-40 object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => {
              setCnicFront(null);
              setCnicFrontPreview(null);
              setForm((p) => ({ ...p, cnic_number: "" }));
            }, children: "Retake" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: () => startPhotoCamera("front"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 mr-2" }),
            " Scan CNIC Front"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CNIC Back Photo *" }),
          cnicBackPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cnicBackPreview, alt: "Back", className: "w-full rounded-lg border max-h-40 object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => {
              setCnicBack(null);
              setCnicBackPreview(null);
            }, children: "Retake" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: () => startPhotoCamera("back"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 mr-2" }),
            " Capture CNIC Back"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Selfie *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Remove glasses, cap, or face cover. Your full face must be clearly visible." }),
          selfiePreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selfiePreview, alt: "Selfie", className: "w-full rounded-lg border max-h-40 object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => {
              setSelfie(null);
              setSelfiePreview(null);
            }, children: "Retake" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: () => startPhotoCamera("selfie"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 mr-2" }),
            " Take Selfie"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Passport (PDF) *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file", accept: ".pdf,image/*", onChange: (e) => {
          var _a2;
          return setPassportFile(((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null);
        } }),
        passportFile && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600", children: [
          "✓ ",
          passportFile.name
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "15-Second Face Video *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Remove glasses, cap, or face cover. Record a short video of your face for liveness verification." }),
        videoBlob ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: videoBlob, controls: true, className: "w-full rounded-lg border max-h-40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => {
            setVideoBlob(null);
            setVideoFile(null);
          }, children: "Re-record" })
        ] }) : videoRecording ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: liveVideoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full rounded-lg border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-red-500", children: [
            "● Recording... ",
            videoTimer,
            "s / 15s"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-500 h-2 rounded-full transition-all", style: { width: `${videoTimer / 15 * 100}%` } }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", onClick: startVideoRecording, children: "🎥 Record 15s Face Video" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: isSubmitting, className: "w-full", children: isSubmitting ? "Submitting..." : "Submit KYC Verification" })
    ] })
  ] }) });
}
export {
  KycPage as default
};
