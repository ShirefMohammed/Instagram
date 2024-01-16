To Generate Random Secret Key Use The Following Command:
openssl rand -base64 32

or on node environment
run => require("node:crypto").randomBytes(32).toString("hex");
