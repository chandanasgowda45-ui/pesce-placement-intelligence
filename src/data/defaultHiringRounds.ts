import { Company } from "@/types/company";
import { HiringRound, JobRoleDetail } from "@/services/companyDataService";

/**
 * Generates intelligent fallback hiring rounds based on company category
 * when backend data is missing or corrupted.
 * 
 * Structure matches: schema/hiring_rounds_json.schema.json
 */
export const getDefaultHiringRounds = (company: Company): HiringRound[] => {
    const category = (company.category || "").toLowerCase();

    // SERVICE COMPANIES: Aptitude Test -> GD -> Technical Interview -> HR
    if (
        category.includes("service") ||
        category.includes("it services") ||
        category.includes("consulting") ||
        category.includes("outsourcing")
    ) {
        return [
            { order: 1, name: "Aptitude & Logical Test", type: "Online Assessment", duration: "90 mins" },
            { order: 2, name: "Group Discussion", type: "Communication Round", duration: "30 mins" },
            { order: 3, name: "Technical Interview", type: "Technical Interview", duration: "45 mins" },
            { order: 4, name: "HR Interview", type: "Final HR", duration: "20 mins" }
        ];
    }

    // CORE COMPANIES: Technical Test -> Core Interview -> Managerial Round -> HR
    if (
        category.includes("core") ||
        category.includes("automobile") ||
        category.includes("manufacturing") ||
        category.includes("embedded") ||
        category.includes("hardware") ||
        category.includes("energy")
    ) {
        return [
            { order: 1, name: "Core Technical OA", type: "Technical Test", duration: "60 mins" },
            { order: 2, name: "Core Subject Interview", type: "Technical Interview", duration: "60 mins" },
            { order: 3, name: "Managerial Round", type: "Executive Interview", duration: "45 mins" },
            { order: 4, name: "HR Interview", type: "Behavioral Round", duration: "20 mins" }
        ];
    }

    // STARTUPS: Assignment -> Technical Discussion -> Founder Round
    if (
        category.includes("startup") ||
        category.includes("fintech") ||
        category.includes("edtech") ||
        category.includes("early stage")
    ) {
        return [
            { order: 1, name: "Take-home Assignment", type: "Practical Task", duration: "48 hours" },
            { order: 2, name: "Technical Deep Dive", type: "Live Coding", duration: "90 mins" },
            { order: 3, name: "Cultural & Founder Round", type: "Founder/CXO Round", duration: "45 mins" }
        ];
    }

    // TECH GIANTS / PRODUCT: Online Assessment -> DSA Round -> System Design -> Hiring Manager -> HR
    // Default fallback for Software, Internet, or unspecified categories
    return [
        { order: 1, name: "Online Assessment (DSA)", type: "Problem Solving", duration: "90 mins" },
        { order: 2, name: "Technical Round I (DSA)", type: "Algorithm Interview", duration: "60 mins" },
        { order: 3, name: "Technical Round II (System Design)", type: "Architecture Round", duration: "60 mins" },
        { order: 4, name: "Hiring Manager Round", type: "Leadership Round", duration: "45 mins" },
        { order: 5, name: "HR Interview", type: "HR & Benefits", duration: "20 mins" }
    ];
};

/**
 * Generates intelligent fallback job roles based on company category
 * when backend data is missing or corrupted.
 * 
 * Structure matches: schema/job_role_details_json.schema.json
 */
export const getDefaultJobRoles = (company: Company): JobRoleDetail[] => {
    const category = (company.category || "").toLowerCase();

    // SERVICE COMPANIES
    if (
        category.includes("service") ||
        category.includes("it services") ||
        category.includes("consulting") ||
        category.includes("outsourcing")
    ) {
        return [
            { role: "Systems Engineer Trainee", salary: "4.0 - 5.5 LPA", skills: ["Java", "Python", "SQL Fundamentals", "Soft Skills"] },
            { role: "Digital Specialist Programmer", salary: "8.0 - 11 LPA", skills: ["Data Structures", "Algorithms", "Cloud Architecture", "Full Stack Dev"] }
        ];
    }

    // CORE COMPANIES
    if (
        category.includes("core") ||
        category.includes("automobile") ||
        category.includes("manufacturing") ||
        category.includes("energy") ||
        category.includes("embedded") ||
        category.includes("hardware")
    ) {
        return [
            { role: "Graduate Engineer Trainee (GET)", salary: "6.0 - 9.0 LPA", skills: ["Engineering Fundamentals", "CAD/CAM", "Safety Standards", "System Analysis"] },
            { role: "R&D Engineer", salary: "9.0 - 15 LPA", skills: ["Embedded Systems", "Matlab", "Prototyping", "Design for Manufacturing"] }
        ];
    }

    // STARTUPS
    if (
        category.includes("startup") ||
        category.includes("fintech") ||
        category.includes("edtech") ||
        category.includes("early stage")
    ) {
        return [
            { role: "Software Engineer", salary: "12 - 25 LPA", skills: ["React/Next.js", "Node.js", "Problem Solving", "Growth Mindset"] },
            { role: "Product Developer", salary: "10 - 20 LPA", skills: ["MVP Design", "User Feedback Loop", "Agile development", "Full Stack"] }
        ];
    }

    // TECH GIANTS / PRODUCT (Default)
    return [
        { role: "Software Development Engineer (SDE-1)", salary: "18 - 40 LPA", skills: ["DSA Mastery", "System Design", "Scalability", "Operating Systems"] },
        { role: "Product Manager", salary: "15 - 30 LPA", skills: ["Data Analytics", "Strategy", "User Experience", "Product Roadmap"] }
    ];
};