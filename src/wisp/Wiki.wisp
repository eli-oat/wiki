;; FIXME: will need a way to handle .env stuff so that navigo works

(def *database-url* "https://luxurious-binder.glitch.me/wiki.json")

($.ajax {
         :url *database-url*
         :async true
         :contentType "application/json"
         :dataType "json"
         :type "GET"
         :success (fn [data] (handle-response-success data))
         :error (fn [response] (handle-response-error response))})

(defn handle-response-success
  "Do this if the ajax request looks good"
  [data] (log-to-console (silly-test (just-the-pages data)))) 

(defn log-to-console
  "Just like console.log...because it *is* console.log"
  [data-to-log] (.log console data-to-log))

(defn judeged-by-its-cover
  "Get the wiki's title"
  [data] (get data :title))

(defn just-the-pages
  "Get just the pages"
  [data] (get data :pages))

(defn find-parent
  "Get a page's parent"
  [page-data] (get page-data :parentPage))

(defn handle-response-error
  "Display error message if the ajax request fails"
  [data] (.log console (get [data] "error")))


(defn silly-test
  "testing forEach loops THIS WORKS!"
  [page-data] (page-data.forEach
               (fn [one-page] (log-to-console (get one-page :title)))))


