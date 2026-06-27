export interface ApiError {
  error: string;
}

export interface SendOtpResponse {
  message: string;
  otp?: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user: { id: string; phoneNumber: string; name?: string };
}

export interface WorkerResponse {
  worker: {
    id: string;
    workerType: string;
    name: string;
    phoneNumber: string;
  };
}

export interface WaitlistResponse {
  message: string;
}
