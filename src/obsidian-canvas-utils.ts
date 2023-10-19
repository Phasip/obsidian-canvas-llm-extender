import { CanvasNodeData, CanvasData } from "obsidian/canvas";
import {
    notifyError
} from "./obsidian-helpers";

export function isCanvasNodeData(node: unknown): node is CanvasNodeData {
    return node !== null && typeof node === "object" && "canvas" in node;
}

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

export function isBox(node: unknown): node is Box {
    return node !== null && 
          typeof node === "object" && 
          "x" in node && 
          "y" in node && 
          "width" in node && 
          "height" in node;
}

// Given node, return nodes with edges to this node
// {incoming: [nodes...], outgoing: [nodes...]}
export function getNodeNeighbours(node: CanvasNodeData) {
    const incoming = []
    const outgoing = []
    for (const edge of node.canvas.edges.values()) {
        if (edge.from.node.id == node.id) {
            outgoing.push(edge.to.node)
        } else if (edge.to.node.id == node.id) {
            incoming.push(edge.from.node)
        }
    }
    return {
        incoming: incoming, 
        outgoing: outgoing
    }
}

// Random (not secure!) 16 character id  
function generate_id(): string {
    const t = [];
    for (let n = 0; n < 16; n++) {
        t.push((16 * Math.random() | 0).toString(16));
    }
    return t.join("")
}

// Returns true if node1 and node2 overlap
function overlaps(node1: unknown, node2: unknown): boolean {
    if (!isBox(node1)) { 
        notifyError("overlaps received non-box argument: ${node1}");
        return false; 
    }

    if (!isBox(node2)) { 
        notifyError("overlaps received non-box argument: ${node2}");
        return false; 
    }
    if (node1.x > node2.x+node2.width) {
        return false;
    }

    if (node1.x+node1.width < node2.x) {
        return false;
    }
    if (node1.y > node2.y+node2.height) {
        return false;
    }
    if (node1.y+node1.height < node2.y) {
        return false;
    }
    return true;
}
// Attempts to place the node_to_fit at a location around neighbor_node
// updown: attempt to place above/below
// leftright: attempt to place on either side
function findEmptySpace(neighbor_node: CanvasNodeData, node_to_fit: CanvasNodeData, distance_between: number, updown: boolean, leftright: boolean) {
    const positions = []
    if (leftright) {
        positions.push({x: neighbor_node.x+neighbor_node.width+distance_between, y: neighbor_node.y},
                       {x: neighbor_node.x-distance_between-neighbor_node.width, y: neighbor_node.y})
    }
    if (updown) {
        positions.push({x: neighbor_node.x, y: neighbor_node.y+neighbor_node.height+distance_between},
                       {x: neighbor_node.x, y: neighbor_node.y-neighbor_node.height-distance_between})
    }
    posloop:
    for (const pos of positions) {
        const nodetemp = {x: pos.x, y:pos.y, width: node_to_fit.width, height: node_to_fit.height}
        for (const node of neighbor_node.canvas.nodes.values()) {
            if (node.id == node_to_fit.id) { continue; }
            if (overlaps(node, nodetemp)) { continue posloop; }
        }
        // Nobody overlaps
        node_to_fit.moveTo({x: nodetemp.x, y: nodetemp.y})
        return true;
    }
    return false;
}

// TODO Ugly hack to get some approx size of the textbox
// TODO: textsizenode only needed as getComputedStyle for our node won't return anything yet & Obsidian lacks API for this (?)
function fitToText(node: CanvasNodeData, width: number, textsizenode: CanvasNodeData) {
    //console.log("Fitting based on nodeStyle ", textsizenode.nodeEl);
    const compStyle = window.getComputedStyle(textsizenode.nodeEl);
    const lineHeight = parseFloat(compStyle.lineHeight) || 19; //TODO: 19 just matches what was on my computer
    // TODO: This ignore seems unneeded
    // @ts-ignore: Not sure what the nice way to solve this is
    const htmlCanvas = fitToText.htmlCanvas || (fitToText.htmlCanvas = document.createElement("canvas"));
    const context = htmlCanvas.getContext('2d');
    context.font = compStyle.font;
    const lineWidth = context.measureText(node.text).width;
    console.log("LineHeight is ",lineHeight, "Width is ",width, " Linewidth: ",lineWidth)
    const height = ((lineWidth/width)+2)*lineHeight;
    node.resize({width: width, height: height});
  }

export function createNode(text: string, width: number, canvas: CanvasData, textsizenode: CanvasNodeData): CanvasNodeData {
    const cn = canvas.createTextNode({
        text: text,
        pos: {
            x: 0,
            y: 0,
        },
        size: {
            width: 1,
            height: 1
        },
        save: true,
        focus: false,
    });
    canvas.addNode(cn);
    fitToText(cn, width, textsizenode);
    cn.attach();
    return cn
    
}

// Creates an edge between from and to.
// Related can be none. If it is a node it should have an incoming edge from from. The edge between from-to will be based (exit/entry side) on this edge
export function createEdge(from: CanvasNodeData, to: CanvasNodeData, related:CanvasNodeData, canvas: CanvasData) {
    let edge;
    for (edge of canvas.edges.values()) {
        if (!related) { break; }
        if (edge.from.node.id == from.id && edge.to.node.id == related.id) {
            break;
        }
    }

    if(!edge) {
        notifyError("Please add at least one arrow to your canvas.");
        return;
    }
    // TODO: Obsidian API lacks edge construction?
    // TODO: Calculate location of edge connection based on from/to positions
    // @ts-ignore: Wait for the Obsidian API then fix this lack of proper constructor
    const e = new edge.constructor(canvas, generate_id(), {side: edge.from.side, node: from, end: "none"}, {side: edge.to.side, node: to, end: "arrow"})
    canvas.addEdge(e);
    e.attach();
    e.render();
}

// Adds a child to the given node with given text
// creates an outgoing edge from node to the new node
// attempts to resize the node to fit the text
export function addNodeChild(node: CanvasNodeData, nodetext: string) {
    console.log("Node width: ", node.width)
    const n = createNode(nodetext, node.width, node.canvas, node);
    const neighbors = getNodeNeighbours(node);


    // This element will be placed in the middle
    const altorder = [{updown: true, leftright: false, node: node}]
    for (const sibling of neighbors.outgoing) {
        // Push updown to beginning
        altorder.unshift({updown: true, leftright: false, node: sibling})
        // Push leftright to end
        altorder.push({updown: false, leftright: true, node: sibling})
    }
    
    altorder.push({updown: false, leftright: true, node: node})

    for (const o of altorder) {
        // TODO 15 is distance between nodes, make constant or setting
        if (findEmptySpace(o.node, n, 15, o.updown, o.leftright)) {
            createEdge(node, n, o.node, node.canvas)
            // TODO: Not sure if needed
            n.render();
            node.canvas.requestSave(true);
            return;
        }
    }
    // TODO: Remove node if placement fails?
    notifyError("No place for child node");
    
}