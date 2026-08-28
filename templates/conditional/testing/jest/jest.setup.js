import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

// react-router (and other modern libs) reference TextEncoder/TextDecoder at
// module scope; jest's jsdom runner does not expose Node's globals by default.
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;