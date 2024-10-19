(ns acme.handler
  (:require
   [acme.util :as util]
   [next.jdbc :as jdbc]
   [next.jdbc.sql :as sql]
   [reitit.ring :as ring]
   [ring.middleware.params :refer [wrap-params]]
   [ring.util.response :as res]))

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

(defn index-action
  [req]
  (try
    (let [{:keys [db form-params]} req
          value (get form-params "url")]
      (sql/insert! db :bookmarks {:bookmark_id (random-uuid) :url value})
      (res/redirect "/" 303))
    (catch Exception e
      (util/server-error e))))

(def routes
  [["/" {:get  index-page
         :post index-action}]])

(defn components-middleware
  [components]
  (let [{:keys [database auth]} components]
    (fn [handler]
      (fn [req]
        (handler (assoc req
                        :db database
                        :auth auth))))))

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

(defn handler
  [opts]
  (ring/ring-handler
   (ring/router routes)
   (ring/routes
    (ring/redirect-trailing-slash-handler)
    (ring/create-resource-handler {:path "/"})
    (ring/create-default-handler))
   {:middleware [(components-middleware opts)
                 wrap-basic-auth
                 wrap-params]}))
