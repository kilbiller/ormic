const SEP = "/";
// Types ~> static, param, any, optional
const STYPE = 0, PTYPE = 1, ATYPE = 2, OTYPE = 3;
// Char Codes ~> / : *
const SLASH = 47, COLON = 58, ASTER = 42, QMARK = 63;

interface Item {
  old: string;
  type: number;
  val: string;
  end: string;
}

function strip(str: string) {
  if (str === SEP) {
    return str;
  }
  (str.charCodeAt(0) === SLASH) && (str = str.substring(1));
  const len = str.length - 1;
  return str.charCodeAt(len) === SLASH ? str.substring(0, len) : str;
}

function split(str: string) {
  return (str = strip(str)) === SEP ? [SEP] : str.split(SEP);
}

function isMatch(arr: string[], obj: Item, idx: any) {
  idx = arr[idx];
  return (obj.val === idx && obj.type === STYPE) ||
    (idx === SEP
      ? obj.type > PTYPE
      : obj.type !== STYPE && (idx || "").endsWith(obj.end));
}

export function match(str: string, all: Item[][]) {
  const segs = split(str);
  const len = segs.length;
  const fn = isMatch.bind(isMatch, segs);

  for (let i = 0; i < all.length; i++) {
    const tmp = all[i];
    const l = tmp.length;
    if (
      l === len || (l < len && tmp[l - 1].type === ATYPE) ||
      (l > len && tmp[l - 1].type === OTYPE)
    ) {
      if (tmp.every(fn)) {
        return tmp;
      }
    }
  }

  return [];
}

export function parse(str: string) {
  if (str === SEP) {
    return [{ old: str, type: STYPE, val: str, end: "" }];
  }

  let nxt = strip(str);
  let i = -1;
  let j = 0;
  let len = nxt.length;
  const out = [];

  while (++i < len) {
    let c = nxt.charCodeAt(i);

    if (c === COLON) {
      j = i + 1; // begining of param
      let t = PTYPE; // set type
      let x = 0; // reset mark
      let sfx = "";

      while (i < len && nxt.charCodeAt(i) !== SLASH) {
        c = nxt.charCodeAt(i);
        if (c === QMARK) {
          x = i;
          t = OTYPE;
        } else if (c === 46 && sfx.length === 0) {
          sfx = nxt.substring(x = i);
        }
        i++; // move on
      }

      out.push({
        old: str,
        type: t,
        val: nxt.substring(j, x || i),
        end: sfx,
      });

      // shorten string & update pointers
      nxt = nxt.substring(i);
      len -= i;
      i = 0;

      continue; // loop
    } else if (c === ASTER) {
      out.push({
        old: str,
        type: ATYPE,
        val: nxt.substring(i),
        end: "",
      });
      continue; // loop
    } else {
      j = i;
      while (i < len && nxt.charCodeAt(i) !== SLASH) {
        ++i; // skip to next slash
      }
      out.push({
        old: str,
        type: STYPE,
        val: nxt.substring(j, i),
        end: "",
      });
      // shorten string & update pointers
      nxt = nxt.substring(i);
      len -= i;
      i = j = 0;
    }
  }

  return out;
}

export function exec(str: string, arr: Item[]) {
  const segs = split(str);
  const out: Record<string, string> = {};

  for (let i = 0; i < arr.length; i++) {
    const x = segs[i];
    const y = arr[i];

    if (x === SEP) {
      continue;
    }

    // @ts-ignore dunno
    if (x !== void 0 && y.type | 2 === OTYPE) {
      out[y.val] = x.replace(y.end, "");
    }
  }

  return out;
}
