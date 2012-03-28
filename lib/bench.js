/*global global, chrome */

(function(Q) {
  
  Q.Bench = {

    enabled: true,

    verbose: true,

    stats: {},

    timer: function() {
      var timer;
      try {
        timer = new chrome.Interval();
        timer.start();
        timer = timer.microseconds;
        timer.unit = "microsecond";
      } catch(e) {
        timer = Date.now;
        timer.unit = "ms";
      }
      return timer;
    }(),

    globalTime: null,

    start: function(id, topOnly) {
      if (!this.enabled || !id) {
        return;
      }

      var start, stat, result, recent;

      if (!this.globalTime) this.globalTime = this.timer();
      start = this.timer() - this.globalTime;
      if (!this.stats[id]) this.stats[id] = [];
      stat = this.stats[id];

      if (!stat.length || ((recent = stat[stat.length - 1]) && recent.end)) {
        stat.push({
          start: start,
          calls: [],
          id: id
        }); //single root call
      } else { //recursively called
        if (!topOnly) {
          recent.calls.push({
            start: start,
            id: id
          });
        }
      }

      return id;
    },

    end: function(id) {
      if (!id) {
        return;
      }

      var stat, recent, calls, i, end;

      stat = this.stats[id];
      if (!stat) {
        console.warn("Bench#end was called not in pair with Bench#start; Call Bench#start first!");
        return id;
      }
      recent = stat[stat.length - 1];
      calls = recent.calls;
      end = this.timer() - this.globalTime;

      if (calls.length) { //complete recursively calls
        i = calls.length;
        while (i--) {
          if (calls[i].end) continue;
          calls[i].end = end;
          calls[i].dur = end - calls[i].start;
        }
      } else {
        recent.dur = end - recent.start;
        recent.end = end;
      }

      return id;
    },

    install: function(obj, func, topOnly) {

    },

    reportForCall: function(call) {
      var report = {};

      if (!call.end) {
        console.warn("Benchmark was not finished on #" + call.id);
      }

      report.deep = call.calls.length ? call.calls.length + 1 : 1;
      report.dur = call.dur;
      report.start = call.start;
      report.end = call.end;

      return report;
    },

    reportForId: function(id) {
      var call, stat, report, i, len, dur, callReport;

      report = {
        calls: []
      };
      stat = this.stats[id];
      dur = 0;
      report.times = stat.length;

      for (i = 0, len = report.times; i < len; i++) {
        call = stat[i];
        callReport = this.reportForCall(call);
        report.calls.push(callReport);
        dur += callReport.dur;
      }
      report.id = id;
      report.dur = dur;
      report.avg = report.dur / report.times;
      report.throughout = Math.floor(1000000 / (report.dur / report.times));
      return report;
    },

    report: function(sortKey) {
      var id, report;

      report = [];
      for (id in this.stats) {
        report.push(this.reportForId(id));
      }

      return this._sort(report, sortKey);
    },

    _sort: function(report, key) {
      var sorter, id;

      sorter = function(a, b) {
        return b[key] - a[key];
      };

      return report.sort(sorter);
    },

    _genLoadsForReport: function(report) {
      var html = [],
      call,
      i,
      len;
      html.push("<dd>");
      if (report.calls && report.calls.length) {
        html.push("<ul>");
        for (i = 0, len = report.calls.length; i < len; i++) {
          call = report.calls[i];
          html.push("<li>");
          html.push("<span>Start: " + call.start + " " + this.timer.unit + "</span>");
          html.push("<span>Duration: " + call.dur + " " + this.timer.unit + "</span>");
          html.push("</li>");
        }
        html.push("</ul>");
      }
      html.push("</dd>");
      return html.join("");
    },

    _loads_box_onlick: function(e) {
      var target, dd, toggle, tagName;
      target = e.target;

      do {
        tagName = target.tagName.toLowerCase();
        if (tagName == "dt") {
          dd = target.nextSibling;
          toggle = dd.style.display;
          toggle = !toggle || toggle.indexOf("none") > -1 ? "block": "none";
          dd.style.display = toggle;
          break;
        } else if (tagName == "a" && target.className == "close") {
          document.getElementById("benchmark-timeline").innerHTML = "";
          break;
        }
      } while ( target = target . parentNode );

    },

    _firstTime: true,

    reportLoads: function(sortKey) {
      var html, report, reports, i, len, self, box, style, percentage, firstTime;

      sortKey = sortKey || "dur";
      self = this;
      reports = this.report(sortKey);
      firstTime = this._firstTime;

      html = [];
      html.push("<h1><span>Benchmark Loads Report Sorted By " + sortKey + " - " + new Date().toLocaleString() + "</span>");
      html.push("<a href='#' class='close'>[Close]</a></h1>");
      html.push("<dl>");
      for (i = 0, len = reports.length; i < len; i++) {
        report = reports[i];
        percentage = (report[sortKey] / reports[0][sortKey]) * 100;
        html.push("<dt class='call-id'>");
        html.push("<p class='percentage-bar' style='width:" + percentage + "%'>");
        html.push("<strong>" + report.id + "</strong>");
        html.push("<span>" + " x" + report.times);
        html.push(", total=" + report.dur + " " + this.timer.unit + ", throughout: " + report.throughout + "opts/sec </span>");
        html.push("</p>");
        html.push("</dt>");
        html.push(this._genLoadsForReport(report));
      }
      html.push("</dl>");

      if (firstTime) {
        style = document.createElement("link");
        style.type = "text/css";
        style.rel = "stylesheet";
        style.href = "/css/bench.css";
        document.body.appendChild(style);

        box = document.createElement("div");
        document.body.appendChild(box);
        box.id = "benchmark-timeline";
        box.addEventListener("click", this._loads_box_onlick);
        this._firstTime = false;
        this._boxElement = box;
      } else {
        box = this._boxElement;
      }
      box.innerHTML = html.join("");

      return {
        reload: function() {
          self.reportLoads(sortKey);
        }
      };
    }
  };
  
})((typeof window == "undefined" ? global : window).Q);