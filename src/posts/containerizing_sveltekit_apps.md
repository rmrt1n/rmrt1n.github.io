---
title: Containerizing Sveltekit Apps
date: "2021-10-07"
---

Some of the things I've been learning recently are web development and devops, 
so I thought I'd write about some of it in this blog. I started a 
[Sveltekit](https://kit.svelte.dev) [project](https://github.com/rmrt1n/goat) 
recently, and wanted to apply some of the devops concepts I've learned, like 
automation and CI/CD. It's still a work in progress, and I'm planning to add 
more features like a continuous delivery pipeline to aws or automated tests.

I'm starting to use containers more these days. They have all the necessary 
dependencies for an app, so I don't have to manually install them and bloat my 
machine. Most of the projects I've done in the past don't use any external 
libraries (because most of them are C programs), so I had some difficulties when 
trying to write the Dockerfile for this one.

I wanted to try using containers during the development process. It's something 
I thought wasn't doable, but after some reading I realized it was possible. At 
first I thought I needed to write 2 Dockerfiles, one for development and one 
without the dev dependencies for production. I turns out that just one is enough, 
by using multi staged builds. With multi stage builds, you break the image into 
individual stages. The first stage could be to setup the base environment, and 
after that could be the testing or building stages. When building, you can 
target a specific stage, e.g. `docker build -t . --target <stage>`.

### Build Stages

I split my Dockerfile into 3 stages:
- `base`: for setting up the base image and installing dependencies
- `build`: for building the application and removing unneeded packages
- `prod`: the production image with a smaller base image

### Project Structure
The directory structure of the project looks like this:
```sh-session
$ tree -aI '.git|.svelte-kit|node_modules' -L 2
.
├── src
│   ├── lib
│   ├── routes
│   ├── app.html
│   ├── global.d.ts
│   ├── hooks.js
│   └── tailwind.css
├── static
│   └── favicon.png
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── jsconfig.json
├── LICENSE
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── .prettierrc
├── README.md
├── svelte.config.js
└── tailwind.config.cjs

4 directories, 21 files
```

### Dockerfile
The complete Dockerfile looks like this:
```docker
# Dockerfile
# setup base image
FROM mhart/alpine-node:14.17 AS base
WORKDIR /app
COPY package*.json .
RUN npm ci

# building stage
FROM base AS build
COPY . .
RUN npm run build
RUN npm prune --production

# production image
FROM mhart/alpine-node:slim-14.17 AS prod
WORKDIR /app
EXPOSE 3000
COPY --from=build /app/build .
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "index.js"]
```

The first step copies `package.json` and `package-lock.json` to the image and 
installs the packages. This is the stage that will be used during development, 
but you need to set several flags when running the container.

The second step copies the source code and builds it. Then it runs `npm prune 
--production`, which removes all of the dev dependencies. The app is then copied 
to the last stage, which uses a smaller base image.

### Ignoring some files
When copying files to the container, there are some files and directories that 
are better ignored, especially the `node_modules` directory. We can specify these 
files in the `.dockerignore` file.
```docker
# .dockerignore
node_modules
build
.git*
npm-debug.log
Dockerfile*
docker-compose*
.dockerignore
README.md
LICENSE
.husky
```

### Development setup
To be able to have the local changes take effect directly in the container, you 
need to mount the files into a volume. You also have to specify the command to 
run as well as export the ports. To build the image only up to the base stage, 
run:
```sh-session
$ docker build . -t dev-app --target base
```

Then run the container using this command:
```sh-session
$ docker run -it \
    -v .:/app \
    -v /app/node_modules \
    -p 3000:3000 \
    dev-app \
    npm run dev -- --host
```

Explanation:  
- `-it`: runs the container interactively
- `-v .:/app`: mounts the current directory into the container
- `-v /app/node_modules`: prevents the local `node_modules` from being copied to the container
- `-p 3000:3000`: forwards the containers port 3000 to the local machine's port 3000
- `npm run dev -- --host`: the command to start the development server

### Docker Compose
The command to run the container is long. Although you can put it into a shell 
script like `run.sh`, I prefer to use docker compose for this. It uses yaml so 
there's no need to learn a special configuration language. An added benefit to 
using docker compose is adding services to the app is simpler. If you want to 
add a mongodb server, you can just edit the `docker-compose.yml` file.

Anyways, here's the file:
```docker
services:
  app:
    depends_on: mongodb
    build:
      context: .
      target: base
    command: npm run dev -- --host
    ports:
      - 3000:3000
    volumes:
      - .:/app
      - /app/node_modules
```

Then start the service with `docker-compose up`. To stop it, run `docker-compose down`.

### Conclusion
So that's about it. This took me around 3 days to figure out, but I finally got 
it working. I might write about this again when I get to deploy the application. 
For any comments or suggestions please send me an [email](mailto:ryan.mrtinn@gmail.com).

