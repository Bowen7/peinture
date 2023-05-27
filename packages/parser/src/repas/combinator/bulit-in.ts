import { takeWhile } from "./basic";
import { isSpace } from "../character";

export const space0 = takeWhile(isSpace);
