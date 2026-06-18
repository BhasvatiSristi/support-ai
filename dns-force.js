const dns = require("dns");

console.log("Servers:", dns.getServers());

dns.setServers(["8.8.8.8"]);

console.log("After setServers:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.cluster0.9vag8j2.mongodb.net",
  (err, records) => {
    console.log("ERR:", err);
    console.log("RECORDS:", records);
  }
);