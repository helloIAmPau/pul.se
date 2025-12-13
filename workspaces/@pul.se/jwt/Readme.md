# JWT module

JWT keys must be generate using
```bash
openssl genrsa -out ./private.key 4096
openssl rsa -in private.key -pubout -outform PEM -out public.key
```

then each key should be saved into env file in base64 using
```bash
base64 private.key | tr -d '\n'
base64 public.key | tr -d '\n'
```
