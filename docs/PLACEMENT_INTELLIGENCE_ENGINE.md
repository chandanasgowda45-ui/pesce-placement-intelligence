# Placement Intelligence Engine Documentation

## Overview

The Placement Intelligence Engine is a comprehensive AI-powered assessment system that analyzes candidate profiles, generates adaptive tests, evaluates responses, and provides personalized career roadmaps with company matching.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PLACEMENT INTELLIGENCE ENGINE                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   Step 1:    │───▶│   Step 2:    │───▶│   Step 3:    │               │
│  │  CV Analysis │    │  Assessment  │    │  Evaluation  │               │
│  │   (AI)       │    │ Generation   │    │   (AI)       │               │
│  └──────────────┘    │   (AI)       │    └──────────────┘               │
│                       └──────────────┘              │                   │
│                                                      ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   Company    │◀───│   Step 5:    │◀───│   Step 4:    │               │
│  │   Matching   │    │   Roadmap    │    │   Level      │               │
│  │   (AI)       │    │ Generation   │    │  Assignment  │               │
│  └──────────────┘    │   (AI)       │    └──────────────┘               │
│                       └──────────────┘                                   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. POST `/api/placement-intelligence/analyze`

**Description:** Analyzes CV and generates adaptive assessment (Steps 1-2)

**Request Body:**
```json
{
  "name": "John Doe",
  "cgpa": "8.5",
  "skills": "React, Node.js, Python, SQL",
  "projects": "E-commerce platform, Chat application",
  "resumeSummary": "Full-stack developer with 2 years experience...",
  "githubUrl": "https://github.com/johndoe",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "leetcodeUrl": "https://leetcode.com/johndoe",
  "gfgUrl": "https://geeksforgeeks.org/user/johndoe",
  "aptitude": "75",
  "communication": "80"
}
```

**Response:**
```json
{
  "success": true,
  "stage": "ASSESSMENT_READY",
  "cvAnalysis": {
    "cv_insights": "Comprehensive analysis...",
    "skills_analysis": [
      { "skill": "React", "rating": 85, "evidence": "...", "category": "Frontend" }
    ],
    "education": { "degree": "...", "institution": "...", "year": 2022, "achievements": [] },
    "experience": { "total_months": 24, "roles": [], "companies": [] },
    "projects_analysis": [],
    "skill_gaps": ["System Design", "Cloud Technologies"],
    "strengths": ["Problem Solving", "Frontend Development"],
    "weaknesses": ["Backend Architecture"],
    "target_role_recommendation": "Full-Stack Developer"
  },
  "assessment": {
    "aptitude": [
      { "id": "apt_1", "question": "...", "type": "Logical Reasoning", "max_score": 10 }
    ],
    "coding": [
      { "id": "code_1", "question": "...", "difficulty": "Medium", "topic": "Arrays", "max_score": 10 }
    ],
    "total_questions": 6,
    "recommended_time_minutes": 45
  },
  "message": "Assessment generated. Awaiting candidate responses."
}
```

### 2. POST `/api/placement-intelligence/evaluate`

**Description:** Evaluates responses, assigns level, generates roadmap, matches companies (Steps 3-6)

**Request Body:**
```json
{
  "candidateData": { /* original candidate data */ },
  "cvAnalysis": { /* from analyze endpoint */ },
  "assessment": { /* from analyze endpoint */ },
  "userAnswers": {
    "apt_1": "My answer and reasoning...",
    "code_1": "My approach and pseudo-code..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "level": "Intermediate",
    "level_description": "Ready for mid-tier companies...",
    "aptitude_score": 75,
    "coding_score": 68,
    "overall_score": 72,
    "cv_insights": "...",
    "skill_gaps": ["System Design", "Advanced DSA"],
    "skills_analysis": [...],
    "roadmap": [
      {
        "phase": 1,
        "title": "Foundation Strengthening",
        "duration": "Weeks 1-4",
        "focus_areas": ["DSA", "System Design Basics"],
        "tasks": ["Complete LeetCode Top 100", "Study Grokking System Design"],
        "resources": ["LeetCode", "Grokking System Design"],
        "success_metrics": ["Solve 50+ problems", "Complete 3 design exercises"]
      }
    ],
    "companies_now": [
      { "name": "TechCorp", "category": "Mid-size Product", "typical_role": "SDE-1", "match_reason": "..." }
    ],
    "companies_after_roadmap": [
      { "name": "Google", "category": "FAANG", "typical_role": "SDE-2", "match_reason": "..." }
    ],
    "performance_summary": "...",
    "strengths": [...],
    "weaknesses": [...],
    "immediate_recommendations": [...],
    "long_term_strategy": "..."
  }
}
```

### 3. POST `/api/placement-intelligence/full-pipeline`

**Description:** Complete end-to-end pipeline (for testing/demo purposes)

**Request Body:**
```json
{
  "candidateData": { /* candidate data */ },
  "userAnswers": { /* optional - if provided, completes full evaluation */ }
}
```

## Level Assignment Rules

| Score Range | Level | Description |
|-------------|-------|-------------|
| < 40% | Beginner | Needs strong foundation building. Focus on core fundamentals and basic problem-solving. |
| 40-70% | Intermediate | Ready for mid-tier companies. Needs targeted improvement in specific areas. |
| > 70% | Expert | Ready for top-tier companies. Can handle complex technical challenges. |

## Assessment Generation Logic

The engine adapts difficulty based on candidate's skill level:

### Beginner (Avg Skill < 40)
- **Coding Topics:** Arrays, strings, basic loops, simple patterns, basic math
- **Question Style:** Fundamental implementation, basic logic

### Intermediate (Avg Skill 40-70)
- **Coding Topics:** Trees, graphs, dynamic programming, recursion, data structures
- **Question Style:** Algorithm optimization, complex data structures

### Expert (Avg Skill > 70)
- **Coding Topics:** System design, advanced algorithms, optimization, concurrency, distributed systems
- **Question Style:** Architecture design, performance optimization

## Evaluation Criteria

### Aptitude Scoring (per question, max 10)
- **Correctness:** 0-5 points
- **Reasoning Quality:** 0-5 points

### Coding Scoring (per question, max 10)
- **Correctness:** 0-2.5 points
- **Time Complexity:** 0-2.5 points
- **Edge Case Handling:** 0-2.5 points
- **Code Quality:** 0-2.5 points

## Roadmap Structure

Each roadmap consists of 3 phases:

### Phase 1 (Weeks 1-4): Foundation
- Fix weakest skill gaps
- Specific topics and learning resources
- Daily/weekly targets

### Phase 2 (Weeks 5-8): Application
- Build real projects
- Competitive practice (LeetCode targets)
- GitHub portfolio building

### Phase 3 (Weeks 9-12): Preparation
- Interview preparation
- Company-specific targeting
- Resume and LinkedIn optimization

## Company Matching

### Companies Now (Current Level)
- Service companies
- Startups
- Mid-sized product companies
- Realistic hiring bars

### Companies After Roadmap (Stretch Goals)
- Top-tier product companies
- Well-funded startups
- FAANG companies
- Higher hiring bars

## Files Modified/Created

### Backend
- `backend/ai/placementIntelligenceEngine.js` - Main engine implementation
- `backend/server.js` - Added API endpoints

### Frontend
- `frontend/src/pages/CandidateAnalyzer.tsx` - Updated UI for new engine

## Usage Example

```javascript
// Step 1: Analyze and get assessment
const analyzeResponse = await fetch('http://localhost:3001/api/placement-intelligence/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(candidateData)
});
const { cvAnalysis, assessment } = await analyzeResponse.json();

// Step 2: User completes test, then evaluate
const evalResponse = await fetch('http://localhost:3001/api/placement-intelligence/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    candidateData,
    cvAnalysis,
    assessment,
    userAnswers
  })
});
const { report } = await evalResponse.json();
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing required fields)
- `500` - Server Error (AI processing failed)

Error responses include an `error` field with details.