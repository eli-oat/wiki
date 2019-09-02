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

(defn annoy-the-human
  "Wrapper around alert()"
  [annoying-data] (alert annoying-data))

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
  [data] (log-to-console (get [data] "error")))


;; NAIVE implementation -- needs to be tested, and probs destoryed
(defn js-for-each
  "Wrapper around JavaScript's .forEach method"
  [array-to-loop function-to-perform] (.forEach array-to-loop
                                                (do
                                                  (function-to-perform item-of-array))))


(defn silly-test
  "testing forEach loops THIS WORKS!"
  [page-data] (.forEach page-data
               (fn [one-page] (log-to-console (get one-page :title)))))
