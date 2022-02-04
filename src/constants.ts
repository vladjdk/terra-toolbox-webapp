/* terra:network */
export const FINDER = "https://finder.terra.money";
export const EXTENSION = "https://terra.money/extension";
export const CHROME = "https://google.com/chrome";
export const DOCS = "https://docs.freewilly.money";

/* terra:wasm */
export const WASMQUERY = "WasmContractsContractAddressStore";

/* terra:configs */
export const BLOCK_TIME = 6500; // 6.5s

/* mirror:unit */
export const SMALLEST = 1e6;
export const FMT = { HHmm: "EEE, LLL dd, HH:mm aa", MMdd: "LLL dd, yyyy" };

/* mirror:configs */
export const GENESIS = 1607022000000;
export const DEFAULT_SLIPPAGE = 0.01;
export const MAX_MSG_LENGTH = 4096;
export const COMMISSION = 0.003;
export const COLLATERAL_RATIO = { DANGER: 0.15, WARNING: 0.3 };

/* network:settings */
export const PRICES_POLLING_INTERVAL = 30000;
export const TX_POLLING_INTERVAL = 1000;

/* terra:addresses */
export const ANGEL_PROTO_ADDRESS_BOMBAY = "terra13au3ag9df7khs2sv7m485e5c5vfwwftlrzf7cw";

/* terra:balance-map */
export const visualDenomName = new Map([
    ["uusd", "UST"], ["uluna", "Luna"], ["usdr", "SDT"],
    ["ukrw", "KRT"], ["umnt", "MNT"], ["ueur", "EUT"],
    ["ucny", "CNT"], ["ujpy", "JPT"], ["ugbp", "GBT"],
    ["uinr", "INT"], ["ucad", "CAT"], ["uchf", "CHT"],
    ["uaud", "AUT"], ["usgd", "SGT"], ["uthb", "THT"],
    ["usek", "SET"], ["unok", "NOT"], ["udkk", "DKT"],
    ["uidr", "IDT"], ["uphp", "PHT"], ["uhkd", "HKT"],
    ["umyr", "MYT"], ["utwd", "TWT"]
])