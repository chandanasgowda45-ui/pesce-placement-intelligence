/**
 * AI STRATEGIC PLACEMENT GRAPH ENGINE
 * Central Intelligence Nervous System
 */

export type NodeType = 'Student' | 'Skill' | 'Company' | 'Question' | 'Stage' | 'Outcome' | 'Pattern';
export type RelationType = 'REQUIRES' | 'POSSESSES' | 'ASKED_IN' | 'LEADS_TO' | 'CORRELATES_WITH' | 'MITIGATES';

export interface GraphNode {
    id: string;
    type: NodeType;
    label: string;
    weight: number; // Importance in the network
    metadata: Record<string, any>;
}

export interface GraphEdge {
    source: string;
    target: string;
    relation: RelationType;
    strength: number; // 0 to 1 causality factor
    insight?: string;
}

export class PlacementGraphEngine {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdge[] = [];

    /**
     * Section 1 & 10: Memory System & Architecture
     * Ingests data from Timeline, Experiences, and Rejection Engine
     */
    public async syncKnowledgeGraph(
        companies: any[],
        experiences: any[],
        candidate: any
    ) {
        this.clearGraph();

        // 1. Map Student & Skills
        const studentId = 'current_user';
        this.addNode({ id: studentId, type: 'Student', label: candidate.name, weight: 1, metadata: candidate });

        const studentSkills = candidate.skills?.split(',').map((s: string) => s.trim()) || [];
        studentSkills.forEach((skill: string) => {
            const skillId = `skill_${skill.toLowerCase()}`;
            this.addNode({ id: skillId, type: 'Skill', label: skill, weight: 0.8, metadata: {} });
            this.addEdge(studentId, skillId, 'POSSESSES', 1);
        });

        // 2. Map Companies & Requirements
        companies.forEach(company => {
            const compId = `comp_${company.company_id}`;
            this.addNode({ id: compId, type: 'Company', label: company.name, weight: 0.9, metadata: company });

            // Link requirements from skills data
            company.skills?.forEach((s: any) => {
                const skillId = `skill_${s.toLowerCase()}`;
                this.addEdge(compId, skillId, 'REQUIRES', 0.9);
            });
        });

        // 3. Map Experiences & Rejection Patterns (Causality Detection)
        experiences.forEach(exp => {
            const expId = `exp_${exp.id}`;
            const compId = `comp_${exp.company_id || exp.company_name}`;

            this.addNode({ id: expId, type: 'Outcome', label: exp.selected_or_rejected, weight: 0.7, metadata: exp });
            this.addEdge(compId, expId, 'LEADS_TO', 1);

            exp.technical_topics?.forEach((topic: string) => {
                const skillId = `skill_${topic.toLowerCase()}`;
                this.addEdge(expId, skillId, 'CORRELATES_WITH', 0.8, `Difficulty: ${exp.difficulty_level}`);
            });
        });

        return this.generateStrategicReasoning(studentId);
    }

    /**
     * Section 2, 3 & 7: Strategic Reasoning Engine
     */
    private generateStrategicReasoning(studentId: string) {
        const insights: string[] = [];
        const studentSkills = this.edges
            .filter(e => e.source === studentId && e.relation === 'POSSESSES')
            .map(e => e.target);

        // Detect Causality: Find missing skills required by target companies
        const targetCompanies = Array.from(this.nodes.values()).filter(n => n.type === 'Company');

        targetCompanies.forEach(company => {
            const requirements = this.edges
                .filter(e => e.source === company.id && e.relation === 'REQUIRES')
                .map(e => e.target);

            const missing = requirements.filter(r => !studentSkills.includes(r));

            if (missing.length > 0) {
                const risk = (missing.length / requirements.length) * 100;
                insights.push(`${company.label} Risk: Lacking ${missing.length} core skills increases rejection probability by ${risk.toFixed(0)}%.`);
            } else {
                insights.push(`Strategic Fit: High alignment with ${company.label} based on skill trajectory.`);
            }
        });

        return {
            nodes: Array.from(this.nodes.values()),
            edges: this.edges,
            strategicInsights: insights
        };
    }

    private addNode(node: GraphNode) {
        if (!this.nodes.has(node.id)) this.nodes.set(node.id, node);
    }

    private addEdge(source: string, target: string, relation: RelationType, strength: number, insight?: string) {
        this.edges.push({ source, target, relation, strength, insight });
    }

    private clearGraph() {
        this.nodes.clear();
        this.edges = [];
    }
}