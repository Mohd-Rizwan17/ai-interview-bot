export const getDeviceName = (userAgent = "") => {
  const device = /mobile|android|iphone|ipad/i.test(userAgent)
    ? "Mobile"
    : "Desktop";

  let browser = "Browser";
  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/chrome\//i.test(userAgent)) browser = "Chrome";
  else if (/safari\//i.test(userAgent)) browser = "Safari";

  return `${device} · ${browser}`;
};
