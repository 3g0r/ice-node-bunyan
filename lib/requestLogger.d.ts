/// <reference types="bunyan" />
import { Ice } from "ice";
import * as Logger from "bunyan";
export default function (parent: Logger, current: Ice.Current, extra?: any): Logger;
