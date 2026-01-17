import { StatusCode } from "@/shared/types/status-code";

class FetchError extends Error {
  info?: Error;
  status: StatusCode;

  constructor(status: StatusCode, message?: string) {
    super(message);
    this.status = status;
  }
}

export default FetchError;
