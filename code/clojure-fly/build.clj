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
