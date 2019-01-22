Use https for development purpose, based on the original 
[github repo](https://github.com/RubenVermeulen/generate-trusted-ssl-certificate).

# Generate a Trusted SSL Certificate

This repository contains a script that will generate a trusted ssl certificate which can be used for local software development.

```
bash generate.sh
```

## Configuration

You can adjust the `[dn]` part of the `openssl-custom.cnf` file to whatever you prefer.

```
[dn]
C = <COUNTRY>
ST = <STATE>
L = <LOCALITY / CITY>
O = <ORGANIZATION>
OU = <ORGANIZATION_UNIT>
emailAddress = <EMAIL_ADDRESS>
CN = <HOSTNAME / IP_ADDRESS>
``` 
