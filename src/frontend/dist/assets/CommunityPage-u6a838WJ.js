import { u as useNavigate, e as useAuth, r as reactExports, l as jsxRuntimeExports, au as User, aX as getGuestId, n as getCommunityPosts, p as ue, o as createCommunityPost, aY as toggleLike, v as supportPost, aZ as addComment, q as unfollowUser, t as followUser, a_ as getPostComments } from "./main-EspZtMZv.js";
import { L as Layout } from "./Layout-wYZkEQhc.js";
import { B as Button } from "./button-BrpTixLc.js";
import { T as Textarea } from "./textarea-BqlLZurF.js";
import { U as Users } from "./users-_6SD4cVf.js";
import { C as CircleCheck } from "./circle-check-BPQn3gNr.js";
import { L as LoaderCircle } from "./loader-circle-RW_SqW6x.js";
import { S as Send } from "./send-52cEzfnD.js";
import { M as MessageCircle } from "./message-circle-CqePZOv0.js";
import { H as Heart } from "./heart-CaEhMUxo.js";
import { S as Share2 } from "./share-2-CjdTjd5b.js";
import "./x-Br49mtL5.js";
function toDate(argument) {
  const argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
    return new argument.constructor(+argument);
  } else if (typeof argument === "number" || argStr === "[object Number]" || typeof argument === "string" || argStr === "[object String]") {
    return new Date(argument);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}
function constructFrom(date, value) {
  if (date instanceof Date) {
    return new date.constructor(value);
  } else {
    return new Date(value);
  }
}
const minutesInMonth = 43200;
const minutesInDay = 1440;
let defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}
function compareAsc(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const diff = _dateLeft.getTime() - _dateRight.getTime();
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
  } else {
    return diff;
  }
}
function constructNow(date) {
  return constructFrom(date, Date.now());
}
function differenceInCalendarMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
  const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();
  return yearDiff * 12 + monthDiff;
}
function getRoundingMethod(method) {
  return (number) => {
    const round = method ? Math[method] : Math.trunc;
    const result = round(number);
    return result === 0 ? 0 : result;
  };
}
function differenceInMilliseconds(dateLeft, dateRight) {
  return +toDate(dateLeft) - +toDate(dateRight);
}
function endOfDay(date) {
  const _date = toDate(date);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
function endOfMonth(date) {
  const _date = toDate(date);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
function isLastDayOfMonth(date) {
  const _date = toDate(date);
  return +endOfDay(_date) === +endOfMonth(_date);
}
function differenceInMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const sign = compareAsc(_dateLeft, _dateRight);
  const difference = Math.abs(
    differenceInCalendarMonths(_dateLeft, _dateRight)
  );
  let result;
  if (difference < 1) {
    result = 0;
  } else {
    if (_dateLeft.getMonth() === 1 && _dateLeft.getDate() > 27) {
      _dateLeft.setDate(30);
    }
    _dateLeft.setMonth(_dateLeft.getMonth() - sign * difference);
    let isLastMonthNotFull = compareAsc(_dateLeft, _dateRight) === -sign;
    if (isLastDayOfMonth(toDate(dateLeft)) && difference === 1 && compareAsc(dateLeft, _dateRight) === 1) {
      isLastMonthNotFull = false;
    }
    result = sign * (difference - Number(isLastMonthNotFull));
  }
  return result === 0 ? 0 : result;
}
function differenceInSeconds(dateLeft, dateRight, options) {
  const diff = differenceInMilliseconds(dateLeft, dateRight) / 1e3;
  return getRoundingMethod(options == null ? void 0 : options.roundingMethod)(diff);
}
const formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
const formatDistance$1 = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options == null ? void 0 : options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}
const dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
const timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
const dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
const formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};
const formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
const formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = (options == null ? void 0 : options.context) ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = (options == null ? void 0 : options.width) ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = (options == null ? void 0 : options.width) ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}
const eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
const quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
const monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
const dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
const dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
const formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
const ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
const localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
const matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
const parseOrdinalNumberPattern = /\d+/i;
const matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
const parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
const matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
const parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
const matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
const parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
const matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
const parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
const matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
const parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
const match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};
const enUS = {
  code: "en-US",
  formatDistance: formatDistance$1,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
function formatDistance(date, baseDate, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = (options == null ? void 0 : options.locale) ?? defaultOptions2.locale ?? enUS;
  const minutesInAlmostTwoDays = 2520;
  const comparison = compareAsc(date, baseDate);
  if (isNaN(comparison)) {
    throw new RangeError("Invalid time value");
  }
  const localizeOptions = Object.assign({}, options, {
    addSuffix: options == null ? void 0 : options.addSuffix,
    comparison
  });
  let dateLeft;
  let dateRight;
  if (comparison > 0) {
    dateLeft = toDate(baseDate);
    dateRight = toDate(date);
  } else {
    dateLeft = toDate(date);
    dateRight = toDate(baseDate);
  }
  const seconds = differenceInSeconds(dateRight, dateLeft);
  const offsetInSeconds = (getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft)) / 1e3;
  const minutes = Math.round((seconds - offsetInSeconds) / 60);
  let months;
  if (minutes < 2) {
    if (options == null ? void 0 : options.includeSeconds) {
      if (seconds < 5) {
        return locale.formatDistance("lessThanXSeconds", 5, localizeOptions);
      } else if (seconds < 10) {
        return locale.formatDistance("lessThanXSeconds", 10, localizeOptions);
      } else if (seconds < 20) {
        return locale.formatDistance("lessThanXSeconds", 20, localizeOptions);
      } else if (seconds < 40) {
        return locale.formatDistance("halfAMinute", 0, localizeOptions);
      } else if (seconds < 60) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", 1, localizeOptions);
      }
    } else {
      if (minutes === 0) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", minutes, localizeOptions);
      }
    }
  } else if (minutes < 45) {
    return locale.formatDistance("xMinutes", minutes, localizeOptions);
  } else if (minutes < 90) {
    return locale.formatDistance("aboutXHours", 1, localizeOptions);
  } else if (minutes < minutesInDay) {
    const hours = Math.round(minutes / 60);
    return locale.formatDistance("aboutXHours", hours, localizeOptions);
  } else if (minutes < minutesInAlmostTwoDays) {
    return locale.formatDistance("xDays", 1, localizeOptions);
  } else if (minutes < minutesInMonth) {
    const days = Math.round(minutes / minutesInDay);
    return locale.formatDistance("xDays", days, localizeOptions);
  } else if (minutes < minutesInMonth * 2) {
    months = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("aboutXMonths", months, localizeOptions);
  }
  months = differenceInMonths(dateRight, dateLeft);
  if (months < 12) {
    const nearestMonth = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("xMonths", nearestMonth, localizeOptions);
  } else {
    const monthsSinceStartOfYear = months % 12;
    const years = Math.trunc(months / 12);
    if (monthsSinceStartOfYear < 3) {
      return locale.formatDistance("aboutXYears", years, localizeOptions);
    } else if (monthsSinceStartOfYear < 9) {
      return locale.formatDistance("overXYears", years, localizeOptions);
    } else {
      return locale.formatDistance("almostXYears", years + 1, localizeOptions);
    }
  }
}
function formatDistanceToNow(date, options) {
  return formatDistance(date, constructNow(date), options);
}
const COMMUNITY_POSTS_CACHE_KEY = "givethra:community-posts:v1";
function safeDisplayName(value, fallback) {
  const name = String(value || "").trim();
  return name && !name.includes("@") ? name.slice(0, 120) : fallback;
}
function guestDisplayName(userId) {
  const raw = String(userId || "").replace(/^guest:/, "");
  const suffix = raw.replace(/[^0-9]/g, "").slice(-6) || raw.slice(-6) || "Guest";
  return `Guest ${suffix}`;
}
function normalizeCachedPost(post) {
  const isGuest = Boolean(post == null ? void 0 : post.is_guest) || String((post == null ? void 0 : post.user_id) || "").startsWith("guest:");
  return {
    ...post,
    is_guest: isGuest,
    display_name: safeDisplayName(
      post == null ? void 0 : post.display_name,
      isGuest ? guestDisplayName(post == null ? void 0 : post.user_id) : "User"
    ),
    comments: void 0,
    // Preserve backend values if they exist.
    support_count: Number((post == null ? void 0 : post.support_count) || 0),
    supported_by_me: Boolean(post == null ? void 0 : post.supported_by_me)
  };
}
function normalizeComment(comment) {
  const isGuest = String((comment == null ? void 0 : comment.user_id) || "").startsWith("guest:");
  return {
    ...comment,
    user_name: safeDisplayName(
      comment == null ? void 0 : comment.user_name,
      isGuest ? guestDisplayName(comment == null ? void 0 : comment.user_id) : "User"
    )
  };
}
function readCachedCommunityPosts() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      localStorage.getItem(COMMUNITY_POSTS_CACHE_KEY) || "null"
    );
    const cached = Array.isArray(parsed) ? parsed : parsed == null ? void 0 : parsed.posts;
    return Array.isArray(cached) ? cached.filter(
      (post) => post && typeof post.id === "string" && typeof post.message === "string"
    ).map(normalizeCachedPost) : [];
  } catch {
    return [];
  }
}
function writeCachedCommunityPosts(posts) {
  if (typeof window === "undefined") return;
  try {
    const cacheablePosts = posts.map(
      ({ comments: _comments, is_liked: _isLiked, ...post }) => post
    );
    localStorage.setItem(
      COMMUNITY_POSTS_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        posts: cacheablePosts
      })
    );
  } catch {
  }
}
function CommunityPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = reactExports.useState(readCachedCommunityPosts);
  const [loading, setLoading] = reactExports.useState(
    () => readCachedCommunityPosts().length === 0
  );
  const [newComment, setNewComment] = reactExports.useState({});
  const [showComments, setShowComments] = reactExports.useState({});
  const [likedPosts, setLikedPosts] = reactExports.useState({});
  const [likeCounts, setLikeCounts] = reactExports.useState({});
  const [liking, setLiking] = reactExports.useState(null);
  const [commentsLoading, setCommentsLoading] = reactExports.useState({});
  const [feedTab, setFeedTab] = reactExports.useState("for-you");
  const [supportingPostId, setSupportingPostId] = reactExports.useState(null);
  const [newPost, setNewPost] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const visiblePosts = posts;
  reactExports.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/community" } });
    }
  }, [isAuthenticated, navigate]);
  const fetchPosts = async (showLoader = false) => {
    if (showLoader && posts.length === 0) {
      setLoading(true);
    }
    try {
      const data = await getCommunityPosts(feedTab);
      const nextPosts = Array.isArray(data) ? data.map(normalizeCachedPost) : [];
      setPosts(nextPosts);
      setLikeCounts((prev) => {
        const next = { ...prev };
        nextPosts.forEach((post) => {
          next[post.id] = Number(post.likes_count || 0);
        });
        return next;
      });
      setLikedPosts((prev) => {
        const next = { ...prev };
        nextPosts.forEach((post) => {
          next[post.id] = Boolean(post.is_liked);
        });
        return next;
      });
      writeCachedCommunityPosts(nextPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      ue.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  const fetchComments = async (postId) => {
    try {
      const data = await getPostComments(postId);
      setPosts(
        (prev) => prev.map(
          (post) => post.id === postId ? {
            ...post,
            comments: Array.isArray(data) ? data.map(normalizeComment) : [],
            comments_count: Array.isArray(data) ? data.length : 0
          } : post
        )
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  const handleCreatePost = async () => {
    const message = newPost.trim();
    if (!message) {
      ue.error("Please write something.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        message,
        display_name: isAuthenticated ? (user == null ? void 0 : user.fullName) || "User" : void 0,
        is_guest: !isAuthenticated,
        user_id: isAuthenticated ? (user == null ? void 0 : user.id) || null : null,
        guest_id: isAuthenticated ? void 0 : getGuestId()
      };
      const result = await createCommunityPost(payload);
      if (result == null ? void 0 : result.id) {
        ue.success("Post shared!");
        setNewPost("");
        const newPostObj = {
          id: result.id,
          user_id: (user == null ? void 0 : user.id) || null,
          display_name: safeDisplayName(
            result.display_name || payload.display_name,
            isAuthenticated ? (user == null ? void 0 : user.fullName) || "User" : `Guest ${getGuestId().slice(-6)}`
          ),
          message,
          is_guest: !isAuthenticated,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          comments: [],
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
          // New Support Reaction
          support_count: 0,
          supported_by_me: false
        };
        setPosts((prev) => {
          const next = [newPostObj, ...prev];
          writeCachedCommunityPosts(next);
          return next;
        });
        window.dispatchEvent(new CustomEvent("post-updated"));
      } else {
        ue.error("Failed to post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      ue.error((error == null ? void 0 : error.message) || "Failed to post.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleLike = async (postId) => {
    if (liking === postId) return;
    setLiking(postId);
    try {
      const result = await toggleLike(postId);
      const postSnapshot = posts.find(
        (post) => post.id === postId
      );
      const currentCount = likeCounts[postId] ?? (postSnapshot == null ? void 0 : postSnapshot.likes_count) ?? 0;
      const nextLiked = Boolean(result.liked);
      const nextCount = Math.max(
        currentCount + (nextLiked ? 1 : -1),
        0
      );
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: nextLiked
      }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: nextCount
      }));
      setPosts((prev) => {
        const next = prev.map(
          (post) => post.id === postId ? {
            ...post,
            is_liked: nextLiked,
            likes_count: nextCount
          } : post
        );
        writeCachedCommunityPosts(next);
        return next;
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      ue.error((error == null ? void 0 : error.message) || "Failed to like.");
    } finally {
      setLiking(null);
    }
  };
  const handleSupportReaction = async (post) => {
    if (supportingPostId === post.id || post.supported_by_me) return;
    const previousCount = Number(post.support_count || 0);
    const optimisticCount = previousCount + 1;
    setSupportingPostId(post.id);
    setPosts((prev) => prev.map((item) => item.id === post.id ? { ...item, supported_by_me: true, support_count: optimisticCount } : item));
    try {
      const result = await supportPost(post.id);
      const confirmedCount = Number((result == null ? void 0 : result.support_count) ?? optimisticCount);
      setPosts((prev) => {
        const next = prev.map((item) => item.id === post.id ? { ...item, supported_by_me: true, support_count: confirmedCount } : item);
        writeCachedCommunityPosts(next);
        return next;
      });
      ue.success((result == null ? void 0 : result.alreadySupported) ? "You already supported this post." : "Support sent!");
    } catch (error) {
      setPosts((prev) => prev.map((item) => item.id === post.id ? { ...item, supported_by_me: false, support_count: previousCount } : item));
      ue.error((error == null ? void 0 : error.message) || "Failed to send Support.");
    } finally {
      setSupportingPostId(null);
    }
  };
  const handleComment = async (postId) => {
    var _a;
    const comment = (_a = newComment[postId]) == null ? void 0 : _a.trim();
    if (!comment) {
      ue.error("Please write a comment.");
      return;
    }
    try {
      const data = await addComment(postId, comment);
      setPosts(
        (prev) => prev.map(
          (post) => {
            var _a2;
            return post.id === postId ? {
              ...post,
              comments: [
                ...post.comments || [],
                normalizeComment(data)
              ],
              comments_count: (post.comments_count ?? ((_a2 = post.comments) == null ? void 0 : _a2.length) ?? 0) + 1
            } : post;
          }
        )
      );
      setNewComment((prev) => ({
        ...prev,
        [postId]: ""
      }));
      ue.success("Comment added!");
      setTimeout(() => {
        const commentEl = document.getElementById(
          `comment-${data.id}`
        );
        if (commentEl) {
          commentEl.scrollIntoView({
            behavior: "smooth"
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error adding comment:", error);
      ue.error(
        (error == null ? void 0 : error.message) || "Failed to add comment."
      );
    }
  };
  const toggleComments = async (postId) => {
    var _a;
    const shouldOpen = !showComments[postId];
    setShowComments((prev) => ({
      ...prev,
      [postId]: shouldOpen
    }));
    if (!shouldOpen || ((_a = posts.find((post) => post.id === postId)) == null ? void 0 : _a.comments) !== void 0 || commentsLoading[postId]) {
      return;
    }
    setCommentsLoading((prev) => ({
      ...prev,
      [postId]: true
    }));
    try {
      await fetchComments(postId);
    } finally {
      setCommentsLoading((prev) => ({
        ...prev,
        [postId]: false
      }));
    }
  };
  reactExports.useEffect(() => {
    void fetchPosts(true);
    const interval = setInterval(() => {
      void fetchPosts(false);
    }, 6e5);
    const handlePostUpdate = () => {
      void fetchPosts(false);
    };
    window.addEventListener(
      "post-updated",
      handlePostUpdate
    );
    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "post-updated",
        handlePostUpdate
      );
    };
  }, [isAuthenticated, feedTab]);
  const handleShare = (postId) => {
    var _a;
    const url = `${window.location.origin}/community?post=${postId}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this post on Givethra Community",
        text: "Join the conversation on Givethra Community!",
        url
      }).catch(() => {
      });
    } else {
      (_a = navigator.clipboard) == null ? void 0 : _a.writeText(url).then(() => {
        ue.success("Link copied to clipboard!");
      }).catch(() => {
        ue.info(`Share this link: ${url}`);
      });
    }
  };
  const handleFollow = async (post) => {
    if (!post.user_id) return;
    if (!isAuthenticated) {
      window.location.href = "/sign-in";
      return;
    }
    try {
      if (post.is_following) {
        await unfollowUser(post.user_id);
      } else {
        await followUser(post.user_id);
      }
      setPosts(
        (prev) => prev.map(
          (item) => item.user_id === post.user_id ? {
            ...item,
            is_following: !post.is_following
          } : item
        )
      );
    } catch (error) {
      ue.error(
        (error == null ? void 0 : error.message) || "Unable to update Hero status"
      );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-3xl font-bold text-foreground", children: "Community" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Share and connect with the Givethra family" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full", children: [
        posts.length,
        " posts"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "grid grid-cols-3 rounded-xl border border-border bg-muted/30 p-1",
        role: "tablist",
        "aria-label": "Community post feeds",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": feedTab === "for-you",
              onClick: () => setFeedTab("for-you"),
              className: `rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${feedTab === "for-you" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: "For You"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": feedTab === "my-heroes",
              onClick: () => setFeedTab("my-heroes"),
              className: `rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${feedTab === "my-heroes" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "inline h-4 w-4 mr-1" }),
                "My Heroes"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": feedTab === "my-posts",
              onClick: () => setFeedTab("my-posts"),
              className: `rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${feedTab === "my-posts" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: "My Posts"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-primary/20 bg-card p-4 shadow-sm space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: isAuthenticated ? (user == null ? void 0 : user.fullName) || "User" : `Guest ${getGuestId().slice(-6)}` }),
        isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
          "Verified"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          placeholder: "What's on your mind? Share your thoughts...",
          value: newPost,
          onChange: (e) => setNewPost(e.target.value),
          rows: 3,
          className: "resize-none border-border focus:border-primary"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleCreatePost,
          disabled: submitting || !newPost.trim(),
          className: "px-6 rounded-full",
          children: [
            submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
            submitting ? "Posting..." : "Post"
          ]
        }
      ) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-2xl border border-border bg-card p-8 text-center",
        role: "status",
        "aria-live": "polite",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-7 w-7 animate-spin text-primary mx-auto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Loading posts..." })
        ]
      }
    ) : visiblePosts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 border rounded-2xl bg-muted/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-12 w-12 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: feedTab === "my-posts" ? "You have not shared a post yet." : feedTab === "my-heroes" ? "Follow Heroes to see their posts here." : "No posts yet. Be the first to share!" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: visiblePosts.map((post) => {
      var _a, _b;
      const isSupported = Boolean(
        post.supported_by_me
      );
      const supportCount = Number(
        post.support_count || 0
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              post.user_id && !post.is_guest ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "aria-label": `Open ${post.display_name || "user"} profile`,
                  onClick: () => navigate({
                    to: "/profile/$id",
                    params: {
                      id: String(post.user_id)
                    }
                  }),
                  className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all",
                  children: post.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: post.avatar_url,
                      alt: post.display_name || "User",
                      className: "h-full w-full object-cover"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-primary" })
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden", children: post.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: post.avatar_url,
                  alt: "",
                  className: "h-full w-full object-cover"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  post.user_id && !post.is_guest ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => navigate({
                        to: "/profile/$id",
                        params: {
                          id: String(
                            post.user_id
                          )
                        }
                      }),
                      className: "font-semibold text-foreground hover:text-primary transition-colors text-left",
                      children: post.display_name || "User"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: post.display_name || "User" }),
                  post.user_id && !post.is_guest && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleFollow(post),
                      className: `text-[10px] rounded-full px-2 py-0.5 font-semibold ${post.is_following ? "bg-primary/10 text-primary border border-primary/30" : "bg-primary text-primary-foreground"}`,
                      children: post.is_following ? "Hero ✓" : "Hero"
                    }
                  ),
                  post.is_guest ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground", children: "Guest" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                    "Verified"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(
                  new Date(post.created_at),
                  {
                    addSuffix: true
                  }
                ) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground whitespace-pre-wrap break-words leading-relaxed", children: post.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-5 pt-2 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleLike(post.id),
                  disabled: liking === post.id,
                  className: `flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${likedPosts[post.id] ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Heart,
                      {
                        className: `h-5 w-5 transition-all ${likedPosts[post.id] ? "fill-red-500" : ""}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: likeCounts[post.id] ?? post.likes_count ?? 0 })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleComments(post.id),
                  className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: post.comments_count ?? ((_a = post.comments) == null ? void 0 : _a.length) ?? 0 })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleShare(post.id),
                  className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleSupportReaction(post),
                  disabled: supportingPostId === post.id || isSupported,
                  "aria-label": isSupported ? "Supported" : "Support this post",
                  "aria-pressed": isSupported,
                  className: `ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-all duration-200 disabled:opacity-60 ${isSupported ? "bg-amber-500 border-amber-500 text-white scale-105 shadow-sm" : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `text-lg leading-none transition-transform duration-200 ${isSupported ? "-translate-y-0.5" : ""}`,
                        children: isSupported ? "🫳🏻" : "🫴🏻"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isSupported ? "Supported" : "Support" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `text-xs ${isSupported ? "text-white/90" : "text-muted-foreground"}`,
                        children: supportCount.toLocaleString()
                      }
                    )
                  ]
                }
              )
            ] }),
            showComments[post.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2 border-t border-border", children: [
              commentsLoading[post.id] ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground",
                  role: "status",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                    "Loading comments..."
                  ]
                }
              ) : post.comments && post.comments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 max-h-60 overflow-y-auto pr-1", children: post.comments.map(
                (comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    id: `comment-${comment.id}`,
                    className: "flex gap-3",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: comment.user_name || "User" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: formatDistanceToNow(
                            new Date(
                              comment.created_at
                            ),
                            {
                              addSuffix: true
                            }
                          ) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground break-words", children: comment.comment })
                      ] })
                    ]
                  },
                  comment.id
                )
              ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "No comments yet." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    placeholder: "Write a comment...",
                    value: newComment[post.id] || "",
                    onChange: (e) => setNewComment(
                      (prev) => ({
                        ...prev,
                        [post.id]: e.target.value
                      })
                    ),
                    onKeyDown: (e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleComment(
                          post.id
                        );
                      }
                    },
                    rows: 3,
                    className: "flex-1 min-h-12 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    onClick: () => handleComment(
                      post.id
                    ),
                    disabled: !((_b = newComment[post.id]) == null ? void 0 : _b.trim()),
                    className: "rounded-full shrink-0 h-10 w-10",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] })
          ]
        },
        post.id
      );
    }) })
  ] }) });
}
export {
  CommunityPage as default
};
