export interface AIAnalysisResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    summary: string;
    recommendation: "Aprovar" | "Reprovar" | "Revisar";
    // Extracted Profile Data
    profile?: {
        full_name: string;
        headline: string;
        summary: string;
        skills: string[];
        linkedin_url: string | null;
        portfolio_url: string | null;
    };
}

export async function analyzeCandidate(
    cvText: string,
    jobDescription: string,
    extractProfile: boolean = true
): Promise<AIAnalysisResult> {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        console.warn("No Perplexity API key found, using mock data.");
        return mockAnalysis();
    }

    const systemPrompt = extractProfile
        ? "Você é um recrutador especialista de RH. Analise o CV do candidato em relação à descrição da vaga E extraia os dados do perfil. Retorne APENAS um JSON válido com a seguinte estrutura: { score (0-100), strengths (array strings), weaknesses (array strings), summary (resumo da análise e justificativa de avanço se score >= 55), recommendation ('Aprovar'|'Reprovar'|'Revisar'), profile: { full_name, headline, summary (resumo profissional do candidato), skills (array strings), linkedin_url, portfolio_url } }."
        : "Você é um recrutador especialista de RH. Analise o CV do candidato em relação à descrição da vaga. Retorne um objeto JSON com: score (0-100), strengths (array de strings com pontos fortes), weaknesses (array de strings com pontos fracos), summary (resumo da análise em português, incluindo justificativa clara se o score for >= 55 para avançar de fase), e recommendation (string: 'Aprovar', 'Reprovar' ou 'Revisar'). A saída deve ser APENAS o JSON válido, sem markdown.";

    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: `Descrição da Vaga: ${jobDescription}\n\nCV do Candidato: ${cvText}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Attempt to parse JSON from the response (it might be wrapped in markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            console.error("Failed to parse JSON, raw content:", content);
            throw new Error("Failed to parse JSON from AI response");
        }
    } catch (error) {
        console.error("AI Analysis failed:", error);
        return mockAnalysis();
    }
}

function mockAnalysis(): AIAnalysisResult {
    return {
        score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        strengths: [
            "Experiência relevante sólida",
            "Boa formação acadêmica",
            "Comunicação clara",
        ],
        weaknesses: [
            "Poderia ter exemplos mais específicos de conquistas",
            "Experiência limitada com algumas ferramentas secundárias",
        ],
        summary:
            "O candidato mostra forte potencial para a vaga com um background sólido. Recomendado para entrevista.",
        recommendation: "Aprovar",
        profile: {
            full_name: "Candidato Mock",
            headline: "Desenvolvedor Mock",
            summary: "Resumo do perfil mockado.",
            skills: ["Mock Skill 1", "Mock Skill 2"],
            linkedin_url: null,
            portfolio_url: null
        }
    };
}

export async function extractProfileFromText(text: string): Promise<any> {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    console.log("AI Extraction: Key present?", !!apiKey);
    console.log("AI Extraction: Text length:", text?.length);

    if (!apiKey) {
        console.warn("No Perplexity API key found, using mock profile extraction.");
        return mockProfileExtraction("Missing API Key");
    }

    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    {
                        role: "system",
                        content:
                            "Você é um assistente de RH. Extraia informações do texto do CV para preencher um perfil. Retorne APENAS um JSON válido com os campos: full_name (string), headline (string, ex: 'Desenvolvedor Full Stack'), summary (string, resumo profissional), skills (array de strings), linkedin_url (string ou null), portfolio_url (string ou null). Se não encontrar algo, use null ou array vazio.",
                    },
                    {
                        role: "user",
                        content: `Texto do CV: ${text}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Perplexity API error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Perplexity API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        console.log("AI Raw Content:", content);

        // Remove markdown code blocks if present
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

        // Try to find JSON object
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                console.error("Failed Content:", jsonMatch[0]);
                throw new Error(`Failed to parse JSON: ${e}`);
            }
        } else {
            console.error("No JSON found in content:", content);
            throw new Error("Failed to parse JSON from AI response");
        }
    } catch (error: any) {
        console.error("AI Profile Extraction failed:", error);
        return mockProfileExtraction(error.message || "Unknown error");
    }
}

function mockProfileExtraction(errorMessage?: string) {
    return {
        full_name: "Candidato Exemplo",
        headline: "Profissional de Tecnologia",
        summary: errorMessage
            ? `ERRO NA EXTRAÇÃO: ${errorMessage}. (Dados Mockados)`
            : "Resumo extraído automaticamente (Mock). O candidato possui experiência em diversas áreas.",
        skills: ["Comunicação", "Trabalho em Equipe", "Resolução de Problemas"],
        linkedin_url: null,
        portfolio_url: null
    }
}
