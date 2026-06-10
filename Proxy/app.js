const BackendBaseUrl = "https://api.unknown-technologies.us/status_api";
const PollIntervalMs = 5000;

function NodeSlug(Name) {
    return Name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SetBanner(TitleText, BodyText, IsVisible) {
    const Banner = document.getElementById("Banner");
    const BannerTitle = document.getElementById("BannerTitle");
    const BannerText = document.getElementById("BannerText");
    if (!IsVisible) { Banner.style.display = "none"; return; }
    BannerTitle.textContent = TitleText;
    BannerText.textContent = BodyText;
    Banner.style.display = "flex";
}

function SetLastUpdated(Text) {
    document.getElementById("LastUpdated").textContent = Text;
}

function SafeJsonParse(Text) {
    try { return JSON.parse(Text); } catch { return null; }
}

function GetBarColor(State) {
    switch (State) {
        case "up":       return "var(--Up)";
        case "degraded": return "var(--Degraded)";
        case "down":     return "var(--Down)";
        default:         return "var(--NoData)";
    }
}

function FmtTime(UnixTs) {
    return new Date(UnixTs * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function FmtDuration(Seconds) {
    if (Seconds < 60) return Seconds + "s";
    if (Seconds < 3600) return Math.floor(Seconds / 60) + "m " + (Seconds % 60) + "s";
    const h = Math.floor(Seconds / 3600);
    const m = Math.floor((Seconds % 3600) / 60);
    return h + "h " + m + "m";
}

// ── Day detail panel ─────────────────────────────────────────────────────────

// Track which panel is open: { rowId, date }
let _OpenPanel = null;

function CloseDayPanel() {
    if (!_OpenPanel) return;
    const Row = document.getElementById(_OpenPanel.rowId);
    if (Row) {
        const Panel = Row.querySelector(".DayPanel");
        if (Panel) {
            Panel.classList.remove("DayPanelOpen");
            setTimeout(() => Panel.remove(), 280);
        }
        // Deselect bar
        Row.querySelectorAll(".Bar.BarSelected").forEach(b => b.classList.remove("BarSelected"));
    }
    _OpenPanel = null;
}

async function OpenDayPanel(NodeSlug, Date, BarEl, RowEl) {
    const RowId = RowEl.id;

    // Toggle: clicking the same bar closes it
    if (_OpenPanel && _OpenPanel.rowId === RowId && _OpenPanel.date === Date) {
        CloseDayPanel();
        return;
    }

    // Close any other open panel first
    CloseDayPanel();

    _OpenPanel = { rowId: RowId, date: Date };
    BarEl.classList.add("BarSelected");

    // Insert panel placeholder immediately (shows loading state)
    let Panel = document.createElement("div");
    Panel.className = "DayPanel";
    Panel.innerHTML = '<div class="DayPanelLoading">Loading ' + Date + '…</div>';

    // Insert before the RowSep so it sits inside the row visually
    const Sep = RowEl.querySelector(".RowSep");
    RowEl.insertBefore(Panel, Sep || null);
    // Trigger open animation
    requestAnimationFrame(() => Panel.classList.add("DayPanelOpen"));

    // Fetch detail
    try {
        const Res = await fetch(BackendBaseUrl + "/api/day/" + NodeSlug + "/" + Date, {
            cache: "no-store",
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        const Data = SafeJsonParse(await Res.text());
        if (!Data || !Res.ok) throw new Error("Bad response");

        RenderDayPanel(Panel, Data, Date);
    } catch (Err) {
        Panel.innerHTML = '<div class="DayPanelError">Failed to load detail for ' + Date + '</div>';
    }
}

function RenderDayPanel(Panel, Data, Date) {
    const Spans = Data.Spans || [];
    const HasOutage = Spans.some(s => s.state === "down");

    let Html = '<div class="DayPanelHeader">' +
        '<span class="DayPanelDate">' + Date + '</span>' +
        '<span class="DayPanelStat">' + Data.TotalChecks + ' checks</span>' +
        '<span class="DayPanelStat DayPanelUptimePct ' + (Data.UptimePct >= 99 ? "pct-good" : Data.UptimePct >= 80 ? "pct-warn" : "pct-bad") + '">' +
            Data.UptimePct.toFixed(2) + '% uptime' +
        '</span>' +
        '<button class="DayPanelClose" onclick="CloseDayPanel()">✕</button>' +
    '</div>';

    if (Spans.length === 0) {
        Html += '<div class="DayPanelEmpty">No check data recorded for this day.</div>';
    } else {
        Html += '<div class="SpanList">';
        for (const Span of Spans) {
            const IsDown = Span.state === "down";
            const Icon = IsDown ? "▼" : "▲";
            const StateLabel = IsDown ? "Outage" : "Operational";
            Html +=
                '<div class="Span ' + (IsDown ? "SpanDown" : "SpanUp") + '">' +
                    '<span class="SpanIcon">' + Icon + '</span>' +
                    '<span class="SpanLabel">' + StateLabel + '</span>' +
                    '<span class="SpanTime">' + FmtTime(Span.start_unix) + ' – ' + FmtTime(Span.end_unix) + '</span>' +
                    '<span class="SpanDur">' + FmtDuration(Span.duration_seconds) + '</span>' +
                    '<span class="SpanChecks">' + Span.checks + ' checks' + (Span.failures > 0 ? ', ' + Span.failures + ' failed' : '') + '</span>' +
                '</div>';
        }
        Html += '</div>';
    }

    Panel.innerHTML = Html;
}

// ── Row builder ──────────────────────────────────────────────────────────────

function BuildOrUpdateRow(Node, Container) {
    const Slug = Node.Slug || NodeSlug(Node.Name);
    let Row = document.getElementById("Row-" + Slug);

    const IsUp = Boolean(Node.IsUp);
    const IsUnknown = Boolean(Node.IsUnknown);
    const DotClass = IsUnknown ? "dot-unknown" : (IsUp ? "dot-up" : "dot-down");
    const StatusClass = IsUnknown ? "status-unknown" : (IsUp ? "status-up" : "status-down");
    const UptimeText = Node.UptimePct != null ? Node.UptimePct.toFixed(2) + "% uptime" : "";

    if (!Row) {
        Row = document.createElement("div");
        Row.className = "Row";
        Row.id = "Row-" + Slug;
        Container.appendChild(Row);
    }

    // Header
    let Header = Row.querySelector(".RowHeader");
    if (!Header) {
        Header = document.createElement("div");
        Header.className = "RowHeader";
        Row.appendChild(Header);
    }
    Header.innerHTML =
        '<div class="RowLeft">' +
            '<span class="Dot ' + DotClass + '"></span>' +
            '<span class="NodeName">' + Node.Name + '</span>' +
            (Node.Description ? '<span class="NodeDesc">' + Node.Description + '</span>' : '') +
        '</div>' +
        '<div class="UptimePct ' + StatusClass + '">' + UptimeText + '</div>';

    // Bar strip
    let BarWrap = Row.querySelector(".BarWrap");
    if (!BarWrap) {
        BarWrap = document.createElement("div");
        BarWrap.className = "BarWrap";
        Row.appendChild(BarWrap);
    }

    const History = Node.History || [];
    BarWrap.innerHTML = "";
    for (const Entry of History) {
        const Bar = document.createElement("div");
        Bar.className = "Bar";
        Bar.style.background = GetBarColor(Entry.state);

        const StateLabel = { up: "Operational", degraded: "Degraded", down: "Outage", nodata: "No data" }[Entry.state] || "Unknown";
        Bar.title = Entry.date + "  •  " + StateLabel + (Entry.state !== "nodata" ? "  —  click for details" : "");

        if (Entry.state !== "nodata") {
            Bar.style.cursor = "pointer";
            // Capture values in closure
            (function(barEl, slug, date, rowEl) {
                barEl.addEventListener("click", function(e) {
                    e.stopPropagation();
                    OpenDayPanel(slug, date, barEl, rowEl);
                });
            })(Bar, Slug, Entry.date, Row);
        }

        BarWrap.appendChild(Bar);
    }

    // Timeline labels
    let Labels = Row.querySelector(".TimeLabels");
    if (!Labels) {
        Labels = document.createElement("div");
        Labels.className = "TimeLabels";
        Labels.innerHTML = '<span>‹ 90 DAYS AGO</span><span>TODAY</span>';
        Row.appendChild(Labels);
    }

    // Separator
    let Sep = Row.querySelector(".RowSep");
    if (!Sep) {
        Sep = document.createElement("div");
        Sep.className = "RowSep";
        Row.appendChild(Sep);
    }
}

// ── Main poll loop ───────────────────────────────────────────────────────────

async function FetchAndRender() {
    try {
        const Response = await fetch(BackendBaseUrl + "/api/status", {
            cache: "no-store",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json"
            }
        });

        const RawText = await Response.text();
        if (!Response.ok) throw new Error("BadStatus:" + Response.status);

        const Data = SafeJsonParse(RawText);
        if (!Data) throw new Error("NonJsonResponse");

        const Nodes = Data.Nodes || [];
        const Container = document.getElementById("NodeList");

        for (const Node of Nodes) {
            BuildOrUpdateRow(Node, Container);
        }

        const NowUnix = Math.floor(Date.now() / 1000);
        const GeneratedAtUnix = Number(Data.GeneratedAtUnix || 0);
        const LastAliveUnix = Number(Data.LastAliveUnix || 0);
        const StaleAfterSeconds = Number(Data.StaleAfterSeconds || 30);

        const HeartbeatAge = LastAliveUnix > 0 ? NowUnix - LastAliveUnix : Infinity;
        const BackendStaleDead = HeartbeatAge > StaleAfterSeconds;

        if (BackendStaleDead) {
            SetLastUpdated("Backend heartbeat stale — polling loop may be dead");
            for (const Card of Container.querySelectorAll(".Row")) {
                const Header = Card.querySelector(".RowHeader");
                if (Header) {
                    Header.querySelectorAll(".Dot").forEach(d => { d.className = "Dot dot-unknown"; });
                    const Pct = Header.querySelector(".UptimePct");
                    if (Pct) Pct.className = "UptimePct status-unknown";
                }
            }
            SetBanner("⚠ Backend Dead", "Heartbeat stopped " + Math.round(HeartbeatAge) + "s ago. Polling loop may have crashed.", true);
            return;
        }

        SetLastUpdated(GeneratedAtUnix > 0
            ? "Last updated " + new Date(GeneratedAtUnix * 1000).toLocaleString()
            : "Last updated just now");

        const AnyDown = Nodes.some(n => !n.IsUp && !n.IsUnknown && !n.IsBackend);
        const AnyDegraded = Nodes.some(n => n.IsUnknown && !n.IsBackend);

        if (AnyDown) {
            SetBanner("⚠ Degraded Service", "One or more nodes are reporting outages.", true);
        } else if (AnyDegraded) {
            SetBanner("? Status Unknown", "Some node statuses could not be verified.", true);
        } else {
            SetBanner("", "", false);
        }

    } catch (Err) {
        console.log("FetchAndRender Error:", Err);
        SetLastUpdated("Backend unreachable");

        const Container = document.getElementById("NodeList");
        if (Container.querySelectorAll(".Row").length === 0) {
            Container.innerHTML = '<div class="ErrorMsg">Unable to reach backend. Status unavailable.</div>';
        }

        SetBanner("⚠ Status Unknown", "Backend cannot be queried. All node statuses are unknown.", true);
    }
}

// Close any open panel if user clicks outside a row
document.addEventListener("click", function(e) {
    if (_OpenPanel && !e.target.closest(".Row")) {
        CloseDayPanel();
    }
});

function StartPolling() {
    FetchAndRender();
    setInterval(FetchAndRender, PollIntervalMs);
}

StartPolling();
