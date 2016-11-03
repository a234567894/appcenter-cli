//
// Implementation of token store that reads and writes to the Windows credential store.
// Uses included "creds.exe" program to access the credential store.
//

import * as childProcess from "child_process";
import { Observable } from "rx";
import * as stream from "stream";
import * as es from "event-stream";
import * as path from "path";
import * as parser from "./win-credstore-parser";

import { TokenStore, TokenEntry, TokenKeyType, TokenValueType } from "../token-store";

type ReadableStream = NodeJS.ReadableStream;
type WritableStream = NodeJS.WritableStream;
type Duplex = stream.Duplex;

const credExePath = path.join(__dirname, '../../../../bin/windows/creds.exe');

const targetNamePrefix = 'SonomaCli:target=';

function ensurePrefix(targetName: string): string {
  if (targetName.slice(targetNamePrefix.length) !== targetNamePrefix) {
    targetName = targetNamePrefix + targetName;
  }
  return targetName;
}

function removePrefix(targetName: string): string {
  return targetName.slice(targetNamePrefix.length);
}

function removePrefixFromCred(cred: any): any {
  if (cred.targetName) {
    cred.targetName = removePrefix(cred.targetName);
  }
  return cred;
}

function encodeTokenValueAsHex(token: TokenValueType): string {
  const tokenValueAsString = JSON.stringify(token);
  return Buffer.from(tokenValueAsString, "utf8").toString("hex");
}

function decodeTokenValueFromHex(token: string): TokenValueType {
  return JSON.parse(Buffer.from(token, "hex").toString("utf8"));
}

function credToTokenEntry(cred: any): TokenEntry {
  // Assumes credential comes in with prefixes on target skipped, and
  // Credential object in hexidecimal
  return {
    key: cred.target,
    accessToken: decodeTokenValueFromHex(cred.credential)
  };
}

export class WinTokenStore implements TokenStore {
/**
 * list the contents of the credential store, parsing each value.
 *
 * We ignore everything that wasn't put there by us, we look
 * for target names starting with the target name prefix.
 *
 *
 * @return {Observable<TokenEntry>} stream of credentials.
 */
  list(): Observable<TokenEntry> {
    return Observable.create<TokenEntry>(observer => {
      let credsProcess = childProcess.spawn(credExePath, ['-s', '-g', '-t', `${targetNamePrefix}*`]);
      credsProcess.stdout
        .pipe(parser.createParsingStream as any as Duplex)
        .pipe(es.mapSync(removePrefixFromCred) as any as Duplex)
        .on("data", (cred: any) => {
          observer.onNext(credToTokenEntry(cred));
        })
        .on("end", () => observer.onCompleted())
        .on("error", (err: Error) => observer.onError(err));
    });
  }

/**
 * Get details for a specific credential. Assumes generic credential.
 *
 * @param {tokenKeyType} key target name for credential
 * @return {Promise<TokenEntry>} Returned credential or null if not found.
 */
  get(key: TokenKeyType): Promise<TokenEntry> {
    let args = [ "-s", "-t", ensurePrefix(key) ];

    let credsProcess = childProcess.spawn(credExePath, args);
    let result: any = null;
    let errors: string[] = [];

    return new Promise<TokenEntry>((resolve, reject) => {
      credsProcess.stdout.pipe(parser.createParsingStream())
        .pipe(es.mapSync(removePrefixFromCred) as any as Duplex)
        .on("data", (credential: any) => {
          result = credential;
          result.targetName = removePrefix(result.targetName)
        });

      credsProcess.stderr.pipe(es.split() as any as Duplex)
        .on("data", (line: string) => {
          errors.push(line);
        });

      credsProcess.on("exit", (code: number) => {
        if (code === 0) {
          return resolve(credToTokenEntry(result));
        };
        return reject(new Error(`Getting credential failed, exit code ${code}: ${errors.join(", ")}`));
      });
    });
  }

  /**
   * Set the credential for a given key in the credential store.
   * Creates or updates, assumes generic credential.
   *
   * @param {TokenKeyType} key key for entry (string user name for now)
   * @param {TokenValueType} credential the credential to be encrypted
   *
   * @return {Promise<void>} Promise that completes when update has finished
   * @param {Function(err)} callback completion callback
   */
  set(key: TokenKeyType, credential: TokenValueType): Promise<void> {
    let args = [ "-a", "-t", ensurePrefix(key), "-p", encodeTokenValueAsHex(credential) ];

    return new Promise<void>((resolve, reject) => {
      childProcess.execFile(credExePath, args,
        function (err) {
          if (err) {
            return reject(err);
          }
          return resolve();
        });
     });
  }

 /**
  * Remove the given key from the credential store.
  *
  * @param {TokenKeyType} key  target name to remove.
  *                            if ends with "*" character,
  *                            will delete all targets
  *                            starting with that prefix
  * @param {Function(err)} callback completion callback
  */
  remove(key: TokenKeyType): Promise<void> {
    let args = [ "-d", "-t", ensurePrefix(key) ];

    if (key.slice(-1) === '*') {
      args.push('-g');
    }

    return new Promise((resolve, reject) => {
      childProcess.execFile(credExePath, args,
        function (err) {
          if (err) { return reject(err); }
          resolve();
        });
    });
  }
}
