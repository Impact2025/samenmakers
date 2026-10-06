/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit interview-hidde-blom.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Successful Employment Participation Starts With Equality | Interview",
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
              Successful Employment Participation Starts With Equality
            </h2>
          </div>
          <p className="page-hero__description">
            Interview with
            <br />
            Hidde Blom
            <br />
            Founder and Owner, Theezaakje
            <br />
            Social Entrepreneurship Programme
          </p>
        </div>
      </section>
      <div className="container">
        <main className="main-content">
          <div className="article-feature-image">
            <img
              src="/wstf/images/interview/Hidde-Blom.jpg"
              alt="Hidde Blom, founder and owner of Theezaakje"
            />
          </div>
          <p className="lead-paragraph">
            'When I started my business, it was important for me to help people
            work who are struggling to find a regular job. From home I am a
            social worker. My team consists of people with mental or physical
            disability, who do want and can work.' Hidde Blom, founder and owner
            of the Theezaakje, a tea house and webshop in Nijmegen, is speaking.
            When he started the organization about four years ago, he didn't
            know much about entrepreneurship. He decided to follow the Social
            Entrepreneurship course at Nyenrode Business University last year.
            <br />
            During the course, Blom realized how much influence your personality
            has on your business and how you run your business. 'I tend to have
            some reserve, but now I dare to stand better for what I want. Also
            in contact with, for example, the municipality or commercial
            cooperation partners. I can now make it clearer what my interests
            are and why they are important to me. And make no more compromises
            in that regard.' He is also more direct in the field of
            communication within his company and sees the importance of open
            communication more. Blom: 'If something rubs, you have to ring the
            bell and pay attention to it. Now I pay more attention to that.'
          </p>
          <section id="section-1" className="article-section">
            <h2>Enjoy your work</h2>
            <p>
              Personal leadership was one of Blom's most inspiring parts of the
              course. 'For example, I gained insight into where I stand in the
              organization. I also learned to shape my personal goals and values
              and to see how they can be expressed in my company.' Blom gives as
              an example of how he formulated four values: fun, creativity,
              connection/open communication and development. He explains how
              these four values work in everything. 'If you enjoy your work, are
              nice and creative and pleasant to interact with colleagues,
              personal development actually comes naturally. But even if we now
              develop a new tea flavor, it should radiate pleasure and it should
              look creative, be unique. It is important that the person who
              makes it and invents it expresses himself.'
            </p>
          </section>
          <blockquote>
            <p>
              “If you enjoy your work, are nice and creative and pleasant to
              interact with colleagues, personal development actually comes
              naturally.”
            </p>
          </blockquote>
          <section id="section-2" className="article-section">
            <h2>From sole proprietorship to cooperative</h2>
            <p>
              During the training course, Blom was also able to work on an issue
              that was very relevant to him. 'I started the Theezaakje as a sole
              proprietorship, but had wanted a different legal form for a long
              time. During the course, I talked a lot about and researched the
              advantages and disadvantages of the different legal forms.' The
              result: the Theezaakje becomes a cooperative of and for people
              with distance to the labor market. 'I believe that successful job
              participation starts with the idea that everyone is equal. That
              everyone can make a valuable contribution to a company, community
              or collective with his or her qualities and possibilities. For
              that reason, Het Theezaakje is becoming a cooperative in which
              everyone gets a voice that must be taken seriously. An employee
              cooperative in which the limitation of the individual is
              compensated by the possibilities of the majority.'
            </p>
          </section>
          <blockquote>
            <p>
              “I believe that successful job participation starts with the idea
              that everyone is equal.”
            </p>
          </blockquote>
          <section id="section-3" className="article-section">
            <h2>Largest tea brand</h2>
            <p>
              'I definitely recommend the Social Entrepreneurship course to
              other social entrepreneurs. Together with the other participants,
              you explore the problems that everyone encounters and look for
              solutions. It helps you to look at your business from a distance.'
              And to the future. 'For the 'scale-up strategies' component, I
              came up with the BHAG to be the largest tea brand in the
              Netherlands in 2025. During the course, we worked out that goal in
              a group: how do we approach it, how do we shape it, how does it
              affect the social impact we have?' Blom adds with a laugh: 'If we
              become the largest tea brand in the Netherlands, it is partly
              thanks to Nyenrode.'
            </p>
          </section>
          <blockquote>
            <p>“It helps you to look at your business from a distance.”</p>
          </blockquote>
          <section className="article-section">
            <p>
              During the Social Entrepreneurship course, you will delve into the
              theoretical, practical and personal depths to find the right
              balance between ideals and making a profit. You will learn how to
              take your business to the next stage. After following the course,
              you will have a lot of theoretical and practical knowledge focused
              on both your personal and business growth.
            </p>
          </section>
          <section className="article-end">
            <p className="article-end__text">
              <strong>
                {" "}
                Hidde followed the intrapreneurship course in 2025 for his new
                initiative Tosss, a network cooperation for social return.{" "}
              </strong>
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
                  src="/wstf/images/avatar/Hidde-Blom.jpg"
                  alt="Portrait of Hidde Blom, founder and owner of Theezaakje"
                />
                <div className="speaker-info">
                  <h4>Hidde Blom</h4>
                  <p>Founder and Owner, Theezaakje</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="sidebar-card nav-card">
            <h3>In This Interview</h3>
            <ul>
              <li>
                <Link href={`${base}/interview/hidde-blom`}>
                  {" "}
                  1. Enjoy your work{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/hidde-blom`}>
                  {" "}
                  2. From sole proprietorship to cooperative{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/hidde-blom`}>
                  {" "}
                  3. Largest tea brand{" "}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
