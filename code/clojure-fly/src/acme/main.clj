(ns acme.main
  (:require
   [acme.handler :as handler]
   [acme.util :as util]
   [aero.core :as aero]
   [clojure.java.io :as io]
   [integrant.core :as ig]
   [next.jdbc :as jdbc]
   [ring.adapter.jetty :as jetty])
  (:gen-class))

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

(defn -main [& _]
  (-> (read-config) ig/expand ig/init))
