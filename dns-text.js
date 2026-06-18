const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.9vag8j2.mongodb.net",
  (err, records) => {
    console.log("ERR:", err);
    console.log("RECORDS:", records);
  }
);