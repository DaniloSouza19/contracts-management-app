# contracts-management-app

## dev
```
yarn dev
```

## build and deploy
**Require [docker](https://docs.docker.com)**

1)set `.env` `VITE_API_URL` variable

2)build image 
  ```
  docker build -t react-nginx .
  ```
3)run image power by ngnix
  ```
  docker run --rm -it -d -p 8080:80 react-nginx
  ```