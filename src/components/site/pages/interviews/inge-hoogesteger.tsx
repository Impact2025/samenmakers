/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit interview-inge-hoogesteger.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "The Pieces Fell Into Place | Interview",
  description: "",
};

export function InterviewContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Interview</h1>
            <h2 className="page-hero__subtitle">The Pieces Fell Into Place</h2>
          </div>
          <p className="page-hero__description">
            Interview with
            <br />
            Inge Hoogesteger
            <br />
            Founder, Sjaal met Verhaal
            <br />
            Social Entrepreneurship Programme
          </p>
        </div>
      </section>
      <div className="container">
        <main className="main-content">
          <div className="article-feature-image">
            <img
              src="/wstf/images/interview/IngeHoogestegerg.jpg"
              alt="Inge Hoogesteger, founder of Sjaal met Verhaal"
            />
          </div>
          <p className="lead-paragraph">
            <strong>
              {" "}
              Year of Program: 2018
              <br />
              University: Nyenrode Business University{" "}
            </strong>
          </p>
          <p className="lead-paragraph">
            For years, Inge Hoogesteger worked in management positions at
            Randstad. After a trip through Nepal, she decided to radically
            change course. She founded Scarf with Story to help local
            entrepreneurs and now sells hip, handmade scarves and other products
            from Nepal and Thailand. She had many questions about social
            entrepreneurship. That is why she started the Social
            Entrepreneurship course at Nyenrode Business University in March
            2018. 'Without the course, I wouldn't have achieved so much now.'
            <br />
            'The questions I had were mainly in the field of legal forms and the
            financing of my company,' says Hoogesteger. 'But I also wanted to
            know more about things related to growth such as positioning,
            marketing and branding and how to approach this.' Hoogesteger
            deliberately chose this course because she felt that she was seen
            everywhere as a strange duck in the bite. For example, she was
            rejected several times for financing at banks, because they felt
            that Sjaal with story did not fit into the calibrated company
            picture. 'Social entrepreneurship is often seen as drowsy and dusty,
            too 'charity-like'. I just don't want that. It is a commercial
            company and we convert the profit into the inventory and with that
            we can grow. In addition, we support projects in Asia with it.'
          </p>
          <section id="section-1" className="article-section">
            <h2>Puzzle pieces</h2>
            <p>
              'The workshop with the Rabobank Foundation on funds proved to be
              very valuable to me. I later made an appointment with them and was
              finally able to arrange solid financing for my company. This did
              mean that I had to switch from a sole proprietorship to a BV in a
              very short time. Fortunately, I was already working on this during
              the course on the advice of other participants and teachers. This
              was the last push I needed and the puzzle pieces fell together.
              Because my company is now a BV, I am no longer liable as a private
              person. That gives a lot of peace. As a result, I am calmer, also
              towards my team. I can put mistakes into perspective.”
            </p>
          </section>
          <blockquote>
            <p>
              “This was the last push I needed and the puzzle pieces fell
              together.”
            </p>
          </blockquote>
          <section id="section-2" className="article-section">
            <h2>Other role</h2>
            <p>
              Hoogesteger also had a lot of use for the leadership training.
              There she realized that she now has to deal with the same topics
              in a completely different role. 'When I now have a performance
              interview with someone, I am not only the manager, but also the
              final boss, which makes me feel more responsible.' She also saw
              that different stages of a company include different employees.
              'Other participants said I wouldn't make it with the team I had,'
              she explains. 'Thanks to the apprenticeship, I dared to make the
              decision to hire an interim financial advisor. We are also going
              to investigate the German market, because we want to expand in
              Germany. This would never have happened without the course.'
            </p>
          </section>
          <blockquote>
            <p>
              “Thanks to the apprenticeship, I dared to make the decision to
              hire an interim financial advisor.”
            </p>
          </blockquote>
          <section id="section-3" className="article-section">
            <h2>Setting out strategy</h2>
            <p>
              'I definitely recommend the course to other social entrepreneurs.
              However, it is good to formulate a number of questions for
              yourself in advance, to which you are looking for an answer. Then
              it will benefit you much more and you will be more focused on
              strategy. I myself was not interested in strategy at all in the
              beginning. Now it is. I realized that as captain I have to set the
              course. My company and my team need that.”
            </p>
          </section>
          <blockquote>
            <p>
              “I realized that as captain I have to set the course. My company
              and my team need that.”
            </p>
          </blockquote>
          <section className="article-section">
            <p>
              During the Social Entrepreneurship course, you will delve into
              theory, practice and your own leadership to find the right balance
              between ideals and making a profit. You will learn how to take
              your business to the next phase. After following the course, you
              will have a lot of theoretical and practical knowledge focused on
              both your personal and business growth.
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
                  src="/wstf/images/avatar/IngeHoogestegerg.jpg"
                  alt="Portrait of Inge Hoogesteger, founder of Sjaal met Verhaal"
                />
                <div className="speaker-info">
                  <h4>Inge Hoogesteger</h4>
                  <p>Founder, Sjaal met Verhaal</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="sidebar-card nav-card">
            <h3>In This Interview</h3>
            <ul>
              <li>
                <Link href={`${base}/interview/inge-hoogesteger`}>
                  {" "}
                  1. Puzzle pieces{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/inge-hoogesteger`}>
                  {" "}
                  2. Other role{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/inge-hoogesteger`}>
                  {" "}
                  3. Setting out strategy{" "}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
