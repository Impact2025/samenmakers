/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit interview-fabian-leijten.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Good Leadership Starts With Your Life Purpose | Interview",
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
              Good Leadership Starts With Your Life Purpose
            </h2>
          </div>
          <p className="page-hero__description">
            Interview with
            <br />
            Fabian Leijten
            <br />
            Director, SlimInICT
            <br />
            Social Entrepreneurship Programme
          </p>
        </div>
      </section>
      <div className="container">
        <main className="main-content">
          <div className="article-feature-image">
            <img
              src="/wstf/images/interview/Fabian-profiel.jpg"
              alt="Fabian Leijten, director of SlimInICT"
            />
          </div>
          <p className="lead-paragraph">
            Participant Fabian Leijten has been an entrepreneur for almost 17
            years: 'I have never studied entrepreneurship. I have always made
            choices and taken steps based on my own insights. What you then
            notice is that you always run a little faster than the organization
            can follow. That sometimes creates some challenge internally. The
            Social Entrepreneurship Course (LSO) has given me tools to better
            translate.'
            <br />
            Fabian Leijten is director of SlimInICT, a training center aimed at
            people with a distance to the labor market. Fabian: 'Because we work
            with this group of people, you notice that there is a different
            climate than when you are commercially busy. Man is central. This
            requires a different approach. It's nice that this can be found in
            this training.'
          </p>
          <section id="section-1" className="article-section">
            <h2>Watch out for the place</h2>
            <p>
              The program includes several guest speakers. Especially the first
              weekend of the training made a huge impression on Fabian. The
              theme of 'Personal Leadership' was discussed there. Fabian:
              Entrepreneurship brings a lot of hustle and bustle. I like to work
              hard and tackle, but because of this I have almost no peace and I
              am busy day and night with SlimInICT and where I want to go with
              the company.
              <br />
              Professor Wessel Ganzevoort taught me during the Course to put a
              pass in place and also to think from my life purpose, in order to
              guarantee good leadership in relation to myself and my team. Why
              am I on earth? Who am I anyway? Why am I doing what I'm doing now?
              What do I want to achieve personally? That is different from
              purely wanting to get results and scoring. Now I have a
              theoretical framework for SlimInICT that ensures that I understand
              why we do something and whether we are doing it well or not and
              how we can improve and tighten it.'
            </p>
          </section>
          <blockquote>
            <p>
              “Why am I on earth? Who am I anyway? Why am I doing what I'm doing
              now?”
            </p>
          </blockquote>
          <section id="section-2" className="article-section">
            <h2>Awareness</h2>
            <p>
              Fabian immediately started working in his company with this
              awareness. 'We notice that we are now very busy with themes such
              as rhythm in discussions, clearly setting goals with each other
              and clearly phasing that. This way everyone knows what we are
              doing at all times. And that gives peace. This gives people space
              to contribute their own knowledge, ideas and enthusiasm in a way
              that keeps everything balanced.' In addition, the training for
              Fabian himself has also yielded something in the field of
              awareness: 'In recent months I have read about 25 books in
              response to tips about speakers. I never took that space at
              first.'
            </p>
          </section>
          <blockquote>
            <p>
              “This way everyone knows what we are doing at all times. And that
              gives peace.”
            </p>
          </blockquote>
          <section id="section-3" className="article-section">
            <h2>Additional knowledge</h2>
            <p>
              In addition to lectures by various guest speakers, attention will
              also be paid to funding and measurement during this training.
              According to Fabian, these parts also contribute to an important
              change in the existing pattern: 'Measurement is often applied
              incorrectly, making results unreliable and actually pointless.
              With this training you learn to measure more deeply and at the
              same time keep a close eye on the interests of different
              relationships.'
            </p>
          </section>
          <section id="section-4" className="article-section">
            <h2>Be open to new ideas</h2>
            <p>
              'All themes of LSO have been interesting, because it sets
              something in motion in yourself that makes you think and reflect',
              says Fabian. 'If you are open to new ideas, this can be valuable
              for your business. Also, don't be afraid to try new things. Use
              the information from this training to supplement your business,
              not to turn things around.'
            </p>
          </section>
          <blockquote>
            <p>
              “If you are open to new ideas, this can be valuable for your
              business.”
            </p>
          </blockquote>
        </main>
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3>Participant</h3>
            <div className="speakers-grid">
              <div className="speaker-item">
                <img
                  className="speaker-avatar"
                  src="/wstf/images/avatar/Fabian-profiel.jpg"
                  alt="Portrait of Fabian Leijten, director of SlimInICT"
                />
                <div className="speaker-info">
                  <h4>Fabian Leijten</h4>
                  <p>Director, SlimInICT</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="sidebar-card nav-card">
            <h3>In This Interview</h3>
            <ul>
              <li>
                <Link href={`${base}/interview/fabian-leijten`}>
                  {" "}
                  1. Watch out for the place{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/fabian-leijten`}>
                  {" "}
                  2. Awareness{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/fabian-leijten`}>
                  {" "}
                  3. Additional knowledge{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/fabian-leijten`}>
                  {" "}
                  4. Be open to new ideas{" "}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
