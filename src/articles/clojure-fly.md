---
title: Fast Clojure Deployments with Fly.io
tags:
  - clojure
  - deployment
  - java
  - networking
  - web-development
published: 2024-10-20
updated: 2024-10-20
---

I've been building a Clojure web application and reached the point where I needed to deploy it to a live server. The app itself is nowhere near finished yet but I wanted to make sure that it would work in a production environment. I needed a way to deploy the app without requiring much work on my end.

After some consideration, I went with [Fly.io](https://fly.io). It's a service that allows you to deploy applications packaged as Docker images on lightweight virtual machines.[^1] In my experience it's easy to use and quick to set up. One downside of Fly is that it doesn't have a free tier, but since I don't plan on leaving the app deployed, it barely costs me anything.

I found some helpful tips while trying to deploy my app, so I thought I'd share them here.

Personally, I like technical articles that cover a project from start to finish, so this post will also include the development (of a demo app) in addition to the deployment process. If you just want to read about the deployment, feel free to [skip ahead](#packaging-the-application). I'll also assume you have some familiarity with Clojure and some of its libraries.[^2]

## Project Setup

In this post, we'll be building a barebones bookmarks manager for the demo app. Users can log in using [basic authentication](https://roadmap.sh/guides/http-basic-authentication), view all bookmarks, and create a new bookmark. It'll be a traditional multi-page web app and the data will be stored in a [SQLite](https://sqlite.org) database.

Here's an overview of the project's starting directory structure:

```plaintext
.
├── dev
│   └── user.clj
├── resources
│   └── config.edn
├── src
│   └── acme
│       └── main.clj
└── deps.edn
```

And the libraries we're going to use. If you have some Clojure experience or have used [Kit](https://kit-clj.github.io/), you're probably already familiar with all the libraries listed below.[^3]

```clojure
;; deps.edn
{:paths ["src" "resources"]
 :deps {org.clojure/clojure               {:mvn/version "1.12.0"}
        aero/aero                         {:mvn/version "1.1.6"}
        integrant/integrant               {:mvn/version "0.11.0"}
        ring/ring-jetty-adapter           {:mvn/version "1.12.2"}
        metosin/reitit-ring               {:mvn/version "0.7.2"}
        com.github.seancorfield/next.jdbc {:mvn/version "1.3.939"}
        org.xerial/sqlite-jdbc            {:mvn/version "3.46.1.0"}
        hiccup/hiccup                     {:mvn/version "2.0.0-RC3"}}
 :aliases
 {:dev {:extra-paths ["dev"]
        :extra-deps  {nrepl/nrepl    {:mvn/version "1.3.0"}
                      integrant/repl {:mvn/version "0.3.3"}}
        :main-opts   ["-m" "nrepl.cmdline" "--interactive" "--color"]}}}
```

I use [Aero](https://github.com/juxt/aero) and [Integrant](https://github.com/weavejester/integrant) for my system configuration (more on this in the next section), [Ring](https://github.com/ring-clojure/ring) with the Jetty adaptor for the web server, [Reitit](https://github.com/metosin/reitit) for routing, [next.jdbc](https://github.com/seancorfield/next-jdbc/) for database interaction, and [Hiccup](https://github.com/weavejester/hiccup/) for rendering HTML. From what I've seen, this is a popular "library combination" for building web apps in Clojure.[^4]

The `user` namespace in `dev/user.clj` contains helper functions from [Integrant-repl](https://github.com/weavejester/integrant-repl) to start, stop, and restart the Integrant system.

```clojure
;; dev/user.clj
(ns user
  (:require
   [acme.main :as main]
   [clojure.tools.namespace.repl :as repl]
   [integrant.core :as ig]
   [integrant.repl :refer [set-prep! go halt reset reset-all]]))

(set-prep!
 (fn []
   (ig/expand (main/read-config)))) ;; we'll implement this soon

(repl/set-refresh-dirs "src" "resources")

(comment
  (go)
  (halt)
  (reset)
  (reset-all))
```

## Systems and Configuration

If you're new to Integrant or other dependency injection libraries like [Component](https://github.com/stuartsierra/component), I'd suggest reading ["How to Structure a Clojure Web"](https://mccue.dev/pages/12-7-22-clojure-web-primer). It's a great explanation about the reasoning behind these libraries. Like most Clojure apps that use Aero and Integrant, my system configuration lives in a `.edn` file. I usually name mine as `resources/config.edn`. Here's what it looks like:

```clojure
;; resources/config.edn
{:server
 {:port #long #or [#env PORT 8080]
  :host #or [#env HOST "0.0.0.0"]
  :auth {:username #or [#env AUTH_USER "john.doe@email.com"]
         :password #or [#env AUTH_PASSWORD "password"]}}

 :database
 {:dbtype "sqlite"
  :dbname #or [#env DB_DATABASE "database.db"]}}
```

In production, most of these values will be set using environment variables. During local development, the app will use the hard-coded default values. We don't have any sensitive values in our config (e.g., API keys), so it's fine to commit this file to version control. If there are such values, I usually put them in another file that's not tracked by version control and including them in the config file using Aero's `#include` reader tag.

This config file is then "expanded" into the Integrant system map using the `expand-key` method:

```clojure
;; src/acme/main.clj
(ns acme.main
  (:require
   [aero.core :as aero]
   [clojure.java.io :as io]
   [integrant.core :as ig]))

(defn read-config
  []
  {:system/config (aero/read-config (io/resource "config.edn"))})

(defmethod ig/expand-key :system/config
  [_ opts]
  (let [{:keys [server database]} opts]
    {:server/jetty (assoc server :handler (ig/ref :handler/ring))
     :handler/ring {:database (ig/ref :database/sql)
                    :auth     (:auth server)}
     :database/sql database}))
```

The system map is created in code instead of being in the configuration file. This makes refactoring your system simpler as you only need to change this method while leaving the config file (mostly) untouched.[^5]

My current approach to Integrant + Aero config files is mostly inspired by the blog post ["Rethinking Config with Aero & Integrant"](https://robjohnson.dev/posts/aero-and-integrant/) and Laravel's configuration. The config file follows a similar structure to Laravel's config files and contains the app configurations without describing the structure of the system. Previously I had a key for each Integrant component, which led to the config file being littered with `#ig/ref` and more difficult to refactor.

Also, if you haven't already, start a REPL and connect to it from your editor. Run `clj -M:dev` if your editor doesn't automatically start a REPL. Next, we'll implement the `init-key` and `halt-key!` methods for each of the components:

```clojure
;; src/acme/main.clj
(ns acme.main
  (:require
   ;; ...
   [acme.handler :as handler]
   [acme.util :as util])
   [next.jdbc :as jdbc]
   [ring.adapter.jetty :as jetty]))
;; ...

(defmethod ig/init-key :server/jetty
  [_ opts]
  (let [{:keys [handler port]} opts
        jetty-opts (-> opts (dissoc :handler :auth) (assoc :join? false))
        server     (jetty/run-jetty handler jetty-opts)]
    (println "Server started on port " port)
    server))

(defmethod ig/halt-key! :server/jetty
  [_ server]
  (.stop server))

(defmethod ig/init-key :handler/ring
  [_ opts]
  (handler/handler opts))

(defmethod ig/init-key :database/sql
  [_ opts]
  (let [datasource (jdbc/get-datasource opts)]
    (util/setup-db datasource)
    datasource))
```

The `setup-db` function creates the required tables in the database if they don't exist yet. This works fine for database migrations in small projects like this demo app, but for larger projects, consider using libraries such as [Migratus](https://github.com/yogthos/migratus) (my preferred library) or [Ragtime](https://github.com/weavejester/ragtime).

```clojure
;; src/acme/util.clj
(ns acme.util 
  (:require
   [next.jdbc :as jdbc]))

(defn setup-db
  [db]
  (jdbc/execute-one!
   db
   ["create table if not exists bookmarks (
       bookmark_id text primary key not null,
       url text not null,
       created_at datetime default (unixepoch()) not null
     )"]))
```

For the server handler, let's start with a simple function that returns a "hi world" string.

```clojure
;; src/acme/handler.clj
(ns acme.handler
  (:require
   [ring.util.response :as res]))

(defn handler
  [_opts]
  (fn [req]
    (res/response "hi world")))
```

Now all the components are implemented. We can check if the system is working properly by evaluating `(reset)` in the `user` namespace. This will reload your files and restart the system. You should see this message printed in your REPL:

```plaintext
:reloading (acme.util acme.handler acme.main)
Server started on port  8080
:resumed
```

If we send a request to `http://localhost:8080/`, we should get "hi world" as the response:

```bash
__$ curl localhost:8080/
hi world
```

Nice! The system is working correctly. In the next section, we'll implement routing and our business logic handlers.

## Routing, Middleware, and Route Handlers

First, let's set up a ring handler and router using Reitit. We only have one route, the index `/` route that'll handle both GET and POST requests.

```clojure
;; src/acme/handler.clj
(ns acme.handler
  (:require
   [reitit.ring :as ring]))

(def routes
  [["/" {:get  index-page
         :post index-action}]])

(defn handler
  [opts]
  (ring/ring-handler
   (ring/router routes)
   (ring/routes
    (ring/redirect-trailing-slash-handler)
    (ring/create-resource-handler {:path "/"})
    (ring/create-default-handler))))
```

We're including some useful middleware:

- `redirect-trailing-slash-handler` to resolve routes with trailing slashes,
- `create-resource-handler` to serve static files, and
- `create-default-handler` to handle common 40x responses.

### Implementing the Middlewares

If you remember the `:handler/ring` from earlier, you'll notice that it has two dependencies, `database` and `auth`. Currently, they're inaccessible to our route handlers. To fix this, we can inject these components into the Ring request map using a middleware function.

```clojure
;; src/acme/handler.clj
;; ...

(defn components-middleware
  [components]
  (let [{:keys [database auth]} components]
    (fn [handler]
      (fn [req]
        (handler (assoc req
                        :db database
                        :auth auth))))))
;; ...
```

The `components-middleware` function takes in a map of components and creates a middleware function that "assocs" each component into the request map.[^6] If you have more components such as a Redis cache or a mail service, you can add them here.

We'll also need a middleware to handle HTTP basic authentication.[^7] This middleware will check if the username and password from the request map matche the values in the `auth` map injected by `components-middleware`. If they match, then the request is authenticated and the user can view the site.

```clojure
;; src/acme/handler.clj
(ns acme.handler
  (:require
   ;; ...
   [acme.util :as util]
   [ring.util.response :as res]))
;; ...

(defn wrap-basic-auth
  [handler]
  (fn [req]
    (let [{:keys [headers auth]} req
          {:keys [username password]} auth
          authorization (get headers "authorization")
          correct-creds (str "Basic " (util/base64-encode
                                       (format "%s:%s" username password)))]
      (if (and authorization (= correct-creds authorization))
        (handler req)
        (-> (res/response "Access Denied")
            (res/status 401)
            (res/header "WWW-Authenticate" "Basic realm=protected"))))))
;; ...
```

A nice feature of Clojure is that interop with the host language is easy. The `base64-encode` function is just a thin wrapper over Java's `Base64.Encoder`:

```clojure
;; src/acme/util.clj
(ns acme.util
   ;; ...
  (:import java.util.Base64))

(defn base64-encode
  [s]
  (.encodeToString (Base64/getEncoder) (.getBytes s)))
```

Finally, we need to add them to the router. Since we'll be handling form requests later, we'll also bring in Ring's `wrap-params` middleware.

```clojure
;; src/acme/handler.clj
(ns acme.handler
  (:require
   ;; ...
   [ring.middleware.params :refer [wrap-params]]))
;; ...

(defn handler
  [opts]
  (ring/ring-handler
   ;; ...
   {:middleware [(components-middleware opts)
                 wrap-basic-auth
                 wrap-params]}))
```


### Implementing the Route Handlers

We now have everything we need to implement the route handlers or the business logic of the app. First, we'll implement the `index-page` function which renders a page that:

1. Shows all of the user's bookmarks in the database, and
2. Shows a form that allows the user to insert new bookmarks into the database

```clojure
;; src/acme/handler.clj
(ns acme.handler
  (:require
   ;; ...
   [next.jdbc :as jdbc]
   [next.jdbc.sql :as sql]))
;; ...

(defn template
  [bookmarks]
  [:html
   [:head
    [:meta {:charset "utf-8"
            :name    "viewport"
            :content "width=device-width, initial-scale=1.0"}]]
   [:body
    [:h1 "bookmarks"]
    [:form {:method "POST"}
     [:div
      [:label {:for "url"} "url "]
      [:input#url {:name "url"
                   :type "url"
                   :required true
                   :placeholer "https://en.wikipedia.org/"}]]
     [:button "submit"]]
    [:p "your bookmarks:"]
    [:ul
     (if (empty? bookmarks)
       [:li "you don't have any bookmarks"]
       (map
        (fn [{:keys [url]}]
          [:li
           [:a {:href url} url]])
        bookmarks))]]])

(defn index-page
  [req]
  (try
    (let [bookmarks (sql/query (:db req)
                               ["select * from bookmarks"]
                               jdbc/unqualified-snake-kebab-opts)]
      (util/render (template bookmarks)))
    (catch Exception e
      (util/server-error e))))
;; ...
```

Database queries can sometimes throw exceptions, so it's good to wrap them in a try-catch block. I'll also introduce some helper functions:

```clojure
;; src/acme/util.clj
(ns acme.util
  (:require
   ;; ...
   [hiccup2.core :as h]
   [ring.util.response :as res])
  (:import java.util.Base64))
;; ...

(defn preprend-doctype
  [s]
  (str "<!doctype html>" s))

(defn render
  [hiccup]
  (-> hiccup h/html str preprend-doctype res/response (res/content-type "text/html")))

(defn server-error
  [e]
  (println "Caught exception: " e)
  (-> (res/response "Internal server error")
      (res/status 500)))
```

`render` takes a hiccup form and turns it into a ring response, while `server-error` takes an exception, logs it, and returns a 500 response.

Next, we'll implement the `index-action` function:

```clojure
;; src/acme/handler.clj
;; ...

(defn index-action
  [req]
  (try
    (let [{:keys [db form-params]} req
          value (get form-params "url")]
      (sql/insert! db :bookmarks {:bookmark_id (random-uuid) :url value})
      (res/redirect "/" 303))
    (catch Exception e
      (util/server-error e))))
;; ...
```

This is an implementation of a typical [post/redirect/get](https://en.wikipedia.org/wiki/Post/Redirect/Get) pattern. We get the value from the URL form field, insert a new row in the database with that value, and redirect back to the index page. Again, we're using a try-catch block to handle possible exceptions from the database query.

That should be all of the code for the controllers. If you reload your REPL and go to `http://localhost:8080`, you should see something that looks like this after logging in:

![Screnshot of the application](/assets/images/clojure-fly-1.png)

The last thing we need to do is to update the main function to start the system:

```clojure
;; src/acme/main.clj
;; ...

(defn -main [& _]
  (-> (read-config) ig/expand ig/init))
```

Now, you should be able to run the app using `clj -M -m acme.main`. That's all the code needed for the application. In the next section, we'll package the app into a Docker image to deploy to Fly.

## Packaging the Application

While there are [many ways to package a Clojure application](https://www.metosin.fi/blog/packaging-clojure), Fly.io specifically requires a Docker image. There are two approaches to doing this:

1. Build an uberjar and run it using Java in the container, or
2. Load the source code and run it using Clojure in the container

Both are valid approaches. I prefer the first since its only dependency is the JVM. We'll use the [tools.build]( https://github.com/clojure/tools.build) library to build the uberjar. Check out the [official guide](https://clojure.org/guides/tools_build) for more information on building Clojure programs. Since it's a library, to use it we can add it to our `deps.edn` file with an alias:

```clojure
;; deps.edn
{;; ...
 :aliases
 {;; ...
  :build {:extra-deps {io.github.clojure/tools.build 
                       {:git/tag "v0.10.5" :git/sha "2a21b7a"}}
          :ns-default build}}}
```

Tools.build expects a `build.clj` file in the root of the project directory, so we'll need to create that file. This file contains the instructions to build artefacts, which in our case is a single uberjar. There are many great examples of `build.clj` files on the web, including from the official documentation. For now, you can copy+paste this file into your project.

```clojure
;; build.clj
(ns build
  (:require
   [clojure.tools.build.api :as b]))

(def basis (delay (b/create-basis {:project "deps.edn"})))
(def src-dirs ["src" "resources"])
(def class-dir "target/classes")

(defn uber
  [_]
  (println "Cleaning build directory...")
  (b/delete {:path "target"})

  (println "Copying files...")
  (b/copy-dir {:src-dirs   src-dirs
               :target-dir class-dir})

  (println "Compiling Clojure...")
  (b/compile-clj {:basis      @basis
                  :ns-compile '[acme.main]
                  :class-dir  class-dir})

  (println "Building Uberjar...")
  (b/uber {:basis     @basis
           :class-dir class-dir
           :uber-file "target/standalone.jar"
           :main      'acme.main}))
```

To build the project, run `clj -T:build uber`. This will create the uberjar `standalone.jar` in the `target` directory. The `uber` in `clj -T:build uber` refers to the `uber` function from `build.clj`. Since the build system is a Clojure program, you can customise it however you like. If we try to run the uberjar now, we'll get an error:

```bash
# build the uberjar
__$ clj -T:build uber
Cleaning build directory...
Copying files...
Compiling Clojure...
Building Uberjar...

# run the uberjar
__$ java -jar target/standalone.jar
Error: Could not find or load main class acme.main
Caused by: java.lang.ClassNotFoundException: acme.main
```

This error occurred because the Main class that is required by Java isn't built. To fix this, we need to add the `:gen-class` directive in our main namespace. This will instruct Clojure to create the Main class from the `-main` function.

```clojure
;; src/acme/main.clj
(ns acme.main
  ;; ...
  (:gen-class))
;; ...
```

If you rebuild the project and run `java -jar target/standalone.jar` again, it should work perfectly. Now that we have a working build script, we can write the Dockerfile:

```dockerfile
# Dockerfile
# install additional dependencies here in the base layer
# separate base from build layer so any additional deps installed are cached
FROM clojure:temurin-21-tools-deps-bookworm-slim AS base

FROM base as build
WORKDIR /opt
COPY . .
RUN clj -T:build uber

FROM eclipse-temurin:21-alpine AS prod
COPY --from=build /opt/target/standalone.jar /
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "standalone.jar"]
```

It's a [multi-stage Dockerfile](https://www.docker.com/blog/multi-stage-builds/). We use the official Clojure Docker image as the layer to build the uberjar. Once it's built, we copy it to a smaller Docker image that only contains the Java runtime.[^8] By doing this, we get a smaller container image as well as a faster Docker build time because the layers are better cached.

That should be all for packaging the app. We can move on to the deployment now.

## Deploying with Fly.io

First things first, you'll need to [install `flyctl`](https://fly.io/docs/flyctl/install/), Fly's CLI tool for interacting with their platform. Create [a Fly.io account](https://fly.io/app/sign-up) if you haven't already. Then run `fly auth login` to authenticate `flyctl` with your account.

Next, we'll need to create a new [Fly App](https://fly.io/docs/apps/overview/):

```bash
__$ fly app create
? Choose an app name (leave blank to generate one): 
automatically selected personal organization: Ryan Martin
New app created: blue-water-6489
```

Another way to do this is with the `fly launch` command, which automates a lot of the app configuration for you. We have some steps to do that are not done by `fly launch`, so we'll be configuring the app manually. I also already have a `fly.toml` file ready that you can straight away copy to your project.

```toml
# fly.toml
# replace these with your app and region name
# run `fly platform regions` to get a list of regions
app = 'blue-water-6489' 
primary_region = 'sin'

[env]
  DB_DATABASE = "/data/database.db"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

[mounts]
  source = "data"
  destination = "/data"
  initial_sie = 1

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
  cpus = 1
  cpu_kind = "shared"
```

These are mostly the default configuration values with some additions. Under the `[env]` section, we're setting the SQLite database location to `/data/database.db`. The `database.db` file itself will be stored in a persistent [Fly Volume](https://fly.io/docs/volumes/overview/) mounted on the `/data` directory. This is specified under the `[mounts]` section. Fly Volumes are similar to regular Docker volumes but are designed for Fly's micro VMs.

We'll need to set the `AUTH_USER` and `AUTH_PASSWORD` environment variables too, but not through the `fly.toml` file as these are sensitive values. To securely set these credentials with Fly, we can set them as [app secrets](https://fly.io/docs/apps/secrets/). They're stored encrypted and will be automatically injected into the app at boot time.

```bash
__$ fly secrets set AUTH_USER=hi@ryanmartin.me AUTH_PASSWORD=not-so-secure-password
Secrets are staged for the first deployment
```

With this, the configuration is done and we can deploy the app using `fly deploy`:

```bash
__$ fly deploy
# ...
Checking DNS configuration for blue-water-6489.fly.dev

Visit your newly deployed app at https://blue-water-6489.fly.dev/
```

The first deployment will take longer since it's building the Docker image for the first time. Subsequent deployments should be faster due to the cached image layers. You can click on the link to view the deployed app, or you can also run `fly open` which will do the same thing. Here's the app in action:

![The app in action](/assets/images/clojure-fly-2.webp)

If you made additional changes to the app or `fly.toml`, you can redeploy the app using the same command, `fly deploy`. The app is configured to auto stop/start, which helps to cut costs when there's not a lot of traffic to the site. If you want to take down the deployment, you'll need to delete the app itself using `fly app destroy <your app name>`.

## Adding a Production REPL

This is an interesting topic in the Clojure community, with varying opinions on whether or not it's a good idea. Personally I find having a REPL connected to the live app helpful, and I often use it for debugging and running queries on the live database.[^9] Since we're using SQLite, we don't have a database server we can directly connect to, unlike Postgres or MySQL.

If you're brave, you can even restart the app directly without redeploying from the REPL. You can easily go wrong with it, which is why some prefer to not use it.

For this project, we're gonna add a [socket REPL](https://clojure.org/reference/repl_and_main#_launching_a_socket_server). It's very simple to add (you just need to add a JVM option) and it doesn't require additional dependencies like [nREPL](https://nrepl.org/). Let's update the Dockerfile:

```dockerfile
# Dockerfile
# ...
EXPOSE 7888
ENTRYPOINT ["java", "-Dclojure.server.repl={:port 7888 :accept clojure.core.server/repl}", "-jar", "standalone.jar"]
```

The socket REPL will be listening on port 7888. If we redeploy the app now, the REPL will be started but we won't be able to connect to it. That's because we haven't exposed the service through [Fly proxy](https://fly.io/docs/reference/fly-proxy/). We can do this by adding the socket REPL as a service in the `[services]` section in `fly.toml`.

However, doing this will also expose the REPL port to the public. This means that anyone can connect to your REPL and possibly mess with your app. Instead, what we want to do is to configure the socket REPL as a private service.

By default, all Fly apps in your organisation live in the same [private network](https://fly.io/docs/networking/private-networking/). This private network, called 6PN, connects the apps in your organisation through [Wireguard tunnels](https://www.wireguard.com/) (a VPN) using IPv6. Fly private services aren't exposed to the public internet but can be reached from this private network. We can then use Wireguard to connect to this private network to reach our socket REPL.

Fly VMs are also configured with the hostname `fly-local-6pn`, which maps to its 6PN address. This is analogous to `localhost`, which points to your loopback address `127.0.0.1`. To expose a service to 6PN, all we have to do is bind or serve it to `fly-local-6pn` instead of the usual `0.0.0.0`. We have to update the socket REPL options to:

```dockerfile
# Dockerfile
# ...
ENTRYPOINT ["java", "-Dclojure.server.repl={:port 7888,:address \"fly-local-6pn\",:accept clojure.core.server/repl}", "-jar", "standalone.jar"]
```

After redeploying, we can use the `fly proxy` command to forward the port from the remote server to our local machine.[^10]

```bash
__$ fly proxy 7888:7888
Proxying local port 7888 to remote [blue-water-6489.internal]:7888
```

In another shell, run:

```bash
__$ rlwrap nc localhost 7888
user=>
```

Now we have a REPL connected to the production app! `rlwrap` is used for [readline](https://en.wikipedia.org/wiki/GNU_Readline) functionality, e.g. up/down arrow keys, vi bindings. Of course you can also connect to it from your editor.

## Deploy with GitHub Actions

If you're using [GitHub](https://github.com), we can also set up automatic deployments on pushes/PRs with [GitHub Actions](https://github.com/features/actions). All you need is to create the workflow file:

```yaml
# .github/workflows/fly.yaml
name: Fly Deploy
on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    concurrency: deploy-group
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: {{ '${{ secrets.FLY_API_TOKEN }}' }}

```

To get this to work, you'll need to create a [deploy token](https://fly.io/docs/security/tokens/) from your app's dashboard. Then, in your GitHub repo, create a new repository secret called `FLY_API_TOKEN` with the value of your deploy token. Now, whenever you push to the `main` branch, this workflow will automatically run and deploy your app. You can also manually run the workflow from GitHub because of the `workflow_dispatch` option.

## End

As always, all the code is available [on GitHub](https://github.com/rmrt1n/rmrt1n.github.io/tree/main/code/clojure-fly). Overall, I like how easy and fast it is to get a Clojure app deployed to Fly.io. It's a great platform for deploying side projects or hackathon projects. My side projects are never finished so I don't have any experience yet to share about how well Fly handles real user traffic. Anyway, here is some further reading on deploying Clojure apps:

- [Deploying a Full-Stack Clojure App With Kamal on a Single Server](https://bogoyavlensky.com/blog/deploying-full-stack-clojure-app-with-kamal/)
- [JVM Deployment Options](https://ericnormand.me/article/jvm-deployment-options)
- [Deploying Clojure Like a Seasoned Hobbyist](https://tonitalksdev.com/deploying-clojure-like-a-seasoned-hobbyist)
- [Brave Clojure's Deploy Quest](https://www.braveclojure.com/quests/deploy/)

[^1]: The way Fly.io works under the hood is pretty clever. Instead of running the container image with a runtime like Docker, the image is unpacked and "loaded" into a VM. See [this video explanation](https://www.youtube.com/watch?v=7iypMRKniPU) for more details.
[^2]: If you're interested in learning Clojure, my recommendation is to follow [the official getting started guide](https://clojure.org/guides/getting_started) and join the [Clojurians Slack](https://clojurians.slack.com/). Also, read through this [list of introductory resources](https://gist.github.com/yogthos/be323be0361c589570a6da4ccc85f58f).
[^3]: Kit was a big influence on me when I first started learning web development in Clojure. I never used it directly, but I did use their library choices and project structure as a base for my own projects.
[^4]: There's no "Rails" for the Clojure ecosystem (yet?). The prevailing opinion is to build your own "framework" by composing different libraries together. Most of these libraries are stable and are already used in production by big companies, so don't let this discourage you from doing web development in Clojure!
[^5]: There might be some keys that you add or remove, but the structure of the config file stays the same.
[^6]: "assoc" (associate) is a Clojure slang that means to add or update a key-value pair in a map.
[^7]: For more details on how basic authentication works, check out [the specification](https://www.rfc-editor.org/rfc/rfc7617.html).
[^8]: Here's a cool resource I found when researching Java Dockerfiles: [WhichJDK](https://whichjdk.com). It provides a comprehensive comparison on the different JDKs available and recommendations on which one you should use.
[^9]: Another (non-technically important) argument for live/production REPLs is just because it's cool. Ever since I read the story about [NASA's programmers debugging a spacecraft through a live REPL](https://news.ycombinator.com/item?id=31234338), I've always wanted to try it at least once.
[^10]: If you encounter errors related to Wireguard when running `fly proxy`, you can run `fly doctor` which will hopefully detect issues with your local setup and also suggest fixes for them.
