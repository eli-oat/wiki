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
  [data] (.log console data))

(defn handle-response-error
  "Display error message if the ajax request fails"
  [data] (.log console (get [data] "error")))