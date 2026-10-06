/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit interview-otto.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title:
    "More peace of mind as an entrepreneur through the Social Entrepreneurship Program | Interview",
  description: "",
};

export function InterviewContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Interview</h1>
            <h2 className="page-hero__subtitle">
              More peace of mind as an entrepreneur through the Social
              Entrepreneurship Program
            </h2>
          </div>
          <p className="page-hero__description">
            Interview with
            <br />
            Otto Reuchlin
            <br />
            Founder, Peer Accountants
            <br />
            Social Entrepreneurship Program, Utrecht University
          </p>
        </div>
      </section>
      <div className="container">
        <main className="main-content">
          <div className="article-feature-image">
            <img
              src="/wstf/images/interview/Otto-Reuchlin-oprichter-van-Peer-Accountants.jpg"
              alt="Otto Reuchlin"
            />
          </div>
          <p className="lead-paragraph">
            As a social entrepreneur, you are often so deeply involved in your
            business that work and personal identity merge together. Otto
            Reuchlin, founder of Peer Accountants, discovered during the Social
            Entrepreneurship Program at Utrecht University how valuable it is to
            separate those roles. It brought him not only greater peace of mind,
            but also concrete plans for the future of his company.
          </p>
          <section
            id="participating-as-social-entrepreneur"
            className="article-section"
          >
            <h2>Participating as a Social Entrepreneur</h2>
            <p>
              Reflecting on setting out directions for a future business
              transfer, exchanging ideas with fellow participants, deepening
              knowledge, and learning to distinguish between yourself as a
              person, your business, and your role as an entrepreneur—these are
              just a few key takeaways Otto Reuchlin of Peer Accountants gained
              from the Social Entrepreneurship Program. What does he bring to
              the table? His knowledge and years of hands-on experience as a
              social entrepreneur.
              <br />
              Peer Accountants is a social enterprise that offers permanent jobs
              to individuals who need a bit of extra support. “Highly educated
              talents who aren't fully self-reliant in certain areas,” Otto
              explains. “Such as people on the autism spectrum. Precisely those
              individuals who are somewhat more vulnerable in certain aspects
              benefit greatly from a permanent job. Some team members have been
              working here for nine years already.”
            </p>
          </section>
          <section id="person-entrepreneur-company" className="article-section">
            <h2>Separating Person, Entrepreneur and Organisation</h2>
            <p>
              “I am now about halfway through the program. I can already say
              that I’m applying many of the lessons learned directly to my
              business. An important insight gained through conversations with
              my coach, Ralph van Dam from Achmea, was making the distinction
              between myself as a person, my role as an entrepreneur, and my
              company. Before starting the program, these three things were
              heavily intertwined. It’s a trap many social entrepreneurs fall
              into without even realizing it. It isn't always healthy when the
              company consumes your identity.”
              <br />
              “Separating those three elements and keeping them distinct has
              been a genuine learning process for me, but also an eye-opener. It
              provides clarity and direction. Now I approach my business with
              greater calm and composure.”
            </p>
          </section>
          <blockquote>
            <p>
              “It gives me clarity and something to hold on to. Now I feel
              calmer and more relaxed within my organisation.”
            </p>
          </blockquote>
          <section id="experienced-entrepreneurs" className="article-section">
            <h2>Why Experienced Social Entrepreneurs Benefit Too</h2>
            <p>
              “My experience as a person and as a social entrepreneur is what I
              bring to the group. When I was asked to participate, my initial
              thought was: 'I’m not a starting entrepreneur; does this really
              offer any added value for me?' But nothing could be further from
              the truth. Every cohort features a mix of young ventures,
              entrepreneurs scaling rapidly, and a few entrepreneurs considering
              future business succession.”
            </p>
          </section>
          <blockquote>
            <p>
              “It is precisely the mix of young and experienced entrepreneurs
              that makes the program so valuable.”
            </p>
          </blockquote>
          <section id="strategy-leadership" className="article-section">
            <h2>What You Learn in the Program: Strategy and Leadership</h2>
            <p>
              “What I find strong about the program is that it addresses many
              diverse topics, all highly relevant to social entrepreneurs:
              making strategic choices, measuring impact, exploring funding
              opportunities, and developing leadership. There were modules
              covering subjects I was already quite familiar with, but it’s
              still great to get a refresher and add deeper context to that
              knowledge. On top of that, I notice I can occasionally contribute
              ideas to help the social entrepreneurs in my cohort. Through Peer
              Accountants, we work for social enterprises, so I’ve seen the
              inner workings of many businesses. I can use that insight to help
              others in my group move forward—and in return, I gain a wealth of
              knowledge from them.”
            </p>
          </section>
          <section id="impact-in-practice-SROI" className="article-section">
            <h2>Impact in Practice: How Peer Accountants Applies SROI</h2>
            <p>
              “Our clients, like us, are social enterprises. But we also serve
              international NGOs and companies with SROI requirements.
              SROI—Social Return on Investment—means that a company must
              dedicate a specific percentage of revenue from a government
              contract toward employing people who face barriers to the labor
              market. Because we directly employ these individuals, 100% of our
              invoices qualify toward that SROI target.”
            </p>
            <p>
              “We primarily work for mid-sized companies, offering them a full
              suite of accounting services in partnership with a larger audit
              firm that handles high-level advisory and official audits.”
            </p>
          </section>
        </main>
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3>Participant</h3>
            <div className="speakers-grid">
              <div className="speaker-item">
                <img
                  className="speaker-avatar"
                  src="/wstf/images/avatar/Otto-Reuchlin.png"
                  alt="Otto Reuchlin"
                />
                <div className="speaker-info">
                  <h4>Otto Reuchlin</h4>
                  <p>Founder, Peer Accountants</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="sidebar-card nav-card">
            <h3>In This Interview</h3>
            <ul>
              <li>
                <Link href={`${base}/interview/otto`}>
                  {" "}
                  1. Participating as a Social Entrepreneur{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/otto`}>
                  {" "}
                  2. Separating Person, Entrepreneur & Organisation{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/otto`}>
                  {" "}
                  3. Why Experienced Entrepreneurs Benefit{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/otto`}>
                  {" "}
                  4. Strategy, Impact & Leadership{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/otto`}>
                  {" "}
                  5. Impact in Practice: SROI{" "}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
