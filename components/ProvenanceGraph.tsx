"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

type NodeType = "alert" | "forecast" | "proposal" | "decision" | "feedback";

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: NodeType;
    payload?: Record<string, unknown>;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    label?: string;
}

const MOCK_NODES: GraphNode[] = [
    { id: "alert-001", label: "CS401 Overflow\nAlert", type: "alert", payload: { severity: "high", course: "CS401", confidence: 0.92 } },
    { id: "alert-002", label: "Prof. Sharma\nConflict", type: "alert", payload: { severity: "medium", course: "MBA702" } },
    { id: "forecast-001", label: "ORACLE\nForecast", type: "forecast", payload: { model: "Prophet", yhat: 1480 } },
    { id: "proposal-001", label: "ARBITER\nProposal P-001", type: "proposal", payload: { resource: "CR-302", rank: 1 } },
    { id: "proposal-002", label: "ARBITER\nProposal P-002", type: "proposal", payload: { resource: "Faculty", rank: 2 } },
    { id: "decision-001", label: "Admin\nDecision", type: "decision", payload: { action: "accept", proposal_id: "PROP-001" } },
    { id: "feedback-001", label: "ADAPT\nUpdate", type: "feedback", payload: { weights_updated: true, learning_rate: 0.01 } },
];

const MOCK_LINKS: GraphLink[] = [
    { source: "alert-001", target: "forecast-001", label: "triggered" },
    { source: "forecast-001", target: "proposal-001", label: "informed" },
    { source: "alert-002", target: "proposal-002", label: "triggered" },
    { source: "proposal-001", target: "decision-001", label: "reviewed" },
    { source: "proposal-002", target: "decision-001", label: "reviewed" },
    { source: "decision-001", target: "feedback-001", label: "generated" },
];

const NODE_COLORS: Record<NodeType, { fill: string; stroke: string }> = {
    alert: { fill: "rgba(244,63,94,0.15)", stroke: "#f43f5e" },
    forecast: { fill: "rgba(59,130,246,0.15)", stroke: "#3b82f6" },
    proposal: { fill: "rgba(168,85,247,0.15)", stroke: "#a855f7" },
    decision: { fill: "rgba(16,185,129,0.15)", stroke: "#10b981" },
    feedback: { fill: "rgba(245,158,11,0.15)", stroke: "#f59e0b" },
};

export function ProvenanceGraph() {
    const t = useTranslations("audit");
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 700;
        const height = 480;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        svg.attr("width", width).attr("height", height);

        // Defs: arrowhead marker
        const defs = svg.append("defs");
        defs.append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "-0 -5 10 10")
            .attr("refX", 28)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .append("path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", "rgba(124,58,237,0.5)")
            .attr("stroke", "none");

        const g = svg.append("g");

        // Zoom
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 3])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        svg.call(zoom);
        zoomBehaviorRef.current = zoom;

        // Force simulation
        const nodes: GraphNode[] = MOCK_NODES.map((n) => ({ ...n }));
        const links: GraphLink[] = MOCK_LINKS.map((l) => ({ ...l }));

        const sim = d3.forceSimulation<GraphNode>(nodes)
            .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(130))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide(50));

        // Links
        const link = g.append("g").selectAll("line")
            .data(links)
            .join("line")
            .attr("class", "graph-link")
            .attr("marker-end", "url(#arrowhead)");

        // Link labels
        const linkLabel = g.append("g").selectAll("text")
            .data(links)
            .join("text")
            .attr("font-size", 9)
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(148,163,184,0.7)")
            .text((d) => d.label || "");

        // Node groups
        const node = g.append("g").selectAll("g")
            .data(nodes)
            .join("g")
            .attr("class", (d) => `node node-${d.type}`)
            .attr("role", "img")
            .attr("aria-label", (d) => `${d.type} node: ${d.label}`)
            .style("cursor", "pointer")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .call(d3.drag<SVGGElement, GraphNode>()
                .on("start", (event, d) => {
                    if (!event.active) sim.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) sim.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }) as any);

        node.append("circle")
            .attr("r", 28)
            .attr("fill", (d) => NODE_COLORS[d.type].fill)
            .attr("stroke", (d) => NODE_COLORS[d.type].stroke)
            .attr("stroke-width", 1.5)
            .on("mouseenter", (event, d) => {
                d3.select(event.currentTarget)
                    .transition().duration(150)
                    .attr("r", 34)
                    .attr("stroke-width", 2.5);
                setTooltip({ x: event.clientX, y: event.clientY, node: d });
            })
            .on("mouseleave", (event) => {
                d3.select(event.currentTarget)
                    .transition().duration(150)
                    .attr("r", 28)
                    .attr("stroke-width", 1.5);
                setTooltip(null);
            });

        // Node text (multi-line)
        node.each(function (d) {
            const lines = d.label.split("\n");
            const g2 = d3.select(this);
            lines.forEach((line, i) => {
                g2.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", `${(i - (lines.length - 1) / 2) * 1.2}em`)
                    .attr("font-size", 10)
                    .attr("font-weight", i === 0 ? "600" : "400")
                    .attr("fill", NODE_COLORS[d.type].stroke)
                    .text(line);
            });
        });

        sim.on("tick", () => {
            link
                .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
                .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
                .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
                .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

            linkLabel
                .attr("x", (d) => (((d.source as GraphNode).x ?? 0) + ((d.target as GraphNode).x ?? 0)) / 2)
                .attr("y", (d) => (((d.source as GraphNode).y ?? 0) + ((d.target as GraphNode).y ?? 0)) / 2 - 6);

            node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
        });

        return () => { sim.stop(); };
    }, []);

    const handleZoom = (factor: number) => {
        if (!svgRef.current || !zoomBehaviorRef.current) return;
        d3.select(svgRef.current).transition().duration(300).call(
            zoomBehaviorRef.current.scaleBy, factor
        );
    };

    const handleReset = () => {
        if (!svgRef.current || !zoomBehaviorRef.current) return;
        d3.select(svgRef.current).transition().duration(400).call(
            zoomBehaviorRef.current.transform, d3.zoomIdentity
        );
    };

    const NODE_TYPE_LABELS: Record<NodeType, string> = {
        alert: "Alert",
        forecast: "Forecast",
        proposal: "Proposal",
        decision: "Decision",
        feedback: "Feedback",
    };

    return (
        <div className="glass p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 className="font-bold text-base gradient-text">{t("title")}</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {t("hover_tip")} · {t("zoom_tip")}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleZoom(1.3)}
                        className="p-2 glass rounded-xl hover:bg-purple-900/20 transition-colors"
                        aria-label="Zoom in"
                    >
                        <ZoomIn size={14} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button
                        onClick={() => handleZoom(0.7)}
                        className="p-2 glass rounded-xl hover:bg-purple-900/20 transition-colors"
                        aria-label="Zoom out"
                    >
                        <ZoomOut size={14} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 glass rounded-xl hover:bg-purple-900/20 transition-colors"
                        aria-label="Reset view"
                    >
                        <RefreshCw size={14} style={{ color: "var(--text-secondary)" }} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
                {(Object.entries(NODE_COLORS) as [NodeType, typeof NODE_COLORS[NodeType]][]).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ background: colors.stroke }} />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {NODE_TYPE_LABELS[type]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Graph */}
            <div
                ref={containerRef}
                className="w-full rounded-xl overflow-hidden relative"
                style={{ background: "rgba(15,23,42,0.4)", height: 480 }}
                aria-label="Decision provenance graph"
            >
                <svg ref={svgRef} className="w-full h-full" />

                {/* Tooltip */}
                {tooltip && (
                    <div
                        className="fixed z-50 glass-strong px-3 py-2 text-xs max-w-64 pointer-events-none"
                        style={{ left: tooltip.x + 12, top: tooltip.y - 24 }}
                    >
                        <div className="font-bold mb-1" style={{ color: NODE_COLORS[tooltip.node.type].stroke }}>
                            {tooltip.node.type.toUpperCase()} · {tooltip.node.id}
                        </div>
                        <pre className="overflow-auto max-h-32 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {JSON.stringify(tooltip.node.payload, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
