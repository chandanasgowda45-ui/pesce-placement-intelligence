/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_OPENAI_API_KEY: string;
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_GROQ_API_KEY: string;
    readonly VITE_LANGCHAIN_API_KEY: string;
    readonly VITE_LANGCHAIN_TRACING_V2: string;
    readonly VITE_LANGCHAIN_PROJECT: string;
    readonly VITE_LANGCHAIN_ENDPOINT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}