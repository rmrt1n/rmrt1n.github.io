(ns acme.util
  (:require
   [hiccup2.core :as h]
   [next.jdbc :as jdbc]
   [ring.util.response :as res])
  (:import java.util.Base64))

(defn setup-db
  [db]
  (jdbc/execute-one!
   db
   ["create table if not exists bookmarks (
       bookmark_id text primary key not null,
       url text not null,
       created_at datetime default (unixepoch()) not null
     )"]))

(defn base64-encode
  [s]
  (.encodeToString (Base64/getEncoder) (.getBytes s)))

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
