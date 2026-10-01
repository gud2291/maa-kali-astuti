import "server-only";
import { AwsClient } from "aws4fetch";
import { env, isConfigured } from "@/server/env";
import { AppError } from "@/server/result";

function getR2Client(): { client: AwsClient; accountId: string } {
  if (!isConfigured("r2")) {
    throw new AppError("NOT_CONFIGURED");
  }
  return {
    client: new AwsClient({
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      service: "s3",
      region: "auto",
    }),
    accountId: env.CF_ACCOUNT_ID!,
  };
}

function objectUrl(accountId: string, bucket: string, key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  const encodedKey = cleanKey
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodedKey}`;
}

export async function presignPut(params: {
  bucket: string;
  key: string;
  contentType: string;
  contentLength: number;
  expiresSec?: number;
}): Promise<string> {
  const { client, accountId } = getR2Client();
  const expiresSec = params.expiresSec ?? 300;
  const rawUrl = objectUrl(accountId, params.bucket, params.key);
  const url = new URL(rawUrl);
  url.searchParams.set("X-Amz-Expires", String(expiresSec));

  const signed = await client.sign(url.toString(), {
    method: "PUT",
    headers: {
      "content-type": params.contentType,
      "content-length": String(params.contentLength),
    },
    aws: {
      signQuery: true,
      allHeaders: true,
    },
  });

  return signed.url;
}

export async function presignGet(params: {
  bucket?: string;
  key: string;
  expiresSec?: number;
  filename?: string;
}): Promise<string> {
  const { client, accountId } = getR2Client();
  const bucket = params.bucket ?? env.R2_BUCKET_PRIVATE;
  if (!bucket) {
    throw new AppError("NOT_CONFIGURED");
  }
  const expiresSec = params.expiresSec ?? 600;
  const rawUrl = objectUrl(accountId, bucket, params.key);
  const url = new URL(rawUrl);
  url.searchParams.set("X-Amz-Expires", String(expiresSec));
  if (params.filename) {
    url.searchParams.set(
      "response-content-disposition",
      `attachment; filename="${params.filename.replace(/"/g, "")}"`,
    );
  }

  const signed = await client.sign(url.toString(), {
    method: "GET",
    aws: {
      signQuery: true,
    },
  });

  return signed.url;
}

export async function headObject(
  bucket: string,
  key: string,
): Promise<{ size: number; contentType: string } | null> {
  const { client, accountId } = getR2Client();
  const url = objectUrl(accountId, bucket, key);

  const res = await client.fetch(url, {
    method: "HEAD",
    signal: AbortSignal.timeout(8000),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`R2 headObject failed with status ${res.status}`);
  }

  const len = res.headers.get("content-length");
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";

  return {
    size: len ? parseInt(len, 10) : 0,
    contentType,
  };
}

export async function putObject(
  bucket: string,
  key: string,
  body: BodyInit,
  contentType: string,
): Promise<void> {
  const { client, accountId } = getR2Client();
  const url = objectUrl(accountId, bucket, key);

  const res = await client.fetch(url, {
    method: "PUT",
    body,
    headers: {
      "content-type": contentType,
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`R2 putObject failed with status ${res.status}`);
  }
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  const { client, accountId } = getR2Client();
  const url = objectUrl(accountId, bucket, key);

  const res = await client.fetch(url, {
    method: "DELETE",
    signal: AbortSignal.timeout(8000),
  });

  if (res.status === 404 || res.ok) {
    return;
  }

  throw new Error(`R2 deleteObject failed with status ${res.status}`);
}

export function publicUrl(key: string): string {
  const base = (env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return base ? `${base}/${cleanKey}` : `/${cleanKey}`;
}
