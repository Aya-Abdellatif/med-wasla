import crypto from "crypto";

const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export default generateOtp;