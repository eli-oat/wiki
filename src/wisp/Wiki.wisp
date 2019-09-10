;;; Wiki.wisp --- Static wiki engine
;; Author: eli_oat
;;; Commentary:
;;; A relatively straight-forward (re)implementation of a static wiki engine
;;; Code:

(def *database-url* "https://couch.eli.li/wiki/f2b82f8993291328f9de654842002bd6")

($.ajax {
         :url *database-url*
         :async true
         :contentType "application/json"
         :dataType "json"
         :type "GET"
         :success (fn
                    [data] (handle-response-success data))
         :error (fn
                  [response] (handle-response-error response))})

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

(defn silly-test
  "testing forEach loops THIS WORKS! but is very un-lisp-like"
  [page-data] (.forEach page-data
               (fn [one-page] (log-to-console (get one-page :title)))))

;;; Wiki.wisp ends here
