(ns user
  (:require
   [acme.main :as main]
   [clojure.tools.namespace.repl :as repl]
   [integrant.core :as ig]
   [integrant.repl :refer [set-prep! go halt reset reset-all]]))

(set-prep!
 (fn []
   (ig/expand (main/read-config))))

(repl/set-refresh-dirs "src" "resources")

(comment
  (go)
  (halt)
  (reset)
  (reset-all))
