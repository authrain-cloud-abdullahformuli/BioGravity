declare module 'd3-force-3d' {
    // We redefine the interfaces to avoid conflicts and ensure 3D methods exist

    export interface SimulationNodeDatum {
        index?: number;
        x?: number;
        y?: number;
        z?: number;
        vx?: number;
        vy?: number;
        vz?: number;
        fx?: number | null;
        fy?: number | null;
        fz?: number | null;
    }

    export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum> {
        source: NodeDatum | string | number;
        target: NodeDatum | string | number;
        index?: number;
    }

    export interface Simulation3D<NodeDatum> {
        restart(): this;
        stop(): this;
        tick(): void;
        nodes(nodes?: NodeDatum[]): this; // Simplified: setter returns this
        nodes(): NodeDatum[]; // getter
        alpha(alpha: number): this;
        alpha(): number;
        alphaMin(min: number): this;
        alphaMin(): number;
        alphaDecay(decay: number): this;
        alphaDecay(): number;
        alphaTarget(target: number): this;
        alphaTarget(): number;
        velocityDecay(decay: number): this;
        velocityDecay(): number;
        force(name: string, force: any): this;
        force(name: string): any;
        find(x: number, y: number, z?: number, radius?: number): NodeDatum | undefined;
        on(typenames: string, listener?: (this: Simulation3D<NodeDatum>) => void): this;
        on(typenames: string): ((this: Simulation3D<NodeDatum>) => void) | undefined;
        numDimensions(n: number): this;
    }

    export function forceSimulation<NodeDatum extends SimulationNodeDatum>(nodes?: NodeDatum[]): Simulation3D<NodeDatum>;

    export function forceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>>(links?: LinkDatum[]): any;
    export function forceManyBody(): any;
    export function forceCenter(x?: number, y?: number, z?: number): any;
    export function forceCollide<NodeDatum extends SimulationNodeDatum>(radius?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): any;
    export function forceX<NodeDatum extends SimulationNodeDatum>(x?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): any;
    export function forceY<NodeDatum extends SimulationNodeDatum>(y?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): any;
    export function forceZ<NodeDatum extends SimulationNodeDatum>(z?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): any;
    export function forceRadial<NodeDatum extends SimulationNodeDatum>(radius: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number), x?: number, y?: number, z?: number): any;
}
