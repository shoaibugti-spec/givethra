var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _currentThenable, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, notify_fn, _a;
import { S as Subscribable, w as pendingThenable, x as resolveEnabled, h as shallowEqualObjects, y as resolveStaleTime, l as noop, A as environmentManager, C as isValidTimeout, D as timeUntilStale, E as timeoutManager, F as focusManager, G as fetchState, I as replaceData, n as notifyManager, r as reactExports, m as shouldThrowError, g as useQueryClient, J as useInternetIdentity, K as createActorWithConfig, N as Record, O as Text, P as Opt, Q as Nat, V as Bool, W as Variant, X as Null, Y as Vec, Z as Int, _ as Principal, $ as Nat8, a0 as Service, a1 as Func, a2 as HttpAgent, a3 as Actor } from "./index-BoYH-a4m.js";
var QueryObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _QueryObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentQuery);
    __privateAdd(this, _currentQueryInitialState);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentResultState);
    __privateAdd(this, _currentResultOptions);
    __privateAdd(this, _currentThenable);
    __privateAdd(this, _selectError);
    __privateAdd(this, _selectFn);
    __privateAdd(this, _selectResult);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    __privateAdd(this, _lastQueryWithDefinedData);
    __privateAdd(this, _staleTimeoutId);
    __privateAdd(this, _refetchIntervalId);
    __privateAdd(this, _currentRefetchInterval);
    __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
    this.options = options;
    __privateSet(this, _client, client);
    __privateSet(this, _selectError, null);
    __privateSet(this, _currentThenable, pendingThenable());
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _currentQuery).addObserver(this);
      if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) {
        __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
      } else {
        this.updateResult();
      }
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
    __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
    __privateGet(this, _currentQuery).removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = __privateGet(this, _currentQuery);
    this.options = __privateGet(this, _client).defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
    __privateGet(this, _currentQuery).setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      __privateGet(this, _currentQuery),
      prevQuery,
      this.options,
      prevOptions
    )) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
    this.updateResult();
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || resolveStaleTime(this.options.staleTime, __privateGet(this, _currentQuery)) !== resolveStaleTime(prevOptions.staleTime, __privateGet(this, _currentQuery)))) {
      __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
    }
    const nextRefetchInterval = __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) {
      __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      __privateSet(this, _currentResult, result);
      __privateSet(this, _currentResultOptions, this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    }
    return result;
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked == null ? void 0 : onPropTracked(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && __privateGet(this, _currentThenable).status === "pending") {
            __privateGet(this, _currentThenable).reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    __privateGet(this, _trackedProps).add(key);
  }
  getCurrentQuery() {
    return __privateGet(this, _currentQuery);
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this, {
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return __privateGet(this, _currentResult);
    });
  }
  createResult(query, options) {
    var _a2;
    const prevQuery = __privateGet(this, _currentQuery);
    const prevOptions = this.options;
    const prevResult = __privateGet(this, _currentResult);
    const prevResultState = __privateGet(this, _currentResultState);
    const prevResultOptions = __privateGet(this, _currentResultOptions);
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : __privateGet(this, _currentQueryInitialState);
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          (_a2 = __privateGet(this, _lastQueryWithDefinedData)) == null ? void 0 : _a2.state.data,
          __privateGet(this, _lastQueryWithDefinedData)
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult == null ? void 0 : prevResult.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === __privateGet(this, _selectFn)) {
        data = __privateGet(this, _selectResult);
      } else {
        try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      }
    }
    if (__privateGet(this, _selectError)) {
      error = __privateGet(this, _selectError);
      data = __privateGet(this, _selectResult);
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: __privateGet(this, _currentThenable),
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = __privateSet(this, _currentThenable, nextResult.promise = pendingThenable());
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = __privateGet(this, _currentThenable);
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = __privateGet(this, _currentResult);
    const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
    __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    __privateSet(this, _currentResultOptions, this.options);
    if (__privateGet(this, _currentResultState).data !== void 0) {
      __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    __privateSet(this, _currentResult, nextResult);
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? __privateGet(this, _trackedProps)
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(__privateGet(this, _currentResult)).some((key) => {
        const typedKey = key;
        const changed = __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    __privateMethod(this, _QueryObserver_instances, notify_fn).call(this, { listeners: shouldNotifyListeners() });
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
}, _client = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _currentThenable = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _QueryObserver_instances = new WeakSet(), executeFetch_fn = function(fetchOptions) {
  __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
  let promise = __privateGet(this, _currentQuery).fetch(
    this.options,
    fetchOptions
  );
  if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
    promise = promise.catch(noop);
  }
  return promise;
}, updateStaleTimeout_fn = function() {
  __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
  const staleTime = resolveStaleTime(
    this.options.staleTime,
    __privateGet(this, _currentQuery)
  );
  if (environmentManager.isServer() || __privateGet(this, _currentResult).isStale || !isValidTimeout(staleTime)) {
    return;
  }
  const time = timeUntilStale(__privateGet(this, _currentResult).dataUpdatedAt, staleTime);
  const timeout = time + 1;
  __privateSet(this, _staleTimeoutId, timeoutManager.setTimeout(() => {
    if (!__privateGet(this, _currentResult).isStale) {
      this.updateResult();
    }
  }, timeout));
}, computeRefetchInterval_fn = function() {
  return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(__privateGet(this, _currentQuery)) : this.options.refetchInterval) ?? false;
}, updateRefetchInterval_fn = function(nextInterval) {
  __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
  __privateSet(this, _currentRefetchInterval, nextInterval);
  if (environmentManager.isServer() || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) === false || !isValidTimeout(__privateGet(this, _currentRefetchInterval)) || __privateGet(this, _currentRefetchInterval) === 0) {
    return;
  }
  __privateSet(this, _refetchIntervalId, timeoutManager.setInterval(() => {
    if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
  }, __privateGet(this, _currentRefetchInterval)));
}, updateTimers_fn = function() {
  __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
  __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this));
}, clearStaleTimeout_fn = function() {
  if (__privateGet(this, _staleTimeoutId)) {
    timeoutManager.clearTimeout(__privateGet(this, _staleTimeoutId));
    __privateSet(this, _staleTimeoutId, void 0);
  }
}, clearRefetchInterval_fn = function() {
  if (__privateGet(this, _refetchIntervalId)) {
    timeoutManager.clearInterval(__privateGet(this, _refetchIntervalId));
    __privateSet(this, _refetchIntervalId, void 0);
  }
}, updateQuery_fn = function() {
  const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), this.options);
  if (query === __privateGet(this, _currentQuery)) {
    return;
  }
  const prevQuery = __privateGet(this, _currentQuery);
  __privateSet(this, _currentQuery, query);
  __privateSet(this, _currentQueryInitialState, query.state);
  if (this.hasListeners()) {
    prevQuery == null ? void 0 : prevQuery.removeObserver(this);
    query.addObserver(this);
  }
}, notify_fn = function(notifyOptions) {
  notifyManager.batch(() => {
    if (notifyOptions.listeners) {
      this.listeners.forEach((listener) => {
        listener(__privateGet(this, _currentResult));
      });
    }
    __privateGet(this, _client).getQueryCache().notify({
      query: __privateGet(this, _currentQuery),
      type: "observerResultsUpdated"
    });
  });
}, _a);
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = (query == null ? void 0 : query.state.error) && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  var _a2, _b, _c, _d;
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  (_b = (_a2 = client.getDefaultOptions().queries) == null ? void 0 : _a2._experimental_beforeQuery) == null ? void 0 : _b.call(
    _a2,
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  (_d = (_c = client.getDefaultOptions().queries) == null ? void 0 : _c._experimental_afterQuery) == null ? void 0 : _d.call(
    _c,
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query == null ? void 0 : query.promise
    );
    promise == null ? void 0 : promise.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
const ACTOR_QUERY_KEY = "actor";
function useActor(createActor2) {
  const { identity, isAuthenticated } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      if (!isAuthenticated) {
        return await createActorWithConfig(createActor2);
      }
      const actor = await createActorWithConfig(createActor2, {
        agentOptions: { identity }
      });
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
const _ImmutableObjectStorageCreateCertificateResult = Record({
  "method": Text,
  "blob_hash": Text
});
const _ImmutableObjectStorageRefillInformation = Record({
  "proposed_top_up_amount": Opt(Nat)
});
const _ImmutableObjectStorageRefillResult = Record({
  "success": Opt(Bool),
  "topped_up_amount": Opt(Nat)
});
const Error$1 = Variant({
  "FrontendOriginsNotConfigured": Null,
  "MixedSsoSources": Record({
    "otherKeys": Vec(Text),
    "ssoKeys": Vec(Text)
  }),
  "Stale": Record({ "ageNs": Nat }),
  "MalformedCandid": Null,
  "AmbiguousAttribute": Record({
    "field": Text,
    "sources": Vec(Text)
  }),
  "NoAttributes": Null,
  "UnknownNonce": Null,
  "UntrustedSsoSource": Record({ "domain": Text }),
  "MissingField": Text,
  "FrontendOriginMismatch": Record({
    "got": Text,
    "expected": Vec(Text)
  })
});
const Result = Variant({ "ok": Null, "err": Error$1 });
const FileRef = Record({
  "mimeType": Text,
  "fileName": Text,
  "storageId": Text
});
const UserId = Principal;
const KycStatus$1 = Variant({
  "UnderReview": Null,
  "Approved": Null,
  "Rejected": Null,
  "Pending": Null
});
const Country = Text;
const Timestamp = Int;
const Role = Variant({
  "Hero": Null,
  "HelpSeeker": Null,
  "Admin": Null
});
const UserPublic = Record({
  "id": UserId,
  "bio": Text,
  "timezone": Text,
  "preferredLanguage": Text,
  "country": Country,
  "lastLoginAt": Int,
  "city": Text,
  "createdAt": Timestamp,
  "role": Role,
  "fullName": Text,
  "isActive": Bool,
  "email": Text,
  "kycStatus": KycStatus$1,
  "avatarRef": Opt(FileRef),
  "phoneNumber": Text
});
const UserRole = Variant({
  "admin": Null,
  "user": Null,
  "guest": Null
});
const Achievement = Variant({
  "TrustedHero": Null,
  "FirstSupport": Null,
  "TenPeopleHelped": Null,
  "EducationHero": Null,
  "MedicalHero": Null,
  "CommunityHero": Null,
  "FiftyPeopleHelped": Null
});
const PaymentStatus = Variant({
  "Failed": Null,
  "Confirmed": Null,
  "Pending": Null
});
const FeeType = Variant({
  "ListingFee": Null,
  "UnlockFee": Null
});
const USDCents = Nat;
const PaymentPublic = Record({
  "id": Nat,
  "status": PaymentStatus,
  "createdAt": Timestamp,
  "feeType": FeeType,
  "amountCents": USDCents,
  "caseId": Opt(Nat),
  "stripeSessionId": Text,
  "paidBy": UserId
});
const Category$1 = Variant({
  "Surgery": Null,
  "Orphans": Null,
  "Food": Null,
  "DebtRelief": Null,
  "Books": Null,
  "EmergencyNeeds": Null,
  "Widows": Null,
  "Uniform": Null,
  "Medicines": Null,
  "Employment": Null,
  "DisabilitySupport": Null,
  "Medical": Null,
  "Housing": Null,
  "Transportation": Null,
  "UniversityFees": Null,
  "Other": Null,
  "SchoolFees": Null,
  "Education": Null,
  "Utilities": Null
});
const City = Text;
const ShoppingItem = Record({
  "productName": Text,
  "currency": Text,
  "quantity": Nat,
  "priceInCents": Nat,
  "productDescription": Text
});
const VerificationStatus$1 = Variant({
  "DocumentsSubmitted": Null,
  "InstitutionVerified": Null,
  "Unverified": Null
});
const CasePublic = Record({
  "id": Nat,
  "title": Text,
  "documents": Vec(FileRef),
  "country": Country,
  "city": City,
  "createdAt": Timestamp,
  "createdBy": UserId,
  "description": Text,
  "deadline": Timestamp,
  "adminNote": Opt(Text),
  "amountNeeded": USDCents,
  "category": Category$1,
  "isPublic": Bool,
  "verificationStatus": VerificationStatus$1
});
const ReviewStatus$1 = Variant({
  "UnderReview": Null,
  "Approved": Null,
  "Rejected": Null,
  "Submitted": Null,
  "Completed": Null
});
const SupportProofPublic = Record({
  "id": Nat,
  "files": Vec(FileRef),
  "status": ReviewStatus$1,
  "heroId": UserId,
  "referenceNumber": Opt(Text),
  "createdAt": Timestamp,
  "adminNote": Opt(Text),
  "caseId": Nat
});
const CaseSummary = Record({
  "id": Nat,
  "title": Text,
  "country": Country,
  "city": City,
  "createdAt": Timestamp,
  "deadline": Timestamp,
  "amountNeeded": USDCents,
  "category": Category$1,
  "verificationStatus": VerificationStatus$1
});
const MessagePublic = Record({
  "id": Nat,
  "content": Text,
  "createdAt": Timestamp,
  "isRead": Bool,
  "conversationId": Nat,
  "receiverId": UserId,
  "caseId": Opt(Nat),
  "senderId": UserId
});
const HelpSeekerStatsPublic = Record({
  "requestsSubmitted": Nat,
  "requestsCompleted": Nat,
  "requestsApproved": Nat
});
const HeroStatsPublic = Record({
  "peopleHelped": Nat,
  "casesSupported": Nat,
  "proudHeartCount": Nat,
  "casesCompleted": Nat,
  "achievements": Vec(Achievement)
});
const LoginDevice = Record({
  "id": Text,
  "os": Text,
  "deviceName": Text,
  "lastAccess": Int,
  "ipAddress": Text
});
const ConversationPublic = Record({
  "id": Nat,
  "lastMessageContent": Opt(Text),
  "lastMessageAt": Opt(Timestamp),
  "unreadCount": Nat,
  "caseId": Opt(Nat),
  "participantIds": Vec(UserId)
});
const NotificationType$1 = Variant({
  "CaseApproved": Null,
  "VerificationUpdate": Null,
  "CaseRejected": Null,
  "SupportSubmitted": Null,
  "UnlockPurchased": Null,
  "NewMessage": Null,
  "ProudHeartReceived": Null
});
const NotificationPublic = Record({
  "id": Nat,
  "title": Text,
  "relatedUserId": Opt(UserId),
  "notifType": NotificationType$1,
  "userId": UserId,
  "createdAt": Timestamp,
  "isRead": Bool,
  "relatedCaseId": Opt(Nat),
  "message": Text
});
const PlatformStats = Record({
  "totalCases": Nat,
  "totalSupportDistributed": Nat,
  "totalHeroes": Nat,
  "totalCompletedCases": Nat
});
const PrivacySettingsPublic = Record({
  "profileVisibility": Text,
  "inAppNotificationsEnabled": Bool,
  "countryVisibility": Bool,
  "emailNotificationsEnabled": Bool,
  "activityVisibility": Bool,
  "caseUpdatesEnabled": Bool
});
const ProudHeart = Record({
  "fromHelpSeeker": UserId,
  "toHero": UserId,
  "awardedAt": Timestamp,
  "caseId": Nat
});
const StripeSessionStatus = Variant({
  "completed": Record({
    "userPrincipal": Opt(Text),
    "response": Text
  }),
  "failed": Record({ "error": Text })
});
const CreditTxnKind$1 = Variant({
  "SpentOnUnlock": Null,
  "SpentOnCase": Null,
  "Purchase": Null,
  "AdminGrant": Null
});
const CreditTransaction = Record({
  "id": Nat,
  "userId": UserId,
  "kind": CreditTxnKind$1,
  "note": Opt(Text),
  "createdAt": Timestamp,
  "amount": Int
});
const UserSettingsPublic = Record({
  "timezone": Text,
  "theme": Text,
  "weeklyDigest": Bool,
  "emailNotifications": Bool,
  "inAppNotifications": Bool,
  "language": Text,
  "largerText": Bool,
  "currencyDisplay": Text,
  "highContrast": Bool,
  "reducedAnimations": Bool
});
const PageRequest = Record({
  "offset": Nat,
  "limit": Nat
});
const StripeConfiguration = Record({
  "allowedCountries": Vec(Text),
  "secretKey": Text
});
const http_header = Record({
  "value": Text,
  "name": Text
});
const http_request_result = Record({
  "status": Nat,
  "body": Vec(Nat8),
  "headers": Vec(http_header)
});
const TransformationInput = Record({
  "context": Vec(Nat8),
  "response": http_request_result
});
const TransformationOutput = Record({
  "status": Nat,
  "body": Vec(Nat8),
  "headers": Vec(http_header)
});
Service({
  "_immutableObjectStorageBlobsAreLive": Func(
    [Vec(Vec(Nat8))],
    [Vec(Bool)],
    ["query"]
  ),
  "_immutableObjectStorageBlobsToDelete": Func(
    [],
    [Vec(Vec(Nat8))],
    ["query"]
  ),
  "_immutableObjectStorageConfirmBlobDeletion": Func(
    [Vec(Vec(Nat8))],
    [],
    []
  ),
  "_immutableObjectStorageCreateCertificate": Func(
    [Text],
    [_ImmutableObjectStorageCreateCertificateResult],
    []
  ),
  "_immutableObjectStorageRefillCashier": Func(
    [Opt(_ImmutableObjectStorageRefillInformation)],
    [_ImmutableObjectStorageRefillResult],
    []
  ),
  "_immutableObjectStorageUpdateGatewayPrincipals": Func([], [], []),
  "_initialize_access_control": Func([], [], []),
  "_internet_identity_sign_in_finish": Func([], [Result], []),
  "_internet_identity_sign_in_start": Func([], [Vec(Nat8)], []),
  "addCaseDocument": Func([Nat, FileRef], [], []),
  "adminGrantCredits": Func([UserId, Nat, Opt(Text)], [], []),
  "adminUpdateKycStatus": Func([UserId, KycStatus$1], [UserPublic], []),
  "assignCallerUserRole": Func([Principal, UserRole], [], []),
  "awardProudHeart": Func([Nat, UserId], [], []),
  "banUser": Func([UserId], [], []),
  "computeAchievements": Func([UserId], [Vec(Achievement)], ["query"]),
  "confirmCreditPurchase": Func([Text, Nat], [], []),
  "confirmListingFee": Func(
    [Text, Opt(Nat)],
    [PaymentPublic],
    []
  ),
  "confirmUnlockFee": Func([Text, Nat], [PaymentPublic], []),
  "createCase": Func(
    [Text, Text, Category$1, Country, City, USDCents, Timestamp],
    [Nat],
    []
  ),
  "createCheckoutSession": Func(
    [Vec(ShoppingItem), Text, Text],
    [Text],
    []
  ),
  "createCreditPurchaseSession": Func(
    [Nat, Text, Text],
    [Text],
    []
  ),
  "createListingFeeSession": Func([Text, Text], [Text], []),
  "createUnlockFeeSession": Func(
    [Nat, Text, Text],
    [Text],
    []
  ),
  "dismissNotification": Func([Nat], [Bool], []),
  "getAllCases": Func([], [Vec(CasePublic)], ["query"]),
  "getAllProofs": Func([], [Vec(SupportProofPublic)], ["query"]),
  "getAllUsers": Func([], [Vec(UserPublic)], ["query"]),
  "getCallerUserProfile": Func([], [Opt(UserPublic)], ["query"]),
  "getCallerUserRole": Func([], [UserRole], ["query"]),
  "getCaseDetail": Func([Nat], [Opt(CasePublic)], ["query"]),
  "getCaseSummary": Func([Nat], [Opt(CaseSummary)], ["query"]),
  "getConversationMessages": Func([Nat], [Vec(MessagePublic)], []),
  "getHelpSeekerStats": Func(
    [UserId],
    [Opt(HelpSeekerStatsPublic)],
    ["query"]
  ),
  "getHeroStats": Func([UserId], [Opt(HeroStatsPublic)], ["query"]),
  "getLoginDevices": Func([], [Vec(LoginDevice)], ["query"]),
  "getMyConversations": Func([], [Vec(ConversationPublic)], ["query"]),
  "getMyNotifications": Func([], [Vec(NotificationPublic)], ["query"]),
  "getMyProofs": Func([], [Vec(SupportProofPublic)], ["query"]),
  "getMySupportedCases": Func([], [Vec(CaseSummary)], ["query"]),
  "getMyTrustScore": Func([], [Nat], ["query"]),
  "getPendingPayments": Func([], [Vec(PaymentPublic)], ["query"]),
  "getPlatformStats": Func([], [PlatformStats], ["query"]),
  "getPrivacySettings": Func(
    [],
    [Opt(PrivacySettingsPublic)],
    ["query"]
  ),
  "getProofsForCase": Func(
    [Nat],
    [Vec(SupportProofPublic)],
    ["query"]
  ),
  "getProudHeartsForHero": Func(
    [UserId],
    [Vec(ProudHeart)],
    ["query"]
  ),
  "getStripeSessionStatus": Func([Text], [StripeSessionStatus], []),
  "getTransactionHistory": Func(
    [],
    [Vec(CreditTransaction)],
    ["query"]
  ),
  "getUnreadMessageCount": Func([], [Nat], ["query"]),
  "getUnreadNotificationCount": Func([], [Nat], ["query"]),
  "getUser": Func([UserId], [Opt(UserPublic)], ["query"]),
  "getUserSettings": Func([], [Opt(UserSettingsPublic)], ["query"]),
  "getWallet": Func([], [Int], ["query"]),
  "isCallerAdmin": Func([], [Bool], ["query"]),
  "isStripeConfigured": Func([], [Bool], ["query"]),
  "isUnlocked": Func([Nat], [Bool], ["query"]),
  "listCases": Func(
    [Opt(Category$1), PageRequest],
    [Vec(CaseSummary)],
    ["query"]
  ),
  "logoutAllOtherDevices": Func([], [Nat], []),
  "markNotificationAsRead": Func([Nat], [Bool], []),
  "registerUser": Func([Text, Text, Role], [UserPublic], []),
  "requestAccountDeletion": Func([], [Text], []),
  "requestDataDownload": Func([], [Text], []),
  "sendMessage": Func(
    [UserId, Opt(Nat), Text],
    [MessagePublic],
    []
  ),
  "setStripeConfiguration": Func([StripeConfiguration], [], []),
  "submitProof": Func(
    [Nat, Vec(FileRef), Opt(Text)],
    [Nat],
    []
  ),
  "suspendUser": Func([UserId], [], []),
  "switchRole": Func([Role], [UserPublic], []),
  "transform": Func(
    [TransformationInput],
    [TransformationOutput],
    ["query"]
  ),
  "unlockCase": Func([Nat], [], []),
  "updatePrivacySettings": Func(
    [Text, Bool, Bool, Bool, Bool, Bool],
    [PrivacySettingsPublic],
    []
  ),
  "updateProofStatus": Func(
    [Nat, ReviewStatus$1, Opt(Text)],
    [],
    []
  ),
  "updateUserProfile": Func(
    [Text, Country, Opt(FileRef)],
    [UserPublic],
    []
  ),
  "updateUserProfileExtended": Func(
    [
      Text,
      Country,
      Text,
      Text,
      Text,
      Text,
      Text,
      Opt(FileRef)
    ],
    [UserPublic],
    []
  ),
  "updateUserSettings": Func(
    [
      Text,
      Text,
      Text,
      Text,
      Bool,
      Bool,
      Bool,
      Bool,
      Bool,
      Bool
    ],
    [UserSettingsPublic],
    []
  ),
  "updateVerificationStatus": Func([Nat, VerificationStatus$1], [], [])
});
const idlFactory = ({ IDL }) => {
  const _ImmutableObjectStorageCreateCertificateResult2 = IDL.Record({
    "method": IDL.Text,
    "blob_hash": IDL.Text
  });
  const _ImmutableObjectStorageRefillInformation2 = IDL.Record({
    "proposed_top_up_amount": IDL.Opt(IDL.Nat)
  });
  const _ImmutableObjectStorageRefillResult2 = IDL.Record({
    "success": IDL.Opt(IDL.Bool),
    "topped_up_amount": IDL.Opt(IDL.Nat)
  });
  const Error2 = IDL.Variant({
    "FrontendOriginsNotConfigured": IDL.Null,
    "MixedSsoSources": IDL.Record({
      "otherKeys": IDL.Vec(IDL.Text),
      "ssoKeys": IDL.Vec(IDL.Text)
    }),
    "Stale": IDL.Record({ "ageNs": IDL.Nat }),
    "MalformedCandid": IDL.Null,
    "AmbiguousAttribute": IDL.Record({
      "field": IDL.Text,
      "sources": IDL.Vec(IDL.Text)
    }),
    "NoAttributes": IDL.Null,
    "UnknownNonce": IDL.Null,
    "UntrustedSsoSource": IDL.Record({ "domain": IDL.Text }),
    "MissingField": IDL.Text,
    "FrontendOriginMismatch": IDL.Record({
      "got": IDL.Text,
      "expected": IDL.Vec(IDL.Text)
    })
  });
  const Result2 = IDL.Variant({ "ok": IDL.Null, "err": Error2 });
  const FileRef2 = IDL.Record({
    "mimeType": IDL.Text,
    "fileName": IDL.Text,
    "storageId": IDL.Text
  });
  const UserId2 = IDL.Principal;
  const KycStatus2 = IDL.Variant({
    "UnderReview": IDL.Null,
    "Approved": IDL.Null,
    "Rejected": IDL.Null,
    "Pending": IDL.Null
  });
  const Country2 = IDL.Text;
  const Timestamp2 = IDL.Int;
  const Role2 = IDL.Variant({
    "Hero": IDL.Null,
    "HelpSeeker": IDL.Null,
    "Admin": IDL.Null
  });
  const UserPublic2 = IDL.Record({
    "id": UserId2,
    "bio": IDL.Text,
    "timezone": IDL.Text,
    "preferredLanguage": IDL.Text,
    "country": Country2,
    "lastLoginAt": IDL.Int,
    "city": IDL.Text,
    "createdAt": Timestamp2,
    "role": Role2,
    "fullName": IDL.Text,
    "isActive": IDL.Bool,
    "email": IDL.Text,
    "kycStatus": KycStatus2,
    "avatarRef": IDL.Opt(FileRef2),
    "phoneNumber": IDL.Text
  });
  const UserRole2 = IDL.Variant({
    "admin": IDL.Null,
    "user": IDL.Null,
    "guest": IDL.Null
  });
  const Achievement2 = IDL.Variant({
    "TrustedHero": IDL.Null,
    "FirstSupport": IDL.Null,
    "TenPeopleHelped": IDL.Null,
    "EducationHero": IDL.Null,
    "MedicalHero": IDL.Null,
    "CommunityHero": IDL.Null,
    "FiftyPeopleHelped": IDL.Null
  });
  const PaymentStatus2 = IDL.Variant({
    "Failed": IDL.Null,
    "Confirmed": IDL.Null,
    "Pending": IDL.Null
  });
  const FeeType2 = IDL.Variant({
    "ListingFee": IDL.Null,
    "UnlockFee": IDL.Null
  });
  const USDCents2 = IDL.Nat;
  const PaymentPublic2 = IDL.Record({
    "id": IDL.Nat,
    "status": PaymentStatus2,
    "createdAt": Timestamp2,
    "feeType": FeeType2,
    "amountCents": USDCents2,
    "caseId": IDL.Opt(IDL.Nat),
    "stripeSessionId": IDL.Text,
    "paidBy": UserId2
  });
  const Category2 = IDL.Variant({
    "Surgery": IDL.Null,
    "Orphans": IDL.Null,
    "Food": IDL.Null,
    "DebtRelief": IDL.Null,
    "Books": IDL.Null,
    "EmergencyNeeds": IDL.Null,
    "Widows": IDL.Null,
    "Uniform": IDL.Null,
    "Medicines": IDL.Null,
    "Employment": IDL.Null,
    "DisabilitySupport": IDL.Null,
    "Medical": IDL.Null,
    "Housing": IDL.Null,
    "Transportation": IDL.Null,
    "UniversityFees": IDL.Null,
    "Other": IDL.Null,
    "SchoolFees": IDL.Null,
    "Education": IDL.Null,
    "Utilities": IDL.Null
  });
  const City2 = IDL.Text;
  const ShoppingItem2 = IDL.Record({
    "productName": IDL.Text,
    "currency": IDL.Text,
    "quantity": IDL.Nat,
    "priceInCents": IDL.Nat,
    "productDescription": IDL.Text
  });
  const VerificationStatus2 = IDL.Variant({
    "DocumentsSubmitted": IDL.Null,
    "InstitutionVerified": IDL.Null,
    "Unverified": IDL.Null
  });
  const CasePublic2 = IDL.Record({
    "id": IDL.Nat,
    "title": IDL.Text,
    "documents": IDL.Vec(FileRef2),
    "country": Country2,
    "city": City2,
    "createdAt": Timestamp2,
    "createdBy": UserId2,
    "description": IDL.Text,
    "deadline": Timestamp2,
    "adminNote": IDL.Opt(IDL.Text),
    "amountNeeded": USDCents2,
    "category": Category2,
    "isPublic": IDL.Bool,
    "verificationStatus": VerificationStatus2
  });
  const ReviewStatus2 = IDL.Variant({
    "UnderReview": IDL.Null,
    "Approved": IDL.Null,
    "Rejected": IDL.Null,
    "Submitted": IDL.Null,
    "Completed": IDL.Null
  });
  const SupportProofPublic2 = IDL.Record({
    "id": IDL.Nat,
    "files": IDL.Vec(FileRef2),
    "status": ReviewStatus2,
    "heroId": UserId2,
    "referenceNumber": IDL.Opt(IDL.Text),
    "createdAt": Timestamp2,
    "adminNote": IDL.Opt(IDL.Text),
    "caseId": IDL.Nat
  });
  const CaseSummary2 = IDL.Record({
    "id": IDL.Nat,
    "title": IDL.Text,
    "country": Country2,
    "city": City2,
    "createdAt": Timestamp2,
    "deadline": Timestamp2,
    "amountNeeded": USDCents2,
    "category": Category2,
    "verificationStatus": VerificationStatus2
  });
  const MessagePublic2 = IDL.Record({
    "id": IDL.Nat,
    "content": IDL.Text,
    "createdAt": Timestamp2,
    "isRead": IDL.Bool,
    "conversationId": IDL.Nat,
    "receiverId": UserId2,
    "caseId": IDL.Opt(IDL.Nat),
    "senderId": UserId2
  });
  const HelpSeekerStatsPublic2 = IDL.Record({
    "requestsSubmitted": IDL.Nat,
    "requestsCompleted": IDL.Nat,
    "requestsApproved": IDL.Nat
  });
  const HeroStatsPublic2 = IDL.Record({
    "peopleHelped": IDL.Nat,
    "casesSupported": IDL.Nat,
    "proudHeartCount": IDL.Nat,
    "casesCompleted": IDL.Nat,
    "achievements": IDL.Vec(Achievement2)
  });
  const LoginDevice2 = IDL.Record({
    "id": IDL.Text,
    "os": IDL.Text,
    "deviceName": IDL.Text,
    "lastAccess": IDL.Int,
    "ipAddress": IDL.Text
  });
  const ConversationPublic2 = IDL.Record({
    "id": IDL.Nat,
    "lastMessageContent": IDL.Opt(IDL.Text),
    "lastMessageAt": IDL.Opt(Timestamp2),
    "unreadCount": IDL.Nat,
    "caseId": IDL.Opt(IDL.Nat),
    "participantIds": IDL.Vec(UserId2)
  });
  const NotificationType2 = IDL.Variant({
    "CaseApproved": IDL.Null,
    "VerificationUpdate": IDL.Null,
    "CaseRejected": IDL.Null,
    "SupportSubmitted": IDL.Null,
    "UnlockPurchased": IDL.Null,
    "NewMessage": IDL.Null,
    "ProudHeartReceived": IDL.Null
  });
  const NotificationPublic2 = IDL.Record({
    "id": IDL.Nat,
    "title": IDL.Text,
    "relatedUserId": IDL.Opt(UserId2),
    "notifType": NotificationType2,
    "userId": UserId2,
    "createdAt": Timestamp2,
    "isRead": IDL.Bool,
    "relatedCaseId": IDL.Opt(IDL.Nat),
    "message": IDL.Text
  });
  const PlatformStats2 = IDL.Record({
    "totalCases": IDL.Nat,
    "totalSupportDistributed": IDL.Nat,
    "totalHeroes": IDL.Nat,
    "totalCompletedCases": IDL.Nat
  });
  const PrivacySettingsPublic2 = IDL.Record({
    "profileVisibility": IDL.Text,
    "inAppNotificationsEnabled": IDL.Bool,
    "countryVisibility": IDL.Bool,
    "emailNotificationsEnabled": IDL.Bool,
    "activityVisibility": IDL.Bool,
    "caseUpdatesEnabled": IDL.Bool
  });
  const ProudHeart2 = IDL.Record({
    "fromHelpSeeker": UserId2,
    "toHero": UserId2,
    "awardedAt": Timestamp2,
    "caseId": IDL.Nat
  });
  const StripeSessionStatus2 = IDL.Variant({
    "completed": IDL.Record({
      "userPrincipal": IDL.Opt(IDL.Text),
      "response": IDL.Text
    }),
    "failed": IDL.Record({ "error": IDL.Text })
  });
  const CreditTxnKind2 = IDL.Variant({
    "SpentOnUnlock": IDL.Null,
    "SpentOnCase": IDL.Null,
    "Purchase": IDL.Null,
    "AdminGrant": IDL.Null
  });
  const CreditTransaction2 = IDL.Record({
    "id": IDL.Nat,
    "userId": UserId2,
    "kind": CreditTxnKind2,
    "note": IDL.Opt(IDL.Text),
    "createdAt": Timestamp2,
    "amount": IDL.Int
  });
  const UserSettingsPublic2 = IDL.Record({
    "timezone": IDL.Text,
    "theme": IDL.Text,
    "weeklyDigest": IDL.Bool,
    "emailNotifications": IDL.Bool,
    "inAppNotifications": IDL.Bool,
    "language": IDL.Text,
    "largerText": IDL.Bool,
    "currencyDisplay": IDL.Text,
    "highContrast": IDL.Bool,
    "reducedAnimations": IDL.Bool
  });
  const PageRequest2 = IDL.Record({ "offset": IDL.Nat, "limit": IDL.Nat });
  const StripeConfiguration2 = IDL.Record({
    "allowedCountries": IDL.Vec(IDL.Text),
    "secretKey": IDL.Text
  });
  const http_header2 = IDL.Record({ "value": IDL.Text, "name": IDL.Text });
  const http_request_result2 = IDL.Record({
    "status": IDL.Nat,
    "body": IDL.Vec(IDL.Nat8),
    "headers": IDL.Vec(http_header2)
  });
  const TransformationInput2 = IDL.Record({
    "context": IDL.Vec(IDL.Nat8),
    "response": http_request_result2
  });
  const TransformationOutput2 = IDL.Record({
    "status": IDL.Nat,
    "body": IDL.Vec(IDL.Nat8),
    "headers": IDL.Vec(http_header2)
  });
  return IDL.Service({
    "_immutableObjectStorageBlobsAreLive": IDL.Func(
      [IDL.Vec(IDL.Vec(IDL.Nat8))],
      [IDL.Vec(IDL.Bool)],
      ["query"]
    ),
    "_immutableObjectStorageBlobsToDelete": IDL.Func(
      [],
      [IDL.Vec(IDL.Vec(IDL.Nat8))],
      ["query"]
    ),
    "_immutableObjectStorageConfirmBlobDeletion": IDL.Func(
      [IDL.Vec(IDL.Vec(IDL.Nat8))],
      [],
      []
    ),
    "_immutableObjectStorageCreateCertificate": IDL.Func(
      [IDL.Text],
      [_ImmutableObjectStorageCreateCertificateResult2],
      []
    ),
    "_immutableObjectStorageRefillCashier": IDL.Func(
      [IDL.Opt(_ImmutableObjectStorageRefillInformation2)],
      [_ImmutableObjectStorageRefillResult2],
      []
    ),
    "_immutableObjectStorageUpdateGatewayPrincipals": IDL.Func([], [], []),
    "_initialize_access_control": IDL.Func([], [], []),
    "_internet_identity_sign_in_finish": IDL.Func([], [Result2], []),
    "_internet_identity_sign_in_start": IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    "addCaseDocument": IDL.Func([IDL.Nat, FileRef2], [], []),
    "adminGrantCredits": IDL.Func(
      [UserId2, IDL.Nat, IDL.Opt(IDL.Text)],
      [],
      []
    ),
    "adminUpdateKycStatus": IDL.Func([UserId2, KycStatus2], [UserPublic2], []),
    "assignCallerUserRole": IDL.Func([IDL.Principal, UserRole2], [], []),
    "awardProudHeart": IDL.Func([IDL.Nat, UserId2], [], []),
    "banUser": IDL.Func([UserId2], [], []),
    "computeAchievements": IDL.Func(
      [UserId2],
      [IDL.Vec(Achievement2)],
      ["query"]
    ),
    "confirmCreditPurchase": IDL.Func([IDL.Text, IDL.Nat], [], []),
    "confirmListingFee": IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Nat)],
      [PaymentPublic2],
      []
    ),
    "confirmUnlockFee": IDL.Func([IDL.Text, IDL.Nat], [PaymentPublic2], []),
    "createCase": IDL.Func(
      [IDL.Text, IDL.Text, Category2, Country2, City2, USDCents2, Timestamp2],
      [IDL.Nat],
      []
    ),
    "createCheckoutSession": IDL.Func(
      [IDL.Vec(ShoppingItem2), IDL.Text, IDL.Text],
      [IDL.Text],
      []
    ),
    "createCreditPurchaseSession": IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text],
      [IDL.Text],
      []
    ),
    "createListingFeeSession": IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    "createUnlockFeeSession": IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text],
      [IDL.Text],
      []
    ),
    "dismissNotification": IDL.Func([IDL.Nat], [IDL.Bool], []),
    "getAllCases": IDL.Func([], [IDL.Vec(CasePublic2)], ["query"]),
    "getAllProofs": IDL.Func([], [IDL.Vec(SupportProofPublic2)], ["query"]),
    "getAllUsers": IDL.Func([], [IDL.Vec(UserPublic2)], ["query"]),
    "getCallerUserProfile": IDL.Func([], [IDL.Opt(UserPublic2)], ["query"]),
    "getCallerUserRole": IDL.Func([], [UserRole2], ["query"]),
    "getCaseDetail": IDL.Func([IDL.Nat], [IDL.Opt(CasePublic2)], ["query"]),
    "getCaseSummary": IDL.Func([IDL.Nat], [IDL.Opt(CaseSummary2)], ["query"]),
    "getConversationMessages": IDL.Func(
      [IDL.Nat],
      [IDL.Vec(MessagePublic2)],
      []
    ),
    "getHelpSeekerStats": IDL.Func(
      [UserId2],
      [IDL.Opt(HelpSeekerStatsPublic2)],
      ["query"]
    ),
    "getHeroStats": IDL.Func([UserId2], [IDL.Opt(HeroStatsPublic2)], ["query"]),
    "getLoginDevices": IDL.Func([], [IDL.Vec(LoginDevice2)], ["query"]),
    "getMyConversations": IDL.Func(
      [],
      [IDL.Vec(ConversationPublic2)],
      ["query"]
    ),
    "getMyNotifications": IDL.Func(
      [],
      [IDL.Vec(NotificationPublic2)],
      ["query"]
    ),
    "getMyProofs": IDL.Func([], [IDL.Vec(SupportProofPublic2)], ["query"]),
    "getMySupportedCases": IDL.Func([], [IDL.Vec(CaseSummary2)], ["query"]),
    "getMyTrustScore": IDL.Func([], [IDL.Nat], ["query"]),
    "getPendingPayments": IDL.Func([], [IDL.Vec(PaymentPublic2)], ["query"]),
    "getPlatformStats": IDL.Func([], [PlatformStats2], ["query"]),
    "getPrivacySettings": IDL.Func(
      [],
      [IDL.Opt(PrivacySettingsPublic2)],
      ["query"]
    ),
    "getProofsForCase": IDL.Func(
      [IDL.Nat],
      [IDL.Vec(SupportProofPublic2)],
      ["query"]
    ),
    "getProudHeartsForHero": IDL.Func(
      [UserId2],
      [IDL.Vec(ProudHeart2)],
      ["query"]
    ),
    "getStripeSessionStatus": IDL.Func([IDL.Text], [StripeSessionStatus2], []),
    "getTransactionHistory": IDL.Func(
      [],
      [IDL.Vec(CreditTransaction2)],
      ["query"]
    ),
    "getUnreadMessageCount": IDL.Func([], [IDL.Nat], ["query"]),
    "getUnreadNotificationCount": IDL.Func([], [IDL.Nat], ["query"]),
    "getUser": IDL.Func([UserId2], [IDL.Opt(UserPublic2)], ["query"]),
    "getUserSettings": IDL.Func([], [IDL.Opt(UserSettingsPublic2)], ["query"]),
    "getWallet": IDL.Func([], [IDL.Int], ["query"]),
    "isCallerAdmin": IDL.Func([], [IDL.Bool], ["query"]),
    "isStripeConfigured": IDL.Func([], [IDL.Bool], ["query"]),
    "isUnlocked": IDL.Func([IDL.Nat], [IDL.Bool], ["query"]),
    "listCases": IDL.Func(
      [IDL.Opt(Category2), PageRequest2],
      [IDL.Vec(CaseSummary2)],
      ["query"]
    ),
    "logoutAllOtherDevices": IDL.Func([], [IDL.Nat], []),
    "markNotificationAsRead": IDL.Func([IDL.Nat], [IDL.Bool], []),
    "registerUser": IDL.Func([IDL.Text, IDL.Text, Role2], [UserPublic2], []),
    "requestAccountDeletion": IDL.Func([], [IDL.Text], []),
    "requestDataDownload": IDL.Func([], [IDL.Text], []),
    "sendMessage": IDL.Func(
      [UserId2, IDL.Opt(IDL.Nat), IDL.Text],
      [MessagePublic2],
      []
    ),
    "setStripeConfiguration": IDL.Func([StripeConfiguration2], [], []),
    "submitProof": IDL.Func(
      [IDL.Nat, IDL.Vec(FileRef2), IDL.Opt(IDL.Text)],
      [IDL.Nat],
      []
    ),
    "suspendUser": IDL.Func([UserId2], [], []),
    "switchRole": IDL.Func([Role2], [UserPublic2], []),
    "transform": IDL.Func(
      [TransformationInput2],
      [TransformationOutput2],
      ["query"]
    ),
    "unlockCase": IDL.Func([IDL.Nat], [], []),
    "updatePrivacySettings": IDL.Func(
      [IDL.Text, IDL.Bool, IDL.Bool, IDL.Bool, IDL.Bool, IDL.Bool],
      [PrivacySettingsPublic2],
      []
    ),
    "updateProofStatus": IDL.Func(
      [IDL.Nat, ReviewStatus2, IDL.Opt(IDL.Text)],
      [],
      []
    ),
    "updateUserProfile": IDL.Func(
      [IDL.Text, Country2, IDL.Opt(FileRef2)],
      [UserPublic2],
      []
    ),
    "updateUserProfileExtended": IDL.Func(
      [
        IDL.Text,
        Country2,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Opt(FileRef2)
      ],
      [UserPublic2],
      []
    ),
    "updateUserSettings": IDL.Func(
      [
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Bool,
        IDL.Bool,
        IDL.Bool,
        IDL.Bool,
        IDL.Bool,
        IDL.Bool
      ],
      [UserSettingsPublic2],
      []
    ),
    "updateVerificationStatus": IDL.Func(
      [IDL.Nat, VerificationStatus2],
      [],
      []
    )
  });
};
function candid_some(value) {
  return [
    value
  ];
}
function candid_none() {
  return [];
}
function record_opt_to_undefined(arg) {
  return arg == null ? void 0 : arg;
}
var Category = /* @__PURE__ */ ((Category2) => {
  Category2["Surgery"] = "Surgery";
  Category2["Orphans"] = "Orphans";
  Category2["Food"] = "Food";
  Category2["DebtRelief"] = "DebtRelief";
  Category2["Books"] = "Books";
  Category2["EmergencyNeeds"] = "EmergencyNeeds";
  Category2["Widows"] = "Widows";
  Category2["Uniform"] = "Uniform";
  Category2["Medicines"] = "Medicines";
  Category2["Employment"] = "Employment";
  Category2["DisabilitySupport"] = "DisabilitySupport";
  Category2["Medical"] = "Medical";
  Category2["Housing"] = "Housing";
  Category2["Transportation"] = "Transportation";
  Category2["UniversityFees"] = "UniversityFees";
  Category2["Other"] = "Other";
  Category2["SchoolFees"] = "SchoolFees";
  Category2["Education"] = "Education";
  Category2["Utilities"] = "Utilities";
  return Category2;
})(Category || {});
var CreditTxnKind = /* @__PURE__ */ ((CreditTxnKind2) => {
  CreditTxnKind2["SpentOnUnlock"] = "SpentOnUnlock";
  CreditTxnKind2["SpentOnCase"] = "SpentOnCase";
  CreditTxnKind2["Purchase"] = "Purchase";
  CreditTxnKind2["AdminGrant"] = "AdminGrant";
  return CreditTxnKind2;
})(CreditTxnKind || {});
var KycStatus = /* @__PURE__ */ ((KycStatus2) => {
  KycStatus2["UnderReview"] = "UnderReview";
  KycStatus2["Approved"] = "Approved";
  KycStatus2["Rejected"] = "Rejected";
  KycStatus2["Pending"] = "Pending";
  return KycStatus2;
})(KycStatus || {});
var NotificationType = /* @__PURE__ */ ((NotificationType2) => {
  NotificationType2["CaseApproved"] = "CaseApproved";
  NotificationType2["VerificationUpdate"] = "VerificationUpdate";
  NotificationType2["CaseRejected"] = "CaseRejected";
  NotificationType2["SupportSubmitted"] = "SupportSubmitted";
  NotificationType2["UnlockPurchased"] = "UnlockPurchased";
  NotificationType2["NewMessage"] = "NewMessage";
  NotificationType2["ProudHeartReceived"] = "ProudHeartReceived";
  return NotificationType2;
})(NotificationType || {});
var ReviewStatus = /* @__PURE__ */ ((ReviewStatus2) => {
  ReviewStatus2["UnderReview"] = "UnderReview";
  ReviewStatus2["Approved"] = "Approved";
  ReviewStatus2["Rejected"] = "Rejected";
  ReviewStatus2["Submitted"] = "Submitted";
  ReviewStatus2["Completed"] = "Completed";
  return ReviewStatus2;
})(ReviewStatus || {});
var VerificationStatus = /* @__PURE__ */ ((VerificationStatus2) => {
  VerificationStatus2["DocumentsSubmitted"] = "DocumentsSubmitted";
  VerificationStatus2["InstitutionVerified"] = "InstitutionVerified";
  VerificationStatus2["Unverified"] = "Unverified";
  return VerificationStatus2;
})(VerificationStatus || {});
class Backend {
  constructor(actor, _uploadFile, _downloadFile, processError) {
    this.actor = actor;
    this._uploadFile = _uploadFile;
    this._downloadFile = _downloadFile;
    this.processError = processError;
  }
  async _immutableObjectStorageBlobsAreLive(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageBlobsAreLive(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageBlobsAreLive(arg0);
      return result;
    }
  }
  async _immutableObjectStorageBlobsToDelete() {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageBlobsToDelete();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageBlobsToDelete();
      return result;
    }
  }
  async _immutableObjectStorageConfirmBlobDeletion(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageConfirmBlobDeletion(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageConfirmBlobDeletion(arg0);
      return result;
    }
  }
  async _immutableObjectStorageCreateCertificate(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageCreateCertificate(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageCreateCertificate(arg0);
      return result;
    }
  }
  async _immutableObjectStorageRefillCashier(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageRefillCashier(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
        return from_candid__ImmutableObjectStorageRefillResult_n4(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageRefillCashier(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
      return from_candid__ImmutableObjectStorageRefillResult_n4(this._uploadFile, this._downloadFile, result);
    }
  }
  async _immutableObjectStorageUpdateGatewayPrincipals() {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageUpdateGatewayPrincipals();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageUpdateGatewayPrincipals();
      return result;
    }
  }
  async _initialize_access_control() {
    if (this.processError) {
      try {
        const result = await this.actor._initialize_access_control();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._initialize_access_control();
      return result;
    }
  }
  async _internet_identity_sign_in_finish() {
    if (this.processError) {
      try {
        const result = await this.actor._internet_identity_sign_in_finish();
        return from_candid_Result_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._internet_identity_sign_in_finish();
      return from_candid_Result_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async _internet_identity_sign_in_start() {
    if (this.processError) {
      try {
        const result = await this.actor._internet_identity_sign_in_start();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._internet_identity_sign_in_start();
      return result;
    }
  }
  async addCaseDocument(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.addCaseDocument(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addCaseDocument(arg0, arg1);
      return result;
    }
  }
  async adminGrantCredits(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.adminGrantCredits(arg0, arg1, to_candid_opt_n12(this._uploadFile, this._downloadFile, arg2));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.adminGrantCredits(arg0, arg1, to_candid_opt_n12(this._uploadFile, this._downloadFile, arg2));
      return result;
    }
  }
  async adminUpdateKycStatus(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.adminUpdateKycStatus(arg0, to_candid_KycStatus_n13(this._uploadFile, this._downloadFile, arg1));
        return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.adminUpdateKycStatus(arg0, to_candid_KycStatus_n13(this._uploadFile, this._downloadFile, arg1));
      return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
    }
  }
  async assignCallerUserRole(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n22(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n22(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
  async awardProudHeart(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.awardProudHeart(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.awardProudHeart(arg0, arg1);
      return result;
    }
  }
  async banUser(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.banUser(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.banUser(arg0);
      return result;
    }
  }
  async computeAchievements(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.computeAchievements(arg0);
        return from_candid_vec_n24(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.computeAchievements(arg0);
      return from_candid_vec_n24(this._uploadFile, this._downloadFile, result);
    }
  }
  async confirmCreditPurchase(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.confirmCreditPurchase(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.confirmCreditPurchase(arg0, arg1);
      return result;
    }
  }
  async confirmListingFee(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.confirmListingFee(arg0, to_candid_opt_n27(this._uploadFile, this._downloadFile, arg1));
        return from_candid_PaymentPublic_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.confirmListingFee(arg0, to_candid_opt_n27(this._uploadFile, this._downloadFile, arg1));
      return from_candid_PaymentPublic_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async confirmUnlockFee(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.confirmUnlockFee(arg0, arg1);
        return from_candid_PaymentPublic_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.confirmUnlockFee(arg0, arg1);
      return from_candid_PaymentPublic_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async createCase(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    if (this.processError) {
      try {
        const result = await this.actor.createCase(arg0, arg1, to_candid_Category_n34(this._uploadFile, this._downloadFile, arg2), arg3, arg4, arg5, arg6);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createCase(arg0, arg1, to_candid_Category_n34(this._uploadFile, this._downloadFile, arg2), arg3, arg4, arg5, arg6);
      return result;
    }
  }
  async createCheckoutSession(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.createCheckoutSession(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createCheckoutSession(arg0, arg1, arg2);
      return result;
    }
  }
  async createCreditPurchaseSession(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.createCreditPurchaseSession(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createCreditPurchaseSession(arg0, arg1, arg2);
      return result;
    }
  }
  async createListingFeeSession(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createListingFeeSession(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createListingFeeSession(arg0, arg1);
      return result;
    }
  }
  async createUnlockFeeSession(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.createUnlockFeeSession(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createUnlockFeeSession(arg0, arg1, arg2);
      return result;
    }
  }
  async dismissNotification(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.dismissNotification(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.dismissNotification(arg0);
      return result;
    }
  }
  async getAllCases() {
    if (this.processError) {
      try {
        const result = await this.actor.getAllCases();
        return from_candid_vec_n36(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllCases();
      return from_candid_vec_n36(this._uploadFile, this._downloadFile, result);
    }
  }
  async getAllProofs() {
    if (this.processError) {
      try {
        const result = await this.actor.getAllProofs();
        return from_candid_vec_n44(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllProofs();
      return from_candid_vec_n44(this._uploadFile, this._downloadFile, result);
    }
  }
  async getAllUsers() {
    if (this.processError) {
      try {
        const result = await this.actor.getAllUsers();
        return from_candid_vec_n49(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllUsers();
      return from_candid_vec_n49(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCallerUserProfile() {
    if (this.processError) {
      try {
        const result = await this.actor.getCallerUserProfile();
        return from_candid_opt_n50(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallerUserProfile();
      return from_candid_opt_n50(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCallerUserRole() {
    if (this.processError) {
      try {
        const result = await this.actor.getCallerUserRole();
        return from_candid_UserRole_n51(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallerUserRole();
      return from_candid_UserRole_n51(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCaseDetail(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getCaseDetail(arg0);
        return from_candid_opt_n53(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCaseDetail(arg0);
      return from_candid_opt_n53(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCaseSummary(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getCaseSummary(arg0);
        return from_candid_opt_n54(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCaseSummary(arg0);
      return from_candid_opt_n54(this._uploadFile, this._downloadFile, result);
    }
  }
  async getConversationMessages(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getConversationMessages(arg0);
        return from_candid_vec_n57(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getConversationMessages(arg0);
      return from_candid_vec_n57(this._uploadFile, this._downloadFile, result);
    }
  }
  async getHelpSeekerStats(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getHelpSeekerStats(arg0);
        return from_candid_opt_n60(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getHelpSeekerStats(arg0);
      return from_candid_opt_n60(this._uploadFile, this._downloadFile, result);
    }
  }
  async getHeroStats(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getHeroStats(arg0);
        return from_candid_opt_n61(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getHeroStats(arg0);
      return from_candid_opt_n61(this._uploadFile, this._downloadFile, result);
    }
  }
  async getLoginDevices() {
    if (this.processError) {
      try {
        const result = await this.actor.getLoginDevices();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getLoginDevices();
      return result;
    }
  }
  async getMyConversations() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyConversations();
        return from_candid_vec_n64(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyConversations();
      return from_candid_vec_n64(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyNotifications() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyNotifications();
        return from_candid_vec_n68(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyNotifications();
      return from_candid_vec_n68(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyProofs() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyProofs();
        return from_candid_vec_n44(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyProofs();
      return from_candid_vec_n44(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMySupportedCases() {
    if (this.processError) {
      try {
        const result = await this.actor.getMySupportedCases();
        return from_candid_vec_n74(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMySupportedCases();
      return from_candid_vec_n74(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyTrustScore() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyTrustScore();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyTrustScore();
      return result;
    }
  }
  async getPendingPayments() {
    if (this.processError) {
      try {
        const result = await this.actor.getPendingPayments();
        return from_candid_vec_n75(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPendingPayments();
      return from_candid_vec_n75(this._uploadFile, this._downloadFile, result);
    }
  }
  async getPlatformStats() {
    if (this.processError) {
      try {
        const result = await this.actor.getPlatformStats();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPlatformStats();
      return result;
    }
  }
  async getPrivacySettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getPrivacySettings();
        return from_candid_opt_n76(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPrivacySettings();
      return from_candid_opt_n76(this._uploadFile, this._downloadFile, result);
    }
  }
  async getProofsForCase(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProofsForCase(arg0);
        return from_candid_vec_n44(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProofsForCase(arg0);
      return from_candid_vec_n44(this._uploadFile, this._downloadFile, result);
    }
  }
  async getProudHeartsForHero(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProudHeartsForHero(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProudHeartsForHero(arg0);
      return result;
    }
  }
  async getStripeSessionStatus(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getStripeSessionStatus(arg0);
        return from_candid_StripeSessionStatus_n77(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStripeSessionStatus(arg0);
      return from_candid_StripeSessionStatus_n77(this._uploadFile, this._downloadFile, result);
    }
  }
  async getTransactionHistory() {
    if (this.processError) {
      try {
        const result = await this.actor.getTransactionHistory();
        return from_candid_vec_n80(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getTransactionHistory();
      return from_candid_vec_n80(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUnreadMessageCount() {
    if (this.processError) {
      try {
        const result = await this.actor.getUnreadMessageCount();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUnreadMessageCount();
      return result;
    }
  }
  async getUnreadNotificationCount() {
    if (this.processError) {
      try {
        const result = await this.actor.getUnreadNotificationCount();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUnreadNotificationCount();
      return result;
    }
  }
  async getUser(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUser(arg0);
        return from_candid_opt_n50(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUser(arg0);
      return from_candid_opt_n50(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUserSettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getUserSettings();
        return from_candid_opt_n85(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserSettings();
      return from_candid_opt_n85(this._uploadFile, this._downloadFile, result);
    }
  }
  async getWallet() {
    if (this.processError) {
      try {
        const result = await this.actor.getWallet();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getWallet();
      return result;
    }
  }
  async isCallerAdmin() {
    if (this.processError) {
      try {
        const result = await this.actor.isCallerAdmin();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isCallerAdmin();
      return result;
    }
  }
  async isStripeConfigured() {
    if (this.processError) {
      try {
        const result = await this.actor.isStripeConfigured();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isStripeConfigured();
      return result;
    }
  }
  async isUnlocked(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.isUnlocked(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isUnlocked(arg0);
      return result;
    }
  }
  async listCases(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.listCases(to_candid_opt_n86(this._uploadFile, this._downloadFile, arg0), arg1);
        return from_candid_vec_n74(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listCases(to_candid_opt_n86(this._uploadFile, this._downloadFile, arg0), arg1);
      return from_candid_vec_n74(this._uploadFile, this._downloadFile, result);
    }
  }
  async logoutAllOtherDevices() {
    if (this.processError) {
      try {
        const result = await this.actor.logoutAllOtherDevices();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.logoutAllOtherDevices();
      return result;
    }
  }
  async markNotificationAsRead(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.markNotificationAsRead(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.markNotificationAsRead(arg0);
      return result;
    }
  }
  async registerUser(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.registerUser(arg0, arg1, to_candid_Role_n87(this._uploadFile, this._downloadFile, arg2));
        return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.registerUser(arg0, arg1, to_candid_Role_n87(this._uploadFile, this._downloadFile, arg2));
      return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
    }
  }
  async requestAccountDeletion() {
    if (this.processError) {
      try {
        const result = await this.actor.requestAccountDeletion();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.requestAccountDeletion();
      return result;
    }
  }
  async requestDataDownload() {
    if (this.processError) {
      try {
        const result = await this.actor.requestDataDownload();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.requestDataDownload();
      return result;
    }
  }
  async sendMessage(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.sendMessage(arg0, to_candid_opt_n27(this._uploadFile, this._downloadFile, arg1), arg2);
        return from_candid_MessagePublic_n58(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.sendMessage(arg0, to_candid_opt_n27(this._uploadFile, this._downloadFile, arg1), arg2);
      return from_candid_MessagePublic_n58(this._uploadFile, this._downloadFile, result);
    }
  }
  async setStripeConfiguration(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setStripeConfiguration(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setStripeConfiguration(arg0);
      return result;
    }
  }
  async submitProof(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.submitProof(arg0, arg1, to_candid_opt_n12(this._uploadFile, this._downloadFile, arg2));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.submitProof(arg0, arg1, to_candid_opt_n12(this._uploadFile, this._downloadFile, arg2));
      return result;
    }
  }
  async suspendUser(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.suspendUser(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.suspendUser(arg0);
      return result;
    }
  }
  async switchRole(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.switchRole(to_candid_Role_n87(this._uploadFile, this._downloadFile, arg0));
        return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.switchRole(to_candid_Role_n87(this._uploadFile, this._downloadFile, arg0));
      return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
    }
  }
  async transform(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.transform(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.transform(arg0);
      return result;
    }
  }
  async unlockCase(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.unlockCase(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.unlockCase(arg0);
      return result;
    }
  }
  async updatePrivacySettings(arg0, arg1, arg2, arg3, arg4, arg5) {
    if (this.processError) {
      try {
        const result = await this.actor.updatePrivacySettings(arg0, arg1, arg2, arg3, arg4, arg5);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updatePrivacySettings(arg0, arg1, arg2, arg3, arg4, arg5);
      return result;
    }
  }
  async updateProofStatus(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateProofStatus(arg0, to_candid_ReviewStatus_n89(this._uploadFile, this._downloadFile, arg1), to_candid_opt_n12(this._uploadFile, this._downloadFile, arg2));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateProofStatus(arg0, to_candid_ReviewStatus_n89(this._uploadFile, this._downloadFile, arg1), to_candid_opt_n12(this._uploadFile, this._downloadFile, arg2));
      return result;
    }
  }
  async updateUserProfile(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateUserProfile(arg0, arg1, to_candid_opt_n91(this._uploadFile, this._downloadFile, arg2));
        return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateUserProfile(arg0, arg1, to_candid_opt_n91(this._uploadFile, this._downloadFile, arg2));
      return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateUserProfileExtended(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    if (this.processError) {
      try {
        const result = await this.actor.updateUserProfileExtended(arg0, arg1, arg2, arg3, arg4, arg5, arg6, to_candid_opt_n91(this._uploadFile, this._downloadFile, arg7));
        return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateUserProfileExtended(arg0, arg1, arg2, arg3, arg4, arg5, arg6, to_candid_opt_n91(this._uploadFile, this._downloadFile, arg7));
      return from_candid_UserPublic_n15(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateUserSettings(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    if (this.processError) {
      try {
        const result = await this.actor.updateUserSettings(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateUserSettings(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
      return result;
    }
  }
  async updateVerificationStatus(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateVerificationStatus(arg0, to_candid_VerificationStatus_n92(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateVerificationStatus(arg0, to_candid_VerificationStatus_n92(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
}
function from_candid_Achievement_n25(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n26(_uploadFile, _downloadFile, value);
}
function from_candid_CasePublic_n37(_uploadFile, _downloadFile, value) {
  return from_candid_record_n38(_uploadFile, _downloadFile, value);
}
function from_candid_CaseSummary_n55(_uploadFile, _downloadFile, value) {
  return from_candid_record_n56(_uploadFile, _downloadFile, value);
}
function from_candid_Category_n40(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n41(_uploadFile, _downloadFile, value);
}
function from_candid_ConversationPublic_n65(_uploadFile, _downloadFile, value) {
  return from_candid_record_n66(_uploadFile, _downloadFile, value);
}
function from_candid_CreditTransaction_n81(_uploadFile, _downloadFile, value) {
  return from_candid_record_n82(_uploadFile, _downloadFile, value);
}
function from_candid_CreditTxnKind_n83(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n84(_uploadFile, _downloadFile, value);
}
function from_candid_Error_n10(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n11(_uploadFile, _downloadFile, value);
}
function from_candid_FeeType_n32(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n33(_uploadFile, _downloadFile, value);
}
function from_candid_HeroStatsPublic_n62(_uploadFile, _downloadFile, value) {
  return from_candid_record_n63(_uploadFile, _downloadFile, value);
}
function from_candid_KycStatus_n19(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n20(_uploadFile, _downloadFile, value);
}
function from_candid_MessagePublic_n58(_uploadFile, _downloadFile, value) {
  return from_candid_record_n59(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationPublic_n69(_uploadFile, _downloadFile, value) {
  return from_candid_record_n70(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationType_n72(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n73(_uploadFile, _downloadFile, value);
}
function from_candid_PaymentPublic_n28(_uploadFile, _downloadFile, value) {
  return from_candid_record_n29(_uploadFile, _downloadFile, value);
}
function from_candid_PaymentStatus_n30(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n31(_uploadFile, _downloadFile, value);
}
function from_candid_Result_n8(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n9(_uploadFile, _downloadFile, value);
}
function from_candid_ReviewStatus_n47(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n48(_uploadFile, _downloadFile, value);
}
function from_candid_Role_n17(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n18(_uploadFile, _downloadFile, value);
}
function from_candid_StripeSessionStatus_n77(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n78(_uploadFile, _downloadFile, value);
}
function from_candid_SupportProofPublic_n45(_uploadFile, _downloadFile, value) {
  return from_candid_record_n46(_uploadFile, _downloadFile, value);
}
function from_candid_UserPublic_n15(_uploadFile, _downloadFile, value) {
  return from_candid_record_n16(_uploadFile, _downloadFile, value);
}
function from_candid_UserRole_n51(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n52(_uploadFile, _downloadFile, value);
}
function from_candid_VerificationStatus_n42(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n43(_uploadFile, _downloadFile, value);
}
function from_candid__ImmutableObjectStorageRefillResult_n4(_uploadFile, _downloadFile, value) {
  return from_candid_record_n5(_uploadFile, _downloadFile, value);
}
function from_candid_opt_n21(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n39(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n50(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_UserPublic_n15(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n53(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_CasePublic_n37(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n54(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_CaseSummary_n55(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n6(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n60(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n61(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_HeroStatsPublic_n62(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n67(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n7(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n71(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n76(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n85(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_record_n16(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    bio: value.bio,
    timezone: value.timezone,
    preferredLanguage: value.preferredLanguage,
    country: value.country,
    lastLoginAt: value.lastLoginAt,
    city: value.city,
    createdAt: value.createdAt,
    role: from_candid_Role_n17(_uploadFile, _downloadFile, value.role),
    fullName: value.fullName,
    isActive: value.isActive,
    email: value.email,
    kycStatus: from_candid_KycStatus_n19(_uploadFile, _downloadFile, value.kycStatus),
    avatarRef: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.avatarRef)),
    phoneNumber: value.phoneNumber
  };
}
function from_candid_record_n29(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_PaymentStatus_n30(_uploadFile, _downloadFile, value.status),
    createdAt: value.createdAt,
    feeType: from_candid_FeeType_n32(_uploadFile, _downloadFile, value.feeType),
    amountCents: value.amountCents,
    caseId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.caseId)),
    stripeSessionId: value.stripeSessionId,
    paidBy: value.paidBy
  };
}
function from_candid_record_n38(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    title: value.title,
    documents: value.documents,
    country: value.country,
    city: value.city,
    createdAt: value.createdAt,
    createdBy: value.createdBy,
    description: value.description,
    deadline: value.deadline,
    adminNote: record_opt_to_undefined(from_candid_opt_n39(_uploadFile, _downloadFile, value.adminNote)),
    amountNeeded: value.amountNeeded,
    category: from_candid_Category_n40(_uploadFile, _downloadFile, value.category),
    isPublic: value.isPublic,
    verificationStatus: from_candid_VerificationStatus_n42(_uploadFile, _downloadFile, value.verificationStatus)
  };
}
function from_candid_record_n46(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    files: value.files,
    status: from_candid_ReviewStatus_n47(_uploadFile, _downloadFile, value.status),
    heroId: value.heroId,
    referenceNumber: record_opt_to_undefined(from_candid_opt_n39(_uploadFile, _downloadFile, value.referenceNumber)),
    createdAt: value.createdAt,
    adminNote: record_opt_to_undefined(from_candid_opt_n39(_uploadFile, _downloadFile, value.adminNote)),
    caseId: value.caseId
  };
}
function from_candid_record_n5(_uploadFile, _downloadFile, value) {
  return {
    success: record_opt_to_undefined(from_candid_opt_n6(_uploadFile, _downloadFile, value.success)),
    topped_up_amount: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.topped_up_amount))
  };
}
function from_candid_record_n56(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    title: value.title,
    country: value.country,
    city: value.city,
    createdAt: value.createdAt,
    deadline: value.deadline,
    amountNeeded: value.amountNeeded,
    category: from_candid_Category_n40(_uploadFile, _downloadFile, value.category),
    verificationStatus: from_candid_VerificationStatus_n42(_uploadFile, _downloadFile, value.verificationStatus)
  };
}
function from_candid_record_n59(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    content: value.content,
    createdAt: value.createdAt,
    isRead: value.isRead,
    conversationId: value.conversationId,
    receiverId: value.receiverId,
    caseId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.caseId)),
    senderId: value.senderId
  };
}
function from_candid_record_n63(_uploadFile, _downloadFile, value) {
  return {
    peopleHelped: value.peopleHelped,
    casesSupported: value.casesSupported,
    proudHeartCount: value.proudHeartCount,
    casesCompleted: value.casesCompleted,
    achievements: from_candid_vec_n24(_uploadFile, _downloadFile, value.achievements)
  };
}
function from_candid_record_n66(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    lastMessageContent: record_opt_to_undefined(from_candid_opt_n39(_uploadFile, _downloadFile, value.lastMessageContent)),
    lastMessageAt: record_opt_to_undefined(from_candid_opt_n67(_uploadFile, _downloadFile, value.lastMessageAt)),
    unreadCount: value.unreadCount,
    caseId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.caseId)),
    participantIds: value.participantIds
  };
}
function from_candid_record_n70(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    title: value.title,
    relatedUserId: record_opt_to_undefined(from_candid_opt_n71(_uploadFile, _downloadFile, value.relatedUserId)),
    notifType: from_candid_NotificationType_n72(_uploadFile, _downloadFile, value.notifType),
    userId: value.userId,
    createdAt: value.createdAt,
    isRead: value.isRead,
    relatedCaseId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.relatedCaseId)),
    message: value.message
  };
}
function from_candid_record_n79(_uploadFile, _downloadFile, value) {
  return {
    userPrincipal: record_opt_to_undefined(from_candid_opt_n39(_uploadFile, _downloadFile, value.userPrincipal)),
    response: value.response
  };
}
function from_candid_record_n82(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    userId: value.userId,
    kind: from_candid_CreditTxnKind_n83(_uploadFile, _downloadFile, value.kind),
    note: record_opt_to_undefined(from_candid_opt_n39(_uploadFile, _downloadFile, value.note)),
    createdAt: value.createdAt,
    amount: value.amount
  };
}
function from_candid_variant_n11(_uploadFile, _downloadFile, value) {
  return "FrontendOriginsNotConfigured" in value ? {
    __kind__: "FrontendOriginsNotConfigured",
    FrontendOriginsNotConfigured: value.FrontendOriginsNotConfigured
  } : "MixedSsoSources" in value ? {
    __kind__: "MixedSsoSources",
    MixedSsoSources: value.MixedSsoSources
  } : "Stale" in value ? {
    __kind__: "Stale",
    Stale: value.Stale
  } : "MalformedCandid" in value ? {
    __kind__: "MalformedCandid",
    MalformedCandid: value.MalformedCandid
  } : "AmbiguousAttribute" in value ? {
    __kind__: "AmbiguousAttribute",
    AmbiguousAttribute: value.AmbiguousAttribute
  } : "NoAttributes" in value ? {
    __kind__: "NoAttributes",
    NoAttributes: value.NoAttributes
  } : "UnknownNonce" in value ? {
    __kind__: "UnknownNonce",
    UnknownNonce: value.UnknownNonce
  } : "UntrustedSsoSource" in value ? {
    __kind__: "UntrustedSsoSource",
    UntrustedSsoSource: value.UntrustedSsoSource
  } : "MissingField" in value ? {
    __kind__: "MissingField",
    MissingField: value.MissingField
  } : "FrontendOriginMismatch" in value ? {
    __kind__: "FrontendOriginMismatch",
    FrontendOriginMismatch: value.FrontendOriginMismatch
  } : value;
}
function from_candid_variant_n18(_uploadFile, _downloadFile, value) {
  return "Hero" in value ? "Hero" : "HelpSeeker" in value ? "HelpSeeker" : "Admin" in value ? "Admin" : value;
}
function from_candid_variant_n20(_uploadFile, _downloadFile, value) {
  return "UnderReview" in value ? "UnderReview" : "Approved" in value ? "Approved" : "Rejected" in value ? "Rejected" : "Pending" in value ? "Pending" : value;
}
function from_candid_variant_n26(_uploadFile, _downloadFile, value) {
  return "TrustedHero" in value ? "TrustedHero" : "FirstSupport" in value ? "FirstSupport" : "TenPeopleHelped" in value ? "TenPeopleHelped" : "EducationHero" in value ? "EducationHero" : "MedicalHero" in value ? "MedicalHero" : "CommunityHero" in value ? "CommunityHero" : "FiftyPeopleHelped" in value ? "FiftyPeopleHelped" : value;
}
function from_candid_variant_n31(_uploadFile, _downloadFile, value) {
  return "Failed" in value ? "Failed" : "Confirmed" in value ? "Confirmed" : "Pending" in value ? "Pending" : value;
}
function from_candid_variant_n33(_uploadFile, _downloadFile, value) {
  return "ListingFee" in value ? "ListingFee" : "UnlockFee" in value ? "UnlockFee" : value;
}
function from_candid_variant_n41(_uploadFile, _downloadFile, value) {
  return "Surgery" in value ? "Surgery" : "Orphans" in value ? "Orphans" : "Food" in value ? "Food" : "DebtRelief" in value ? "DebtRelief" : "Books" in value ? "Books" : "EmergencyNeeds" in value ? "EmergencyNeeds" : "Widows" in value ? "Widows" : "Uniform" in value ? "Uniform" : "Medicines" in value ? "Medicines" : "Employment" in value ? "Employment" : "DisabilitySupport" in value ? "DisabilitySupport" : "Medical" in value ? "Medical" : "Housing" in value ? "Housing" : "Transportation" in value ? "Transportation" : "UniversityFees" in value ? "UniversityFees" : "Other" in value ? "Other" : "SchoolFees" in value ? "SchoolFees" : "Education" in value ? "Education" : "Utilities" in value ? "Utilities" : value;
}
function from_candid_variant_n43(_uploadFile, _downloadFile, value) {
  return "DocumentsSubmitted" in value ? "DocumentsSubmitted" : "InstitutionVerified" in value ? "InstitutionVerified" : "Unverified" in value ? "Unverified" : value;
}
function from_candid_variant_n48(_uploadFile, _downloadFile, value) {
  return "UnderReview" in value ? "UnderReview" : "Approved" in value ? "Approved" : "Rejected" in value ? "Rejected" : "Submitted" in value ? "Submitted" : "Completed" in value ? "Completed" : value;
}
function from_candid_variant_n52(_uploadFile, _downloadFile, value) {
  return "admin" in value ? "admin" : "user" in value ? "user" : "guest" in value ? "guest" : value;
}
function from_candid_variant_n73(_uploadFile, _downloadFile, value) {
  return "CaseApproved" in value ? "CaseApproved" : "VerificationUpdate" in value ? "VerificationUpdate" : "CaseRejected" in value ? "CaseRejected" : "SupportSubmitted" in value ? "SupportSubmitted" : "UnlockPurchased" in value ? "UnlockPurchased" : "NewMessage" in value ? "NewMessage" : "ProudHeartReceived" in value ? "ProudHeartReceived" : value;
}
function from_candid_variant_n78(_uploadFile, _downloadFile, value) {
  return "completed" in value ? {
    __kind__: "completed",
    completed: from_candid_record_n79(_uploadFile, _downloadFile, value.completed)
  } : "failed" in value ? {
    __kind__: "failed",
    failed: value.failed
  } : value;
}
function from_candid_variant_n84(_uploadFile, _downloadFile, value) {
  return "SpentOnUnlock" in value ? "SpentOnUnlock" : "SpentOnCase" in value ? "SpentOnCase" : "Purchase" in value ? "Purchase" : "AdminGrant" in value ? "AdminGrant" : value;
}
function from_candid_variant_n9(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: from_candid_Error_n10(_uploadFile, _downloadFile, value.err)
  } : value;
}
function from_candid_vec_n24(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Achievement_n25(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n36(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_CasePublic_n37(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n44(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_SupportProofPublic_n45(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n49(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_UserPublic_n15(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n57(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_MessagePublic_n58(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n64(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_ConversationPublic_n65(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n68(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_NotificationPublic_n69(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n74(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_CaseSummary_n55(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n75(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_PaymentPublic_n28(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n80(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_CreditTransaction_n81(_uploadFile, _downloadFile, x));
}
function to_candid_Category_n34(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n35(_uploadFile, _downloadFile, value);
}
function to_candid_KycStatus_n13(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n14(_uploadFile, _downloadFile, value);
}
function to_candid_ReviewStatus_n89(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n90(_uploadFile, _downloadFile, value);
}
function to_candid_Role_n87(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n88(_uploadFile, _downloadFile, value);
}
function to_candid_UserRole_n22(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n23(_uploadFile, _downloadFile, value);
}
function to_candid_VerificationStatus_n92(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n93(_uploadFile, _downloadFile, value);
}
function to_candid__ImmutableObjectStorageRefillInformation_n2(_uploadFile, _downloadFile, value) {
  return to_candid_record_n3(_uploadFile, _downloadFile, value);
}
function to_candid_opt_n1(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(to_candid__ImmutableObjectStorageRefillInformation_n2(_uploadFile, _downloadFile, value));
}
function to_candid_opt_n12(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_opt_n27(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_opt_n86(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(to_candid_Category_n34(_uploadFile, _downloadFile, value));
}
function to_candid_opt_n91(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_record_n3(_uploadFile, _downloadFile, value) {
  return {
    proposed_top_up_amount: value.proposed_top_up_amount ? candid_some(value.proposed_top_up_amount) : candid_none()
  };
}
function to_candid_variant_n14(_uploadFile, _downloadFile, value) {
  return value == "UnderReview" ? {
    UnderReview: null
  } : value == "Approved" ? {
    Approved: null
  } : value == "Rejected" ? {
    Rejected: null
  } : value == "Pending" ? {
    Pending: null
  } : value;
}
function to_candid_variant_n23(_uploadFile, _downloadFile, value) {
  return value == "admin" ? {
    admin: null
  } : value == "user" ? {
    user: null
  } : value == "guest" ? {
    guest: null
  } : value;
}
function to_candid_variant_n35(_uploadFile, _downloadFile, value) {
  return value == "Surgery" ? {
    Surgery: null
  } : value == "Orphans" ? {
    Orphans: null
  } : value == "Food" ? {
    Food: null
  } : value == "DebtRelief" ? {
    DebtRelief: null
  } : value == "Books" ? {
    Books: null
  } : value == "EmergencyNeeds" ? {
    EmergencyNeeds: null
  } : value == "Widows" ? {
    Widows: null
  } : value == "Uniform" ? {
    Uniform: null
  } : value == "Medicines" ? {
    Medicines: null
  } : value == "Employment" ? {
    Employment: null
  } : value == "DisabilitySupport" ? {
    DisabilitySupport: null
  } : value == "Medical" ? {
    Medical: null
  } : value == "Housing" ? {
    Housing: null
  } : value == "Transportation" ? {
    Transportation: null
  } : value == "UniversityFees" ? {
    UniversityFees: null
  } : value == "Other" ? {
    Other: null
  } : value == "SchoolFees" ? {
    SchoolFees: null
  } : value == "Education" ? {
    Education: null
  } : value == "Utilities" ? {
    Utilities: null
  } : value;
}
function to_candid_variant_n88(_uploadFile, _downloadFile, value) {
  return value == "Hero" ? {
    Hero: null
  } : value == "HelpSeeker" ? {
    HelpSeeker: null
  } : value == "Admin" ? {
    Admin: null
  } : value;
}
function to_candid_variant_n90(_uploadFile, _downloadFile, value) {
  return value == "UnderReview" ? {
    UnderReview: null
  } : value == "Approved" ? {
    Approved: null
  } : value == "Rejected" ? {
    Rejected: null
  } : value == "Submitted" ? {
    Submitted: null
  } : value == "Completed" ? {
    Completed: null
  } : value;
}
function to_candid_variant_n93(_uploadFile, _downloadFile, value) {
  return value == "DocumentsSubmitted" ? {
    DocumentsSubmitted: null
  } : value == "InstitutionVerified" ? {
    InstitutionVerified: null
  } : value == "Unverified" ? {
    Unverified: null
  } : value;
}
function createActor(canisterId, _uploadFile, _downloadFile, options = {}) {
  const agent = options.agent || HttpAgent.createSync({
    ...options.agentOptions
  });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
export {
  Category as C,
  KycStatus as K,
  NotificationType as N,
  ReviewStatus as R,
  VerificationStatus as V,
  useQuery as a,
  CreditTxnKind as b,
  createActor as c,
  useActor as u
};
