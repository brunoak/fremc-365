import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/jobs/JobCard";
import { SearchHero } from "@/components/home/SearchHero";
import { Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface Job {
  id: string;
  titulo: string;
  empresa: string;
  descricao: string;
  requirements: string[];
  created_at: string;
  company_id?: string;
  companies?: {
    logo_url: string;
    name: string;
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const type = params.type || "job";

  const supabase = await createClient();

  let query = supabase
    .from("vagas")
    .select("*, companies(logo_url, name)")
    .order("created_at", { ascending: false });

  if (q) {
    if (type === "company") {
      // Filter by company name (using the joined table or the denormalized column)
      // Since we have 'empresa' column in vagas, we can use that for simple search
      // OR we can search in the related companies table if we want to be more precise
      // Let's stick to the 'empresa' column for now as it's what's displayed on the card usually
      query = query.ilike("empresa", `%${q}%`);
    } else {
      // Filter by job title or description
      query = query.or(`titulo.ilike.%${q}%,descricao.ilike.%${q}%`);
    }
  }

  const { data } = await query;
  const jobs = data as Job[] | null;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center justify-center">
        {/* Background with Gradient and Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-fremc-blue-dark via-fremc-blue to-fremc-red-dark"></div>
        <div className="absolute inset-0 bg-[url('/hero-gradient.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[url('/logo-fremc.png')] bg-[length:800px] bg-center opacity-5 mix-blend-soft-light blur-sm"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium tracking-wide">
            🚀 O futuro da sua carreira começa aqui
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white leading-tight">
            Conectando Talentos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fremc-gold via-fremc-gold-light to-fremc-gold">
              Brasil-China
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Encontre as melhores oportunidades em empresas chinesas atuando no Brasil.
          </p>

          <SearchHero />

          <div className="mt-12 flex justify-center gap-8 text-white/60 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-fremc-gold"></div>
              +50 Empresas Parceiras
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-fremc-gold"></div>
              Vagas Atualizadas Diariamente
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-fremc-blue-dark">
              {q ? `Resultados para "${q}"` : "Vagas em Destaque"}
            </h2>
            {q && (
              <p className="text-gray-500 mt-1">
                Filtrando por: {type === 'company' ? 'Empresa' : 'Vaga'}
              </p>
            )}
          </div>
          <span className="text-muted-foreground">{jobs?.length || 0} vagas encontradas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchHeroIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Tente ajustar seus termos de busca ou remover os filtros para ver mais resultados.
              </p>
              <Link href="/">
                <Button variant="link" className="mt-4 text-fremc-blue">
                  Limpar filtros
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SearchHeroIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
