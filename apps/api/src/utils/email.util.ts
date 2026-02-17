export const getEmailPrefix = (email: string): string => {
  return email.split("@")[0] ?? "";
};
