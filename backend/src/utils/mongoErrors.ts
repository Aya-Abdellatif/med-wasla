export type MongoDuplicateError = {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};

export const isMongoDuplicateKeyError = (err: unknown): err is MongoDuplicateError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as MongoDuplicateError).code === 11000
  );
};

export const getDuplicateKeyMessage = (err: MongoDuplicateError): string => {
  const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined;

  if (field === "email") return "This email is already registered";
  if (field === "licenseNumber") return "This license number is already registered";
  return "A record with this information already exists";
};
