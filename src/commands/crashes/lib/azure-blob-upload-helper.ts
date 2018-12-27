import * as AzureStorage from "azure-storage";
import * as Url from "url";

import { ErrorCodes, failure } from "../../../util/commandline";
import { inspect } from "util";
import * as Path from "path";

export default class AzureBlobUploadHelper {
  constructor(private debug: Function) {}

  public async upload(uploadUrl: string, zip: string): Promise<void> {
    const urlObject = Url.parse(uploadUrl);
    const blobService = this.getBlobService(urlObject);
    const [container, blob] = this.getContainerAndBlob(urlObject);

    await this.uploadBlockBlob(blobService, container, blob, zip);
  }

  private uploadBlockBlob(blobService: AzureStorage.BlobService, container: string, blob: string, file: string): Promise<void> {
    return new Promise<void> ((resolve, reject) => {
      let contentType = "";
      switch (Path.extname(file).toLowerCase()) {
        case ".txt":
        contentType = "text/plain";
        break;
        case ".zip":
        contentType = "application/zip";
        break;
      }
      //  ==".txt"
      blobService.createBlockBlobFromLocalFile(container, blob, file, {
        contentSettings: {
          contentType: contentType
        }
      }, (error, result, response) => {
        if (error) {
          this.debug(`Failed to upload ${contentType} with symbols - ${inspect(error)}`);
          reject(failure(ErrorCodes.Exception, "failed to upload ${contentType} with symbols"));
        } else {
          resolve();
        }
      });
    });
  }

  private getBlobService(urlObject: Url.Url): AzureStorage.BlobService {
    const blobEndpoint = Url.format({
      protocol: urlObject.protocol,
      host: urlObject.host
    });
    const sharedAccessSignature = urlObject.query as string;

    const connectionString = "BlobEndpoint=" + blobEndpoint + ";" + "SharedAccessSignature=" + sharedAccessSignature;

    return new AzureStorage.BlobService(connectionString);
  }

  private getContainerAndBlob(urlObject: Url.Url): [string, string] {
    const splitPathName = urlObject.pathname.split("/");
    return [splitPathName[1], splitPathName[2]];
  }
}
