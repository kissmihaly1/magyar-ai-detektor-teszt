(function () {
  "use strict";

  // Sortable leaderboard. Lower is better for FPR and FNR, so those sort ascending first.
  document.querySelectorAll("table[data-sortable]").forEach(function (table) {
    var headers = table.querySelectorAll("thead th");
    var body = table.tBodies[0];

    headers.forEach(function (th, index) {
      var button = th.querySelector("button");
      if (!button) return;
      button.addEventListener("click", function () {
        var current = th.getAttribute("aria-sort");
        var firstDir = th.dataset.dir || "descending";
        var dir = current ? (current === "ascending" ? "descending" : "ascending") : firstDir;
        headers.forEach(function (other) {
          other.removeAttribute("aria-sort");
        });
        th.setAttribute("aria-sort", dir);

        var rows = Array.prototype.slice.call(body.rows);
        rows.sort(function (a, b) {
          var x = a.cells[index].dataset.value;
          var y = b.cells[index].dataset.value;
          var nx = parseFloat(x);
          var ny = parseFloat(y);
          var cmp = isNaN(nx) || isNaN(ny) ? x.localeCompare(y, "hu") : nx - ny;
          return dir === "ascending" ? cmp : -cmp;
        });
        rows.forEach(function (row) {
          body.appendChild(row);
        });
      });
    });
  });

  // Metric tabs with arrow-key support.
  document.querySelectorAll("[role=tablist]").forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role=tab]"));

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          select(next);
          next.focus();
        }
      });
    });
  });

  // Grow the bars once the chart scrolls into view.
  var charts = document.querySelectorAll(".chart-card");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    charts.forEach(function (chart) {
      observer.observe(chart);
    });
  } else {
    charts.forEach(function (chart) {
      chart.classList.add("is-visible");
    });
  }

  // Copy buttons for citation blocks.
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var source = document.getElementById(button.dataset.copy);
      if (!source || !navigator.clipboard) return;
      var label = button.textContent;
      navigator.clipboard.writeText(source.textContent.trim()).then(function () {
        button.textContent = button.dataset.done || "Copied";
        setTimeout(function () {
          button.textContent = label;
        }, 1800);
      });
    });
  });
})();
