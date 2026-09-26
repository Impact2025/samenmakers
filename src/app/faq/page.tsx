import Link from 'next/link'
import type { Metadata } from 'next'
import { faqPageSchema, breadcrumbSchema } from '@/lib/seo-kit'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen — SamenMakers',
  description:
    'Antwoorden op veelgestelde vragen over SamenMakers: samenwerken, projecten, aanmelden en hoe we makers en organisaties verbinden.',
  alternates: { canonical: '/faq' },
  openGraph: { title: 'Veelgestelde vragen — SamenMakers', url: '/faq' },
}

const APP_URL = 'https://samenmakers.nl'

const FAQ = [
  {
    question: 'Wat is SamenMakers?',
    answer:
      'SamenMakers verbindt makers, creatieven en organisaties om gezamenlijke projecten te realiseren.',
  },
  {
    question: 'Voor wie is SamenMakers?',
    answer:
      'Voor makers, freelancers en organisaties die willen samenwerken aan concrete opdrachten en innovatieve trajecten.',
  },
  {
    question: 'Hoe meld ik me aan?',
    answer:
      'Maak een account aan, vul je profiel in en verken lopende projecten of start er zelf een.',
  },
  {
    question: 'Kost het geld om mee te doen?',
    answer:
      'Aanmelden is gratis. Voor specifieke trajecten of premium ondersteuning gelden aparte afspraken.',
  },
  {
    question: 'Werken jullie landelijk?',
    answer: 'Ja, SamenMakers werkt met makers en organisaties in heel Nederland.',
  },
]

export default function FaqPage() {
  const jsonLd = [
    faqPageSchema(FAQ),
    breadcrumbSchema([
      { name: 'Home', url: `${APP_URL}/` },
      { name: 'FAQ', url: `${APP_URL}/faq` },
    ]),
  ]
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {jsonLd.map((s, idx) => (
        <script key={idx} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">Home</Link> / <span>FAQ</span>
      </nav>
      <h1 className="text-3xl font-bold mb-2">Veelgestelde vragen</h1>
      <p className="text-muted-foreground mb-8">Korte, feitelijke antwoorden — direct citeerbaar voor AI-zoekresultaten.</p>
      <div className="divide-y border rounded-lg">
        {FAQ.map((it, i) => (
          <details key={i} className="p-4">
            <summary className="cursor-pointer font-medium">{it.question}</summary>
            <p className="mt-2 text-muted-foreground">{it.answer}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
